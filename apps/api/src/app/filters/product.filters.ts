import type { ProductWhereInput } from "../../../generated/prisma/models/Product.ts";
import { buildSearchFilter } from "../../common/search.ts";

export function buildProductSearchFilter(search?: string): ProductWhereInput {
  return buildSearchFilter<ProductWhereInput>(search, [
    (term) => ({ id: { contains: term } }),
    (term) => ({ name: { contains: term } }),
    (term) => ({ description: { contains: term } }),
    (term) => ({ externalId: { contains: term } }),
  ]);
}
