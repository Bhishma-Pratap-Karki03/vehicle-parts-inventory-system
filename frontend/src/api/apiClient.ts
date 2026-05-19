import backendUrl from "../config";
import { AUTH_STORAGE_KEYS } from "../shared/utils/api";

const API_BASE_URL = backendUrl ? `${backendUrl}/api` : "/api";

export async function apiRequest<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.token);

    const requestBody =
        options?.body &&
        typeof options.body !== "string" &&
        !(options.body instanceof FormData)
            ? JSON.stringify(options.body)
            : options?.body;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        body: requestBody,
        headers: {
            ...(requestBody instanceof FormData ? {} : { "Content-Type": "application/json" }),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options?.headers || {}),
        },
    });

    if (!response.ok) {
        const errorText = await response.text();

        if (errorText) {
            let errorJson: { message?: string; errors?: string[] } | null = null;

            try {
                errorJson = JSON.parse(errorText) as {
                    message?: string;
                    errors?: string[];
                };
            } catch {
                errorJson = null;
            }

            if (errorJson) {
                const details = errorJson.errors?.length
                    ? ` ${errorJson.errors.join(" ")}`
                    : "";

                throw new Error(`${errorJson.message || "Request failed."}${details}`);
            }

            throw new Error(errorText);
        }

        throw new Error(`Request failed: ${response.status}`);
    }

    if (response.status === 204) {
        return null as T;
    }

    return response.json();
}
