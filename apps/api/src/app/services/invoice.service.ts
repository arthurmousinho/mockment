import { NotFoundError } from "../../common/http-error.ts";
import { createPrefixedId } from "../../common/utils.ts";
import { prismaSingleton } from "../../config/prisma.ts";
import type { CreateInvoiceInput } from "../schemas/invoice.schema.ts";
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

export const invoiceService = { create };
