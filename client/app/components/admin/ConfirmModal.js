"use client";

// ---------------------------------------------------------------------------
// HotelFlow admin ConfirmModal — destructive-action confirmation dialog.
// ---------------------------------------------------------------------------

import { TriangleAlert } from "lucide-react";

export default function ConfirmModal({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Confirm",
  danger = true,
  busy = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/55" onClick={() => !busy && onCancel()} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-fade-in dark:bg-slate-800">
        <span className={`grid h-11 w-11 place-items-center rounded-full ${danger ? "bg-red-100 dark:bg-red-500/15" : "bg-blue-100 dark:bg-blue-500/15"}`}>
          <TriangleAlert className={`h-5 w-5 ${danger ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"}`} />
        </span>
        <h3 className="mt-3 text-[16px] font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-1 text-[13.5px] text-slate-500 dark:text-slate-400">{message}</p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`flex-1 rounded-xl py-2.5 text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-50 ${
              danger ? "bg-[#DC2626] hover:bg-red-700" : "bg-[#2563EB] hover:bg-blue-700"
            }`}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
