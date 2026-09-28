import { base } from "../api";

export function mediaUrl(value?: string | null): string {
  if (!value) return "";
  if (value.startsWith("/uploads/")) return `${base}${value}`;
  return value;
}
