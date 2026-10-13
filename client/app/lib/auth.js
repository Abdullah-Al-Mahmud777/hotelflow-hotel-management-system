// ---------------------------------------------------------------------------
// HotelFlow auth helpers — single source of truth for the login session.
// The login/register flow stores "token" + "user" in localStorage; every
// consumer (RequireAuth, Navbar, booking flow) reads through these helpers.
// NOTE: localStorage is touched only inside functions called from event
// handlers or effects — never during render (avoids hydration mismatch).
// ---------------------------------------------------------------------------

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

export function logout() {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  } catch {
    /* storage unavailable — nothing to clear */
  }
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
