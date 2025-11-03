export interface PagedResponse<T> {
  meta: PageMetadata;
  items: T[];
}

export interface PageMetadata {
  page: number;
  pageSize: number;
  total: number;
  hasNext: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  traceId?: string;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
}
