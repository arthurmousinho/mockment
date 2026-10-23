import type { WebhookEndpointWhereInput } from "../../../generated/prisma/models/WebhookEndpoint.ts";
import { buildSearchFilter } from "../../common/search.ts";

export function buildWebhookEndpointSearchFilter(
  search?: string,
): WebhookEndpointWhereInput {
  return buildSearchFilter<WebhookEndpointWhereInput>(search, [
    (term) => ({ id: { contains: term } }),
    (term) => ({ url: { contains: term } }),
    (term) => ({ apiKeyId: { contains: term } }),
  ]);
}
