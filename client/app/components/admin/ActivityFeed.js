"use client";

// ---------------------------------------------------------------------------
// HotelFlow admin ActivityFeed — event timeline with a proper icon per type
// (CalendarPlus, CheckCircle2, XCircle, UserPlus, MessageSquare, Star),
// guest name, details, relative time + exact date on hover. "View all" link.
// Accepts raw backend activity OR booking/user/message/review objects and
// renders "[Guest name] booked [Room name]" style text with graceful
// fallbacks when fields are missing.
// ---------------------------------------------------------------------------

import Link from "next/link";
import {
  CalendarPlus,
  CheckCircle2,
  XCircle,
  UserPlus,
  MessageSquare,
  Star,
  Activity,
} from "lucide-react";
import { formatTimeAgo } from "../../lib/format";

const ICONS = {
  booking: { icon: CalendarPlus, bg: "bg-blue-100 dark:bg-blue-500/15", fg: "text-blue-600 dark:text-blue-400" },
  approved: { icon: CheckCircle2, bg: "bg-emerald-100 dark:bg-emerald-500/15", fg: "text-emerald-600 dark:text-emerald-400" },
  rejected: { icon: XCircle, bg: "bg-red-100 dark:bg-red-500/15", fg: "text-red-600 dark:text-red-400" },
  cancelled: { icon: XCircle, bg: "bg-slate-200 dark:bg-slate-700", fg: "text-slate-500 dark:text-slate-300" },
  user: { icon: UserPlus, bg: "bg-violet-100 dark:bg-violet-500/15", fg: "text-violet-600 dark:text-violet-400" },
  message: { icon: MessageSquare, bg: "bg-amber-100 dark:bg-amber-500/15", fg: "text-amber-600 dark:text-amber-400" },
  review: { icon: Star, bg: "bg-yellow-100 dark:bg-yellow-500/15", fg: "text-yellow-600 dark:text-yellow-400" },
  default: { icon: Activity, bg: "bg-slate-200 dark:bg-slate-700", fg: "text-slate-500" },
};

function describe(item) {
  const t = item.kind;
  const when = item.createdAt || item.date;
  if (t === "booking") {
    const guest = item.guest || item.guestName || "A guest";
    const room = item.room || item.roomName || "a room";
    return {
      title: `${guest} booked ${room}`,
      text: `${item.guests ? `${item.guests} guest${item.guests > 1 ? "s" : ""} • ` : ""}${item.status || "pending"}`,
      when,
    };
  }
  if (t === "user")
    return { title: `${item.name || "New user"} joined`, text: item.email || item.role || "", when };
  if (t === "message")
    return { title: `Message from ${item.name || "a guest"}`, text: item.subject || item.message || "", when };
  if (t === "review")
    return {
      title: `${item.guest || item.name || "A guest"} left a ${item.rating ?? "?"}-star review`,
      text: item.comment || item.room || "",
      when,
    };
  return {
    title: item.title || item.text || "Activity",
    text: item.details || "",
    when,
  };
}

export default function ActivityFeed({ items = [], loading = false, viewAllHref = "/admin/bookings" }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">Recent Activity</h3>
        <Link href={viewAllHref} className="text-[12.5px] font-bold text-[#2563EB] hover:underline">
          View all
        </Link>
      </div>
      {loading ? (
        <div className="mt-4 animate-pulse space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-700" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-2/3 rounded bg-slate-100 dark:bg-slate-700" />
                <div className="h-3 w-1/3 rounded bg-slate-100 dark:bg-slate-700" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-slate-500">No recent activity.</p>
      ) : (
        <ol className="mt-4 space-y-4">
          {items.slice(0, 8).map((raw, i) => {
            const d = describe(raw);
            const S = ICONS[raw.kind] || ICONS.default;
            const Icon = S.icon;
            return (
              <li key={raw.id || i} className="flex gap-3">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${S.bg}`}>
                  <Icon className={`h-4 w-4 ${S.fg}`} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-slate-800 dark:text-slate-100">
                    {d.title}
                  </p>
                  {d.text && (
                    <p className="truncate text-[12px] text-slate-500 dark:text-slate-400">{d.text}</p>
                  )}
                </div>
                <span
                  className="shrink-0 text-[11.5px] font-semibold text-slate-400"
                  title={d.when ? new Date(d.when).toLocaleString("en-GB") : ""}
                >
                  {d.when ? formatTimeAgo(d.when) : ""}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
