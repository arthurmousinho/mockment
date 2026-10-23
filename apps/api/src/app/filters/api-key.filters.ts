import type { ApiKeyWhereInput } from "../../../generated/prisma/models/ApiKey.ts";
import { buildSearchFilter } from "../../common/search.ts";

export function buildApiKeySearchFilter(search?: string): ApiKeyWhereInput {
  return buildSearchFilter<ApiKeyWhereInput>(search, [
    (term) => ({ id: { contains: term } }),
    (term) => ({ name: { contains: term } }),
  ]);
}
