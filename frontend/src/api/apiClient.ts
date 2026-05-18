const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "https://localhost:7000/api";

export async function apiRequest<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
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
