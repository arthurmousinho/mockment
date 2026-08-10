import crypto from "node:crypto";
import { prismaSingleton } from "../../config/prisma.ts";
import type { CreateApiKeyInput } from "../schemas/api-key.schema.ts";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../../common/http-error.ts";
import type { PaginationInput } from "../../common/pagination.schema.ts";
import {
  buildPaginatedResponse,
  buildPrismaPaginationParams,
} from "../../common/utils.ts";

function generateKeyPair() {
  const rawKey = `sk_live_${crypto.randomBytes(32).toString("hex")}`;
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
  return { rawKey, keyHash };
}

async function create(input: CreateApiKeyInput) {
  const { rawKey, keyHash } = generateKeyPair();

  const createdApiKey = await prismaSingleton.apiKey.create({
    data: {
      name: input.name,
      keyHash,
    },
  });

  return {
    id: createdApiKey.id,
    name: createdApiKey.name,
    rawKey,
  };
}

async function findAll(paginationInput: PaginationInput) {
  const { skip, take } = buildPrismaPaginationParams(paginationInput);
  const [apiKeys, total] = await Promise.all([
    prismaSingleton.apiKey.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
      omit: { keyHash: true },
    }),
    prismaSingleton.apiKey.count(),
  ]);
  return buildPaginatedResponse({
    data: apiKeys,
    page: paginationInput.page,
    limit: paginationInput.limit,
    total,
  });
}

async function findById(id: string) {
  const apiKey = await prismaSingleton.apiKey.findUnique({ where: { id } });

  if (!apiKey) {
    throw new NotFoundError(`Api Key with ID ${id} was not found.`);
  }

  return apiKey;
}

async function revoke(id: string) {
  const apiKey = await findById(id);

  if (apiKey.revokedAt) {
    throw new ConflictError(`Api Key with ID ${id} was already revoked.`);
  }

  await prismaSingleton.apiKey.update({
    where: { id: apiKey.id },
    data: { revokedAt: new Date() },
  });
}

async function remove(id: string) {
  const apiKey = await findById(id);
  await prismaSingleton.apiKey.delete({
    where: { id: apiKey.id },
  });
}

async function rotate(id: string) {
  const apiKey = await findById(id);

  if (apiKey.revokedAt) {
    throw new ConflictError(`Api Key with ID ${id} is revoked.`);
  }

  const { rawKey, keyHash } = generateKeyPair();

  await prismaSingleton.apiKey.update({
    where: { id: apiKey.id },
    data: { keyHash },
  });

  return { rawKey };
}

async function validate(rawKey: string) {
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

  const apiKey = await prismaSingleton.apiKey.findUnique({
    where: { keyHash },
  });

  if (!apiKey) {
    throw new UnauthorizedError("Invalid API Key.");
  }

  if (apiKey.revokedAt) {
    throw new UnauthorizedError("API Key revoked.");
  }

  return apiKey;
}

export const apiKeyService = {
  create,
  findAll,
  revoke,
  remove,
  validate,
  rotate,
};
