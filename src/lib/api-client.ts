/**
 * Enterprise API Client Skeleton for Smart Menu.
 * Type-safe fetch wrapper prepared for TanStack Query integrations.
 */

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: data.message || "An unexpected error occurred",
        status: response.status,
      };
    }

    return {
      data,
      error: null,
      status: response.status,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Network error",
      status: 500,
    };
  }
}
