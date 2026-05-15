import backendUrl from "../../config";
import type { ApiResponse } from "../interfaces/api.interface";

const AUTH_TOKEN_STORAGE_KEY = "autocare.authToken";
const AUTH_USER_STORAGE_KEY = "autocare.authUser";

export const AUTH_STORAGE_KEYS = {
  token: AUTH_TOKEN_STORAGE_KEY,
  user: AUTH_USER_STORAGE_KEY,
};

export function getStoredAuthToken(): null | string {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

interface ApiRequestOptions {
  body?: unknown;
  headers?: Record<string, string>;
  method?: "DELETE" | "GET" | "PATCH" | "POST" | "PUT";
  signal?: AbortSignal;
  skipAuth?: boolean;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  const {
    body,
    headers = {},
    method = "GET",
    signal,
    skipAuth = false,
  } = options;

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...headers,
  };

  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders["Content-Type"] = "application/json";
  }

  if (!skipAuth) {
    const token = getStoredAuthToken();

    if (token) {
      finalHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const url = path.startsWith("http") ? path : `${backendUrl}${path}`;

  let response: Response;

  try {
    response = await fetch(url, {
      body:
        body === undefined
          ? undefined
          : body instanceof FormData
            ? body
            : JSON.stringify(body),
      headers: finalHeaders,
      method,
      signal,
    });
  } catch (error) {
    if ((error as { name?: string })?.name === "AbortError") {
      throw error;
    }

    return {
      success: false,
      message: "Unable to reach the server. Please check your connection.",
      statusCode: 0,
    } satisfies ApiResponse<T>;
  }

  let payload: ApiResponse<T> | null = null;

  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    payload = null;
  }

  if (payload && typeof payload === "object" && "success" in payload) {
    return payload;
  }

  return {
    success: response.ok,
    message: response.ok
      ? "Request completed successfully."
      : `Request failed with status ${response.status}.`,
    statusCode: response.status,
  } satisfies ApiResponse<T>;
}

export function getApiErrorMessage<T>(response: ApiResponse<T>): string {
  if (response.errors && response.errors.length > 0) {
    return response.errors.join(" ");
  }

  if (response.message && response.message.trim().length > 0) {
    return response.message;
  }

  return "Something went wrong. Please try again.";
}
