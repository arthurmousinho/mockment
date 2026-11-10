import type { CustomerWhereInput } from "../../../generated/prisma/models/Customer.ts";
import { buildSearchFilter } from "../../common/search.ts";

export function buildCustomerSearchFilter(search?: string): CustomerWhereInput {
  return buildSearchFilter<CustomerWhereInput>(search, [
    (term) => ({ id: { contains: term } }),
    (term) => ({ name: { contains: term } }),
    (term) => ({ email: { contains: term } }),
    (term) => ({ phone: { contains: term } }),
    (term) => ({ document: { contains: term } }),
    (term) => ({ externalId: { contains: term } }),
  ]);
}
