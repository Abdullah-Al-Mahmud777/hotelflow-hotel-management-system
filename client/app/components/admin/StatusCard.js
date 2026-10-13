"use client";

// ---------------------------------------------------------------------------
// HotelFlow admin StatusCard — booking status breakdown (Pending, Approved,
// Rejected, Cancelled, Completed) with colored dot, count and progress bar.
// ---------------------------------------------------------------------------

const ORDER = [
  { key: "pending", label: "Pending", dot: "#F59E0B" },
  { key: "approved", label: "Approved", dot: "#2563EB" },
  { key: "rejected", label: "Rejected", dot: "#DC2626" },
  { key: "cancelled", label: "Cancelled", dot: "#64748B" },
  { key: "completed", label: "Completed", dot: "#16A34A" },
];

export default function StatusCard({ counts = {}, loading = false }) {
  const total = ORDER.reduce((s, o) => s + (counts[o.key] || 0), 0);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">Booking Status</h3>
      <p className="text-[12.5px] text-slate-500 dark:text-slate-400">
        {total} booking{total === 1 ? "" : "s"} in range
      </p>
      {loading ? (
        <div className="mt-4 animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 rounded bg-slate-100 dark:bg-slate-700" />
          ))}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {ORDER.map((o) => {
            const n = counts[o.key] || 0;
            const pct = total ? Math.round((n / total) * 100) : 0;
            return (
              <div key={o.key}>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: o.dot }} />
                    {o.label}
                  </span>
                  <span className="font-black tabular-nums text-slate-900 dark:text-white">
                    {n} <span className="font-semibold text-slate-400">({pct}%)</span>
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: o.dot }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
