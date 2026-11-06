import { WebhookDeliveryStatus } from "../../../generated/prisma/enums.ts";
import type { WebhookDeliveryWhereInput } from "../../../generated/prisma/models/WebhookDelivery.ts";
import { buildSearchFilter } from "../../common/search.ts";

export function buildWebhookDeliverySearchFilter(
  search?: string,
): WebhookDeliveryWhereInput {
  return buildSearchFilter<WebhookDeliveryWhereInput>(search, [
    (term) => ({ id: { contains: term } }),
    (term) => ({ eventId: { contains: term } }),
    (term) => ({ endpointId: { contains: term } }),
    (term) => ({ endpoint: { url: { contains: term } } }),
    (term) => ({ error: { contains: term } }),
    (term) => ({
      status: {
        in: Object.values(WebhookDeliveryStatus).filter((status) =>
          status.includes(term.toUpperCase()),
        ),
      },
    }),
  ]);
}
