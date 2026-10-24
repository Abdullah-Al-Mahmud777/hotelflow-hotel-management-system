// ---------------------------------------------------------------------------
// HotelFlow auth helpers — single source of truth for the login session.
// The login/register flow stores "token" + "user" in localStorage; every
// consumer (RequireAuth, Navbar, booking flow) reads through these helpers.
// NOTE: localStorage is touched only inside functions called from event
// handlers or effects — never during render (avoids hydration mismatch).
// ---------------------------------------------------------------------------

import { getApiUrl } from "../../lib/apiUrl";

function requestServerLogout() {
  if (typeof window === "undefined") return;
  try {
    // Fire-and-forget: clears the httpOnly auth cookie server-side.
    fetch(getApiUrl("/api/auth/logout"), {
      method: "POST",
      credentials: "include",
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}

export function getUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getToken() {
  try {
    return localStorage.getItem("token") || null;
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return Boolean(getToken() && getUser());
}

export function isAdmin() {
  const user = getUser();
  return Boolean(getToken() && user?.role === "admin");
}

// Persist a normal (user or admin) session.
export function setSession(token, user) {
  try {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  } catch {
    /* storage unavailable */
  }
}

// Admin panel reads these keys (kept in sync with the shared session so API
// calls made from admin pages carry a valid bearer token).
export function setAdminSession(token, user) {
  try {
    localStorage.setItem("adminToken", token);
    localStorage.setItem("adminEmail", user?.email || "");
    localStorage.setItem("adminUser", JSON.stringify(user || {}));
  } catch {
    /* storage unavailable */
  }
}

export function clearAdminSession() {
  try {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminUser");
  } catch {
    /* storage unavailable */
  }
}

export function logout() {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminUser");
  } catch {
    /* storage unavailable — nothing to clear */
  }
  requestServerLogout();
}

// Allow only same-origin paths ("/...") to prevent open-redirect attacks.
export function safeRedirect(to, fallback = "/rooms") {
  if (typeof to === "string" && to.startsWith("/") && !to.startsWith("//")) {
    return to;
  }
  return fallback;
}

// Where to send a logged-out visitor so auth can send them back afterwards.
export function loginUrlFor(path) {
  return `/login?redirect=${encodeURIComponent(path)}`;
}

// Call on HTTP 401: wipe the dead session and bounce to login, preserving
// the current page (path + query) so dates/guests are never lost.
export function handleExpiredSession() {
  logout();
  if (typeof window !== "undefined") {
    const here = window.location.pathname + window.location.search;
    window.location.href = loginUrlFor(here);
  }
}
