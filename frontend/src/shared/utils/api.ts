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

function buildRequestOptions(path: string, options: ApiRequestOptions = {}) {
  const {
    body,
    headers = {},
    method = "GET",
    signal,
    skipAuth = false,
  } = options

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...headers,
  }

  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders["Content-Type"] = "application/json"
  }

  if (!skipAuth) {
    const token = getStoredAuthToken()

    if (token) {
      finalHeaders.Authorization = `Bearer ${token}`
    }
  }

  const url = path.startsWith("http") ? path : `${backendUrl}${path}`

  return {
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body),
    headers: finalHeaders,
    method,
    signal,
    url,
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  const requestOptions = buildRequestOptions(path, options)

  let response: Response

  try {
    response = await fetch(requestOptions.url, requestOptions)
  } catch (error) {
    if ((error as { name?: string })?.name === "AbortError") {
      throw error
    }

    return {
      success: false,
      message: "Unable to reach the server. Please check your connection.",
      statusCode: 0,
    } satisfies ApiResponse<T>
  }

  let payload: ApiResponse<T> | null = null

  try {
    payload = (await response.json()) as ApiResponse<T>
  } catch {
    payload = null
  }

  if (payload && typeof payload === "object" && "success" in payload) {
    return payload
  }

  return {
    success: response.ok,
    message: response.ok
      ? "Request completed successfully."
      : `Request failed with status ${response.status}.`,
    statusCode: response.status,
  } satisfies ApiResponse<T>
}

export async function apiRequestBlob(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<Blob>> {
  const requestOptions = buildRequestOptions(path, {
    ...options,
    headers: {
      Accept: "*/*",
      ...(options.headers ?? {}),
    },
  })

  let response: Response

  try {
    response = await fetch(requestOptions.url, requestOptions)
  } catch (error) {
    if ((error as { name?: string })?.name === "AbortError") {
      throw error
    }

    return {
      success: false,
      message: "Unable to reach the server. Please check your connection.",
      statusCode: 0,
    } satisfies ApiResponse<Blob>
  }

  if (!response.ok) {
    try {
      const payload = (await response.json()) as ApiResponse<never>

      if (payload && typeof payload === "object" && "success" in payload) {
        return {
          success: false,
          message: payload.message,
          errors: payload.errors,
          statusCode: payload.statusCode ?? response.status,
        }
      }
    } catch {
      // Ignore JSON parsing issues and fall back to the status-based message below.
    }

    return {
      success: false,
      message: `Request failed with status ${response.status}.`,
      statusCode: response.status,
    } satisfies ApiResponse<Blob>
  }

  return {
    success: true,
    message: "Request completed successfully.",
    data: await response.blob(),
    statusCode: response.status,
  } satisfies ApiResponse<Blob>
}

export function downloadBlob(blob: Blob, fileName: string) {
  const objectUrl = window.URL.createObjectURL(blob)
  const downloadLink = document.createElement("a")

  downloadLink.href = objectUrl
  downloadLink.download = fileName
  document.body.appendChild(downloadLink)
  downloadLink.click()
  downloadLink.remove()
  window.URL.revokeObjectURL(objectUrl)
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
