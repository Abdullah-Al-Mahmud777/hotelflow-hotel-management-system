"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { Star, CircleCheck, TriangleAlert, Info, X } from "lucide-react";

// ---------- formatting helpers ----------
export function formatDate(v) {
  if (!v) return "—";
  return new Date(v).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(v) {
  if (!v) return "—";
  const d = new Date(v);
  return `${d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} at ${d.toLocaleTimeString()}`;
}

export function formatPrice(n) {
  const v = Number(n) || 0;
  return `৳${v.toLocaleString("en-IN")}`;
}

// ---------- consistent status badges (single source of truth) ----------
const BADGE_STYLES = {
  approved: "bg-green-100 text-green-800",
  paid: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  rejected: "bg-red-100 text-red-800",
  cancelled: "bg-slate-100 text-slate-700",
  "refund-pending": "bg-orange-100 text-orange-800",
  none: "bg-slate-100 text-slate-500",
};

export function StatusBadge({ status }) {
  const s = String(status || "pending").toLowerCase();
  return (
    <span
      className={`inline-block w-fit rounded-full px-3 py-1 text-xs font-medium capitalize ${BADGE_STYLES[s] || BADGE_STYLES.pending}`}
    >
      {s.replace("-", " ")}
    </span>
  );
}

// ---------- loading skeleton ----------
export function ListSkeleton({ rows = 3 }) {
  return (
    <div aria-busy="true" aria-label="Loading" className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
      ))}
    </div>
  );
}

// ---------- empty state ----------
export function EmptyState({ icon: Icon, title, hint, action }) {
  return (
    <div className="rounded-xl bg-white p-10 text-center shadow-sm">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
        {Icon && <Icon className="h-6 w-6 text-slate-500" strokeWidth={2} />}
      </span>
      <p className="mt-4 text-sm font-semibold text-slate-900">{title}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {action}
    </div>
  );
}

// ---------- toast notifications ----------
const ToastCtx = createContext(() => {});

export function useToast() {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, type = "info") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const icons = { success: CircleCheck, error: TriangleAlert, info: Info };

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div aria-live="polite" className="fixed bottom-4 right-4 z-[60] flex w-80 flex-col gap-2">
        {toasts.map((t) => {
          const Icon = icons[t.type] || Info;
          const ring =
            t.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : t.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-slate-200 bg-white text-slate-800";
          return (
            <div key={t.id} role="status" className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm font-medium shadow-md ${ring}`}>
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="flex-1">{t.message}</span>
              <button onClick={() => dismiss(t.id)} aria-label="Dismiss notification" className="opacity-60 hover:opacity-100">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}

// ---------- accessible confirm dialog ----------
export function ConfirmDialog({ title, body, confirmLabel = "Confirm", onConfirm, onCancel, busy }) {
  return (
    <div role="alertdialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        {body && <p className="mt-2 text-sm text-slate-600">{body}</p>}
        <div className="mt-5 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Keep
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- star rating (display + input) ----------
export function RatingStars({ value = 0, onChange, size = "h-4 w-4" }) {
  const stars = [1, 2, 3, 4, 5];
  if (!onChange) {
    return (
      <span className="inline-flex items-center gap-0.5" aria-label={`${value} of 5 stars`}>
        {stars.map((s) => (
          <Star key={s} className={`${size} ${s <= value ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`} />
        ))}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1" role="radiogroup" aria-label="Select rating">
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          role="radio"
          aria-checked={value === s}
          aria-label={`${s} star${s > 1 ? "s" : ""}`}
          onClick={() => onChange(s)}
          className="transition hover:scale-110"
        >
          <Star className={`h-6 w-6 ${s <= value ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`} />
        </button>
      ))}
    </span>
  );
}
