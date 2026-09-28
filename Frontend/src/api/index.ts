import type { User } from "../types/chat";
export type {
  User,
  Message,
  Conversation,
  Group,
  Request,
  Chat,
} from "../types/chat";
export const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
export function ident(value: User | string | undefined | null): string {
  return typeof value === "string"
    ? value
    : value?.id || (value as User & { _id?: string })?._id || "";
}
export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("ring_token");
  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData))
    headers.set("Content-Type", "application/json");
  let response: Response;
  try {
    response = await fetch(`${base}${path}`, { ...options, headers });
  } catch {
    throw new Error(
      "Cannot reach the backend. Start it on port 5000 and check MongoDB.",
    );
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(data.message || `Request failed (${response.status})`);
  return data as T;
}
export function json(method: string, body: unknown): RequestInit {
  return { method, body: JSON.stringify(body) };
}
