import { Prisma } from "../../../generated/prisma/client.ts";
import { ConflictError, NotFoundError } from "../../common/http-error.ts";
import {
  buildPaginatedResponse,
  buildPrismaPaginationParams,
  createPrefixedId,
} from "../../common/utils.ts";
import { prismaSingleton } from "../../config/prisma.ts";
import { buildCustomerSearchFilter } from "../filters/customer.filters.ts";
import type {
  CreateCustomerInput,
  CustomerListInput,
  UpdateCustomerInput,
} from "../schemas/customer.schema.ts";

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

async function findAll(input: CustomerListInput) {
  const { skip, take } = buildPrismaPaginationParams(input);
  const where = buildCustomerSearchFilter(input.search);
  const [customers, total] = await Promise.all([
    prismaSingleton.customer.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prismaSingleton.customer.count({ where }),
  ]);
  return buildPaginatedResponse({
    data: customers,
    page: input.page,
    limit: input.limit,
    total,
  });
}

async function findById(id: string) {
  const customer = await prismaSingleton.customer.findUnique({ where: { id } });

  if (!customer) {
    throw new NotFoundError(`Customer with ID ${id} was not found.`);
  }

  return customer;
}

async function update(id: string, input: UpdateCustomerInput) {
  await findById(id);

  if (input.email !== undefined) {
    await checkEmailUniqueness(input.email, id);
  }

  if (input.document !== undefined) {
    await checkDocumentUniqueness(input.document, id);
  }

  if (input.externalId !== undefined) {
    await checkExternalIdUniqueness(input.externalId, id);
  }

  const updatedCustomer = await prismaSingleton.customer.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.email !== undefined && { email: input.email }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.document !== undefined && { document: input.document }),
      ...(input.externalId !== undefined && { externalId: input.externalId }),
    },
  });

  return updatedCustomer;
}

async function checkEmailUniqueness(email: string, customerId?: string) {
  const customerWithEmail = await prismaSingleton.customer.findUnique({
    where: { email },
  });

  if (customerWithEmail && customerWithEmail.id !== customerId) {
    throw new ConflictError("Customer with this email already exists.");
  }
}

async function checkDocumentUniqueness(document: string, customerId?: string) {
  const customerWithDocument = await prismaSingleton.customer.findUnique({
    where: { document },
  });

  if (customerWithDocument && customerWithDocument.id !== customerId) {
    throw new ConflictError("Customer with this document already exists.");
  }
}

async function checkExternalIdUniqueness(
  externalId: string,
  customerId?: string,
) {
  const customerWithExternalId = await prismaSingleton.customer.findUnique({
    where: { externalId },
  });

  if (customerWithExternalId && customerWithExternalId.id !== customerId) {
    throw new ConflictError(
      `Customer with externalId ${externalId} already exists.`,
    );
  }
}

export const customerService = { create, findAll, findById, update };
