import type { PaymentWhereInput } from "../../../generated/prisma/models/Payment.ts";
import { buildSearchFilter } from "../../common/search.ts";

export function buildPaymentSearchFilter(search?: string): PaymentWhereInput {
  return buildSearchFilter<PaymentWhereInput>(search, [
    (term) => ({ id: { contains: term } }),
    (term) => ({ description: { contains: term } }),
    (term) => ({ externalId: { contains: term } }),
    (term) => ({ idempotencyKey: { contains: term } }),
  ]);
}
