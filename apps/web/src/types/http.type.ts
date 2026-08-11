export type APIError = {
  error: string;
  code: number;
  message: string[];
};

export type PaginatedAPIResponse<T> = {
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

export type PaginatedRequest = {
  page?: number;
  limit?: number;
};
