import { ApiError } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const TOKEN = process.env.ABARA_INTERNAL_TOKEN!;

// Server-side only: direct call to abara-api with internal token
// Use this in Server Components and API routes ONLY
export async function apiServer<T>(
  path: string,
  options: RequestInit & { businessId?: string } = {},
): Promise<T> {
  const { businessId, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${TOKEN}`,
    ...(businessId ? { "X-Business-Id": businessId } : {}),
    ...(fetchOptions.headers as Record<string, string>),
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({
      error: "Request failed",
      code: "UNKNOWN",
    }));
    throw new Error(err.error ?? "API error");
  }

  return res.json() as Promise<T>;
}

// Client-side: calls the Next.js proxy (which adds the token server-side)
// Use this in Client Components
export async function apiClient<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`/api/proxy${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    },
  });

  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({
      error: "Request failed",
      code: "UNKNOWN",
    }));
    throw new Error(err.error ?? "API error");
  }

  return res.json() as Promise<T>;
}
