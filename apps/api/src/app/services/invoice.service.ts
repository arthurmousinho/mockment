import { NotFoundError } from "../../common/http-error.ts";
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

  return prismaSingleton.invoice.create({
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

export const invoiceService = { create, findAll };
