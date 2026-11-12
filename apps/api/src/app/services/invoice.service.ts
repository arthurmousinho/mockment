import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnprocessableEntityError,
} from "../../common/http-error.ts";
import { readFile, unlink } from "node:fs/promises";
import type { InvoiceStatus } from "../../../generated/prisma/enums.ts";
import {
  buildPaginatedResponse,
  buildPrismaPaginationParams,
  createPrefixedId,
} from "../../common/utils.ts";
import { prismaSingleton } from "../../config/prisma.ts";
import { buildInvoiceSearchFilter } from "../filters/invoice.filters.ts";
import type {
  CreateInvoiceInput,
  InvoiceListInput,
  UpdateInvoiceInput,
} from "../schemas/invoice.schema.ts";
import { apiKeyService } from "./api-key.service.ts";
import { eventService } from "./event.service.ts";
import {
  generateInvoicePdf,
  getInvoicePdfPath,
} from "../../config/invoice-pdf.ts";
import { paymentService } from "./payment.service.ts";
import { customerService } from "./customer.service.ts";

async function create(apiKey: string, input: CreateInvoiceInput) {
  await apiKeyService.validate(apiKey);

  const payment = await paymentService.findById(input.paymentId);
  await customerService.findById(input.customerId);

  if (payment.status !== "APPROVED") {
    throw new UnprocessableEntityError(
      "Only approved payments can be used to create invoices.",
    );
  }

  const existingInvoice = await prismaSingleton.invoice.findFirst({
    where: {
      // FIXME: Create a index on paymentId and customerId to improve performance
      paymentId: payment.id,
      customerId: input.customerId,
      status: { not: "CANCELED" },
    },
  });

  if (existingInvoice) {
    throw new ConflictError(
      "An valid invoice for this payment already exists.",
    );
  }

  const createdInvoice = await prismaSingleton.invoice.create({
    data: {
      id: createPrefixedId("inv"),
      status: "CREATED",
      customerId: input.customerId,
      amountInCents: payment.amountInCents,
      currency: payment.currency,
      paymentId: payment.id,
    },
  });

  await eventService.emit({
    paymentId: payment.id,
    type: "INVOICE_CREATED",
    invoiceId: createdInvoice.id,
    payload: createdInvoice,
  });

  return createdInvoice;
}

async function findAll(input: InvoiceListInput) {
  const { skip, take } = buildPrismaPaginationParams(input);
  const where = buildInvoiceSearchFilter(input.search);
  const [invoices, total] = await Promise.all([
    prismaSingleton.invoice.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prismaSingleton.invoice.count({ where }),
  ]);

  return buildPaginatedResponse({
    data: invoices,
    page: input.page,
    limit: input.limit,
    total,
  });
}

async function findById(id: string) {
  const invoice = await prismaSingleton.invoice.findUnique({
    where: { id },
  });

  if (!invoice) {
    throw new NotFoundError(`Invoice with ID ${id} was not found.`);
  }

  return invoice;
}

async function getDetails(id: string) {
  const invoice = await prismaSingleton.invoice.findUnique({
    where: { id },
    include: {
      events: {
        select: { id: true, type: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!invoice) {
    throw new NotFoundError(`Invoice with ID ${id} was not found.`);
  }

  return invoice;
}

async function update(id: string, input: UpdateInvoiceInput) {
  const invoice = await findById(id);

  if (invoice.status !== "CREATED") {
    throw new BadRequestError("Only created invoices can be updated.");
  }

  const updatedInvoice = await prismaSingleton.invoice.update({
    where: { id },
    data: {
      ...(input.customerName !== undefined && {
        customerName: input.customerName,
      }),
      ...(input.customerTaxId !== undefined && {
        customerTaxId: input.customerTaxId,
      }),
    },
  });

  return updatedInvoice;
}

async function remove(id: string) {
  const invoice = await findById(id);

  if (invoice.status !== "CREATED") {
    throw new BadRequestError("Only created invoices can be deleted.");
  }

  const deletedInvoice = await prismaSingleton.invoice.delete({
    where: { id },
  });

  return deletedInvoice;
}

async function getPdf(id: string) {
  const invoice = await findById(id);

  try {
    return await readFile(getInvoicePdfPath(invoice.id));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new NotFoundError(`PDF for invoice with ID ${id} was not found.`);
    }
    throw error;
  }
}

async function deletePdf(id: string) {
  try {
    await unlink(getInvoicePdfPath(id));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}

function validateStatusTransition(
  currentStatus: InvoiceStatus,
  newStatus: InvoiceStatus,
) {
  const validTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
    CREATED: ["PROCESSING", "CANCELED"],
    PROCESSING: ["ISSUED", "CANCELED"],
    ISSUED: ["CANCELED"],
    CANCELED: [],
  };

  if (!validTransitions[currentStatus].includes(newStatus)) {
    throw new BadRequestError(
      `Cannot change invoice status from ${currentStatus} to ${newStatus}.`,
    );
  }
}

async function process(id: string) {
  const invoice = await findById(id);
  validateStatusTransition(invoice.status, "PROCESSING");

  const processedInvoice = await prismaSingleton.invoice.update({
    where: { id: invoice.id },
    data: { status: "PROCESSING" },
  });

  await eventService.emit({
    paymentId: invoice.paymentId,
    invoiceId: invoice.id,
    type: "INVOICE_PROCESSING",
    payload: processedInvoice,
  });

  return processedInvoice;
}

async function issue(id: string) {
  const invoice = await findById(id);
  validateStatusTransition(invoice.status, "ISSUED");

  const issuedInvoice = await prismaSingleton.invoice.update({
    where: { id: invoice.id },
    data: {
      status: "ISSUED",
      issuedAt: new Date(),
    },
  });

  const customer = await customerService.findById(issuedInvoice.customerId);
  await generateInvoicePdf({ ...issuedInvoice, customer });

  await eventService.emit({
    paymentId: invoice.paymentId,
    type: "INVOICE_ISSUED",
    invoiceId: invoice.id,
    payload: issuedInvoice,
  });

  return issuedInvoice;
}

async function cancel(id: string) {
  const invoice = await findById(id);
  validateStatusTransition(invoice.status, "CANCELED");

  if (invoice.status === "ISSUED") {
    await deletePdf(invoice.id);
  }

  const canceledInvoice = await prismaSingleton.invoice.update({
    where: { id: invoice.id },
    data: { status: "CANCELED" },
  });

  await eventService.emit({
    paymentId: invoice.paymentId,
    invoiceId: invoice.id,
    type: "INVOICE_CANCELED",
    payload: canceledInvoice,
  });

  return canceledInvoice;
}

export const invoiceService = {
  create,
  findAll,
  findById,
  getDetails,
  update,
  remove,
  getPdf,
  process,
  issue,
  cancel,
};
