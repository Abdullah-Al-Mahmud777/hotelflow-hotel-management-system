"use client";

import { Bell, CircleCheck, Clock, XCircle, Calendar } from "lucide-react";
import { EmptyState, ListSkeleton, formatDateTime } from "./ui";

const KIND_ICON = {
  "booking-approved": CircleCheck,
  "booking-pending": Clock,
  "booking-cancelled": XCircle,
  "booking-rejected": XCircle,
  "review-approved": CircleCheck,
  "review-pending": Clock,
  "review-rejected": XCircle,
};

export default function Notifications({ notifications, loading, onRead, onReadAll }) {
  const items = notifications?.data || [];
  const unread = notifications?.unread ?? items.filter((i) => !i.read).length;
  const canAct = (n) => n.source === "stored" && !n.read && onRead;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Notifications</h2>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
              {unread} unread
            </span>
          )}
          {unread > 0 && onReadAll && (
            <button onClick={onReadAll} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
              Mark all read
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <ListSkeleton rows={5} />
      ) : items.length === 0 ? (
        <EmptyState icon={Bell} title="You're all caught up" hint="Booking and review updates will appear here" />
      ) : (
        <ul className="space-y-3" aria-label="Notification list">
          {items.map((n) => {
            const Icon = KIND_ICON[n.kind] || Calendar;
            return (
              <li
                key={n.id}
                className={`flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm ${!n.read ? "ring-1 ring-blue-200" : ""}`}
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${!n.read ? "bg-blue-100" : "bg-slate-100"}`}>
                  <Icon className={`h-4 w-4 ${!n.read ? "text-blue-700" : "text-slate-500"}`} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{formatDateTime(n.date)}</p>
                  {canAct(n) && (
                    <button onClick={() => onRead(n.nid || n.id)} className="mt-1.5 text-xs font-medium text-blue-700 hover:underline">
                      Mark read
                    </button>
                  )}
                </div>
                {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" aria-label="Unread" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
