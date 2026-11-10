import { Prisma } from "../../../generated/prisma/client.ts";
import { ConflictError, NotFoundError } from "../../common/http-error.ts";
import { createPrefixedId } from "../../common/utils.ts";
import { prismaSingleton } from "../../config/prisma.ts";
import type { CreateCustomerInput } from "../schemas/customer.schema.ts";

async function create(input: CreateCustomerInput) {
  await checkDocumentUniqueness(input.document);
  await checkEmailUniqueness(input.email);

  if (input.externalId) {
    await checkExternalIdUniqueness(input.externalId);
  }

  const createdCustomer = await prismaSingleton.customer.create({
    data: {
      id: createPrefixedId("cus"),
      name: input.name,
      phone: input.phone,
      document: input.document,
      email: input.email,
      externalId: input.externalId ?? null,
    },
  });

  return createdCustomer;
}

async function checkEmailUniqueness(email: string) {
  const customerWithEmail = await prismaSingleton.customer.findUnique({
    where: { email },
  });

  if (customerWithEmail) {
    throw new ConflictError("Customer with this email already exists.");
  }
}

async function checkDocumentUniqueness(document: string) {
  const customerWithDocument = await prismaSingleton.customer.findUnique({
    where: { document },
  });

  if (customerWithDocument) {
    throw new ConflictError("Customer with this document already exists.");
  }
}

async function checkExternalIdUniqueness(externalId: string) {
  const customerWithExternalId = await prismaSingleton.customer.findUnique({
    where: { externalId },
  });

  if (customerWithExternalId) {
    throw new ConflictError(
      `Customer with externalId ${externalId} already exists.`,
    );
  }
}

export const customerService = { create };
