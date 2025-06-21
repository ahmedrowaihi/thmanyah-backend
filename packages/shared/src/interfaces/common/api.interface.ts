// Generic API response interface
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  timestamp?: string;
}

// Generic paginated API response interface
export interface PaginatedApiResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
  success: boolean;
}

// API error response interface
export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    statusCode: number;
    timestamp: string;
  };
}
