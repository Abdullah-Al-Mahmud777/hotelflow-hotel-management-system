import axios from "axios";

// Canonical base URL — inlined by Turbopack at build time.
// Priority: NEXT_PUBLIC_API_URL > fallback http://localhost:5000
// NOTE: no `typeof window` guard here. NEXT_PUBLIC_* is statically
// replaced in both Server and Client bundles, so the guard only
// freezes a wrong value during prerender and causes relative-path 404s.
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

if (typeof window !== "undefined" && !process.env.NEXT_PUBLIC_API_URL) {
  console.warn(
    `[apiClient] NEXT_PUBLIC_API_URL is unset — falling back to ${API_BASE_URL}. ` +
      `Set it in client/.env.local and restart \`next dev\`.`
  );
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: { "Content-Type": "application/json" },
});

// Debug: prove every request is absolute (not hitting Next's own app/api).
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    const fullURL = `${config.baseURL || ""}${config.url || ""}`;
    if (!/^https?:\/\//.test(fullURL)) {
      console.error(
        `[apiClient] RELATIVE URL DETECTED → "${fullURL}". ` +
          `This hits Next.js :3000/app/api (404), NOT Express :5000. Check baseURL.`
      );
    } else if (process.env.NODE_ENV === "development") {
      console.log(`[apiClient] ${(config.method || "get").toUpperCase()} ${fullURL}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      console.error("[apiClient] 401 Unauthorized — redirecting to /login");
      window.location.href = "/login";
    }
    // Distinguish Next.js 404 (HTML) from Express 404 (JSON {success:false,path})
    if (error?.response?.status === 404) {
      const body = error.response.data;
      const isNext404 =
        typeof body === "string" && body.includes("<!DOCTYPE html>");
      console.error(
        `[apiClient] 404 on ${error.config?.baseURL || ""}${error.config?.url || ""} — ` +
          (isNext404
            ? "HTML body = request hit NEXT.JS :3000, not Express. baseURL/rewrites misconfigured."
            : `JSON body = reached Express but route missing. body=${JSON.stringify(body)}`)
      );
    }
    return Promise.reject(error);
  }
);

export default apiClient;
