/**
 * Enterprise Application Base URL Helper
 * Resolves application base URL for QR codes, links, and sharing.
 */
export function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.trim() !== "") {
    return process.env.NEXT_PUBLIC_APP_URL.trim().replace(/\/+$/, "");
  }

  if (typeof window !== "undefined" && window.location && window.location.origin) {
    return window.location.origin.replace(/\/+$/, "");
  }

  return "http://localhost:3000";
}

export function getTableQrUrl(slug: string): string {
  const baseUrl = getAppBaseUrl();
  return `${baseUrl}/?table=${encodeURIComponent(slug)}`;
}
