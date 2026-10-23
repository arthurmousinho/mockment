import type { SubscriptionWhereInput } from "../../../generated/prisma/models/Subscription.ts";
import { buildSearchFilter } from "../../common/search.ts";

export function buildSubscriptionSearchFilter(
  search?: string,
): SubscriptionWhereInput {
  return buildSearchFilter<SubscriptionWhereInput>(search, [
    (term) => ({ id: { contains: term } }),
    (term) => ({ description: { contains: term } }),
  ]);
}
