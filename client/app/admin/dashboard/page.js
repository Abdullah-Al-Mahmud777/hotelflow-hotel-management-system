"use client";

// ---------------------------------------------------------------------------
// Legacy admin dashboard route (/admin/dashboard).
// The admin panel now lives at /admin (new shell + full dashboard). This
// route only redirects there so the old inner AdminSidebar never renders a
// duplicate sidebar inside the new layout. No dashboard functionality is
// lost — /admin has the Analytics dashboard, KPIs, Booking Status, Revenue
// charts and Recent Activity.
// ---------------------------------------------------------------------------

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboardLegacyRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Redirecting to dashboard">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-[#2563EB]" />
        <p className="mt-3 text-[13px] font-semibold text-slate-500">Opening dashboard…</p>
      </div>
    </div>
  );
}
