import { auth } from "@clerk/nextjs/server";
import { ApiError } from "@/types";

const API_URL = process.env.INTERNAL_API_URL!;
const TOKEN = process.env.INTERNAL_SERVICE_TOKEN!;

// Server-side only: direct call to abara-api with internal token.
// Use this in Server Components, Server Actions, and Route Handlers ONLY.
export async function apiServer<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const { sessionClaims } = await auth();
  const businessId = sessionClaims?.publicMetadata?.businessId as
    | string
    | undefined;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${TOKEN}`,
    ...(businessId ? { "X-Business-Id": businessId } : {}),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
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

// Client-side: calls the Next.js proxy (which adds the token + businessId
// server-side via the route handler). Use this in Client Components.
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
