import type { FastifyRequest } from "fastify";
import { UnauthorizedError } from "../../common/http-error.ts";
import { apiKeyService } from "../services/api-key.service.ts";

export async function authMiddleware(request: FastifyRequest) {
  const authorization = request.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Api Key is missing.");
  }

  await apiKeyService.validate(authorization.slice("Bearer ".length));
}
