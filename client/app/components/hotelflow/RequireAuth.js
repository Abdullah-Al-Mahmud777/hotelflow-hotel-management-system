"use client";

// ---------------------------------------------------------------------------
// HotelFlow RequireAuth — wraps any page that needs a login.
// - Shows a centered loading spinner while checking (no flicker, and the
//   server + first client render output identical HTML: no hydration issue).
// - Logged out → redirects to /login?redirect=<current path + query>.
// - `roles`: optional allow-list (e.g. ["user"]). A logged-in user whose
//   role is not listed is sent away (admins → /admin, others → /).
// ---------------------------------------------------------------------------

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function RequireAuth({ children, roles }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const rolesKey = (roles || []).join(",");

  useEffect(() => {
    let user = null;
    let token = null;
    try {
      token = localStorage.getItem("token");
      const raw = localStorage.getItem("user");
      user = raw ? JSON.parse(raw) : null;
    } catch {
      user = null;
      token = null;
    }
    if (!token || !user) {
      const here =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : pathname;
      router.replace(`/login?redirect=${encodeURIComponent(here)}`);
      return;
    }
    const allowed = rolesKey.split(",").filter(Boolean);
    if (allowed.length > 0 && !allowed.includes(user.role)) {
      router.replace(user.role === "admin" ? "/admin" : "/");
      return;
    }
    // Auth gate: reaching here means all checks passed, so revealing the
    // page is the effect's purpose — the lint rule is silenced on purpose.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
  }, [router, pathname, rolesKey]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F6FA]" role="status" aria-label="Checking login">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-[#5B5BE6]" />
          <p className="mt-3 text-[13px] font-semibold text-slate-500">Checking login…</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
