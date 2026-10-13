"use client";

// ---------------------------------------------------------------------------
// HotelFlow admin Toast — tiny event-based toaster (no provider needed).
// Usage: import { toast } from "./Toast"; toast.success("Saved");
// <Toaster /> must be mounted once (admin layout does this).
// ---------------------------------------------------------------------------

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

let push = null;

export const toast = {
  success: (msg) => push?.({ type: "success", msg }),
  error: (msg) => push?.({ type: "error", msg }),
  info: (msg) => push?.({ type: "info", msg }),
};

const STYLE = {
  success: { icon: CheckCircle2, bar: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400" },
  error: { icon: XCircle, bar: "bg-red-500", text: "text-red-700 dark:text-red-400" },
  info: { icon: Info, bar: "bg-blue-500", text: "text-blue-700 dark:text-blue-400" },
};

export function Toaster() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    push = ({ type, msg }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setItems((prev) => [...prev.slice(-3), { id, type, msg }]);
      setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3500);
    };
    return () => {
      push = null;
    };
  }, []);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[320px] max-w-[calc(100vw-2rem)] flex-col gap-2" aria-live="polite">
      {items.map((t) => {
        const S = STYLE[t.type] || STYLE.info;
        const Icon = S.icon;
        return (
          <div
            key={t.id}
            className="pointer-events-auto flex animate-fade-in items-start gap-2.5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800"
          >
            <span className={`w-1.5 self-stretch ${S.bar}`} />
            <Icon className={`mt-3 h-5 w-5 shrink-0 ${S.text}`} />
            <p className="flex-1 py-3 pr-1 text-[13px] font-semibold text-slate-800 dark:text-slate-100">
              {t.msg}
            </p>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}
              className="mr-2 mt-2.5 rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
