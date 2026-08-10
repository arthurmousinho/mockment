import type { PaginationInput } from "./pagination.schema.ts";

export function buildPrismaPaginationParams(input: PaginationInput) {
  return {
    skip: (input.page - 1) * input.limit,
    take: input.limit,
  };
}

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

type BuildPaginatedResponseInput<T> = {
  data: T[];
  page: number;
  limit: number;
  total: number;
};

export function buildPaginatedResponse<T>(
  input: BuildPaginatedResponseInput<T>,
): PaginatedResponse<T> {
  return {
    data: input.data,
    pagination: {
      page: input.page,
      limit: input.limit,
      total: input.total,
      totalPages: Math.ceil(input.total / input.limit),
      hasNextPage: input.page * input.limit < input.total,
      hasPreviousPage: input.page > 1,
    },
  };
}
