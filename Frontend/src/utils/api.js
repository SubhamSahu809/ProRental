// Centralized API base for both local + production.
// Vercel: set VITE_API_BASE_URL to your Render backend URL, e.g. https://your-app.onrender.com
// Local dev: falls back to http://localhost:8080

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");

export function apiUrl(pathname = "/") {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${API_BASE_URL}${path}`;
}

