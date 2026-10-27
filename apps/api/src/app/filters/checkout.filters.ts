import type { CheckoutWhereInput } from "../../../generated/prisma/models/Checkout.ts";
import { buildSearchFilter } from "../../common/search.ts";

export function buildCheckoutSearchFilter(search?: string): CheckoutWhereInput {
  return buildSearchFilter<CheckoutWhereInput>(search, [
    (term) => ({ id: { contains: term } }),
    (term) => ({ paymentId: { contains: term } }),
    (term) => ({ subscriptionId: { contains: term } }),
    (term) => ({ apiKeyId: { contains: term } }),
  ]);
}
