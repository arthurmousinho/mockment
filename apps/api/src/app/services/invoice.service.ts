import { BadRequestError, NotFoundError } from "../../common/http-error.ts";
import { readFile } from "node:fs/promises";
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
} from "../schemas/invoice.schema.ts";
import { apiKeyService } from "./api-key.service.ts";
import { eventService } from "./event.service.ts";
import {
  generateInvoicePdf,
  getInvoicePdfPath,
} from "../../config/invoice-pdf.ts";

async function create(apiKey: string, input: CreateInvoiceInput) {
  const validatedApiKey = await apiKeyService.validate(apiKey);
  const payment = await prismaSingleton.payment.findFirst({
    where: { id: input.paymentId, apiKeyId: validatedApiKey.id },
  });

  if (!payment) {
    throw new NotFoundError(
      `Payment with ID ${input.paymentId} was not found.`,
    );
  }

  const invoice = await prismaSingleton.invoice.create({
    data: {
      id: createPrefixedId("inv"),
      status: "CREATED",
      customerName: input.customerName,
      customerTaxId: input.customerTaxId ?? null,
      amountInCents: payment.amountInCents,
      currency: payment.currency,
      paymentId: payment.id,
    },
  });

  await eventService.emit({
    paymentId: payment.id,
    type: "INVOICE_CREATED",
    invoiceId: invoice.id,
    payload: invoice,
  });

  return invoice;
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

function validateStatusTransition(
  currentStatus: InvoiceStatus,
  newStatus: InvoiceStatus,
) {
  const validTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
    CREATED: ["PROCESSING", "CANCELED"],
    PROCESSING: ["ISSUED", "REJECTED", "CANCELED"],
    ISSUED: ["CANCELED"],
    REJECTED: [],
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

  await generateInvoicePdf(issuedInvoice);

  await eventService.emit({
    paymentId: invoice.paymentId,
    type: "INVOICE_ISSUED",
    invoiceId: invoice.id,
    payload: issuedInvoice,
  });

  return issuedInvoice;
}

export const invoiceService = {
  create,
  findAll,
  findById,
  getDetails,
  getPdf,
  process,
  issue,
};
