"use client";

// ---------------------------------------------------------------------------
// HotelFlow admin loading skeletons + friendly empty state.
// Render these while cards/charts/tables fetch, or when lists are empty.
// ---------------------------------------------------------------------------

import { SearchX } from "lucide-react";

export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mt-3 h-8 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mt-3 h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}

export function ChartSkeleton({ height = 280 }) {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="h-4 w-1/4 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mt-4 rounded-xl bg-slate-100 dark:bg-slate-700" style={{ height }} />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      <div className="border-b border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-700/40">
        <div className="h-4 w-1/4 rounded bg-slate-200 dark:bg-slate-700" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3 border-b border-slate-100 p-4 last:border-0 dark:border-slate-700">
          <div className="h-4 flex-1 rounded bg-slate-100 dark:bg-slate-700" />
          <div className="h-4 w-24 rounded bg-slate-100 dark:bg-slate-700" />
          <div className="h-4 w-16 rounded bg-slate-100 dark:bg-slate-700" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon = SearchX, title = "Nothing here yet", hint = "New items will appear in this list." }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-800">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 dark:bg-slate-700">
        <Icon className="h-6 w-6 text-slate-400" />
      </span>
      <h3 className="mt-4 text-[15px] font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">{hint}</p>
    </div>
  );
}
