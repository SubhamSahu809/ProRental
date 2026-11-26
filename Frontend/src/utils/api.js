// All API calls use relative URLs ("/api/...", "/users/...").
// - Production: vercel.json proxies them to the backend, so the session cookie is first-party.
// - Local dev: vite.config.js proxies them to http://localhost:8080.
// The old VITE_API_BASE_URL variable is deliberately ignored: calling the backend
// cross-site makes the session cookie third-party, which browsers block.
// Set VITE_API_ORIGIN only if you really need to call a backend directly
// (the backend then also needs COOKIE_SAMESITE=none).
export const API_BASE_URL = (import.meta.env.VITE_API_ORIGIN || "").replace(/\/$/, "");

export function apiUrl(pathname = "/") {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${API_BASE_URL}${path}`;
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/**
 * fetch wrapper: sends cookies, encodes JSON bodies, parses JSON responses,
 * and throws ApiError with the server's message on failure.
 */
export async function api(path, { body, headers, ...options } = {}) {
  const init = { credentials: "include", ...options, headers: { Accept: "application/json", ...headers } };

  if (body instanceof FormData) {
    init.body = body;
  } else if (body !== undefined) {
    init.body = JSON.stringify(body);
    init.headers["Content-Type"] = "application/json";
  }

  // The backend (Render free tier) sleeps when idle. While it wakes up it answers 503,
  // and the Vercel proxy may answer 502/504. Retry those transparently. 503 is always
  // safe to retry (the server didn't process the request); 502/504 only for GETs.
  const method = (init.method || "GET").toUpperCase();
  const retryable = (status) => status === 503 || (method === "GET" && (status === 502 || status === 504));
  const delays = [2000, 4000, 8000];

  let response;
  for (let attempt = 0; ; attempt++) {
    try {
      response = await fetch(apiUrl(path), init);
    } catch {
      throw new ApiError("Network error. Please check your connection and try again.", 0);
    }
    if (!retryable(response.status) || attempt >= delays.length) break;
    await new Promise((resolve) => setTimeout(resolve, delays[attempt]));
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const fallback =
      response.status === 502 || response.status === 503 || response.status === 504
        ? "The server is waking up. Please try again in a few seconds."
        : response.status >= 500
          ? "Server error. Please try again in a moment."
          : "Something went wrong.";
    throw new ApiError(data?.error || data?.message || fallback, response.status);
  }
  return data;
}
