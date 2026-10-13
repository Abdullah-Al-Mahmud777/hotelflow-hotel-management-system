"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  CircleCheck,
  Clock,
  MessageSquare,
  Ticket,
  ChartPie,
  Plus,
  Receipt,
  Star,
  ArrowRight,
  Sparkles,
  Award,
} from "lucide-react";
import { formatDate, formatPrice, StatusBadge } from "./ui";

function bookingStatusBadge(status) {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "cancelled":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-yellow-100 text-yellow-800";
  }
}

function MetricSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-white p-6 shadow-sm">
      <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
      <div className="mt-3 h-9 w-16 animate-pulse rounded bg-slate-200" />
    </div>
  );
}

export function OverviewSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading dashboard">
      <div className="mb-6 h-8 w-56 animate-pulse rounded bg-slate-200" />
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <MetricSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-xl bg-white p-6 shadow-sm">
            <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
            <div className="mt-4 space-y-3">
              {[0, 1, 2].map((j) => (
                <div key={j} className="h-14 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Overview({
  metrics,
  recent = [],
  reviewCounts,
  bookings = [],
  recommendations = [],
  loyalty = null,
  loading,
  error,
  onNavigate,
}) {
  const router = useRouter();
  const now = useMemo(() => new Date(), []);
  const upcoming = useMemo(
    () =>
      [...(bookings || [])]
        .filter((b) => ["approved", "pending"].includes(b.status) && b.checkOut && new Date(b.checkOut) >= now)
        .sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn))
        .slice(0, 3),
    [bookings, now]
  );
  const totalSpent = useMemo(
    () => (bookings || []).filter((b) => b.status === "approved").reduce((s, b) => s + (Number(b.totalPrice) || 0), 0),
    [bookings]
  );

  if (loading) return <OverviewSkeleton />;

  const cards = [
    { label: "Total Bookings", value: metrics?.totalBookings ?? bookings.length ?? 0, bg: "bg-blue-500", soft: "text-blue-100", Icon: Calendar },
    { label: "Approved", value: metrics?.approved ?? 0, bg: "bg-green-500", soft: "text-green-100", Icon: CircleCheck },
    { label: "Pending", value: metrics?.pending ?? 0, bg: "bg-amber-500", soft: "text-amber-100", Icon: Clock },
    { label: "Reviews", value: metrics?.reviews ?? 0, bg: "bg-purple-500", soft: "text-purple-100", Icon: MessageSquare },
  ];

  const quickActions = [
    { label: "New booking", icon: Plus, run: () => router.push("/rooms") },
    { label: "My bookings", icon: Ticket, run: () => onNavigate?.("bookings") },
    { label: "Payments", icon: Receipt, run: () => onNavigate?.("payments") },
    { label: "Write review", icon: Star, run: () => onNavigate?.("reviews") },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Dashboard Overview
        </h2>
        <p className="w-full text-sm text-slate-500 sm:w-auto">
          {totalSpent > 0 ? `${formatPrice(totalSpent)} spent on approved stays` : "Plan your first stay"}
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error} — showing last known data.
        </div>
      )}

      {/* Top metric cards — 4-column grid */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.Icon;
          return (
            <div key={c.label} className={`relative overflow-hidden rounded-xl ${c.bg} p-6 text-white shadow-sm`}>
              <div className="relative z-10">
                <p className={`text-sm font-medium ${c.soft}`}>{c.label}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{c.value}</p>
              </div>
              <Icon className="pointer-events-none absolute -bottom-3 -right-2 h-24 w-24 opacity-20" strokeWidth={1.5} aria-hidden="true" />
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickActions.map((a) => (
          <button
            key={a.label}
            onClick={a.run}
            className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-900 hover:text-white"
          >
            <a.icon className="h-4 w-4" /> {a.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Left: Recent Bookings */}
        <section aria-label="Recent bookings" className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Ticket className="h-5 w-5 text-slate-400" strokeWidth={2} />
            Recent Bookings
          </h3>
          <div className="mt-4 space-y-3">
            {recent.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">No bookings yet</p>
            ) : (
              recent.map((b) => (
                <div key={b.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{b.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{b.date}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium capitalize ${bookingStatusBadge(b.status)}`}>
                    {b.status}
                  </span>
                </div>
              ))
            )}
          </div>
          {recent.length > 0 && (
            <button onClick={() => onNavigate?.("bookings")} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline">
              View all bookings <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </section>

        {/* Right: Review Status */}
        <section aria-label="Review status" className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <ChartPie className="h-5 w-5 text-slate-400" strokeWidth={2} />
            Review Status
          </h3>
          <div className="mt-5 space-y-5">
            {[
              ["Approved", reviewCounts?.approved ?? 0, "bg-green-500"],
              ["Pending", reviewCounts?.pending ?? 0, "bg-yellow-500"],
              ["Rejected", reviewCounts?.rejected ?? 0, "bg-red-500"],
            ].map(([label, count, dot]) => (
              <div key={label} className="flex items-center justify-between">
                <span className="flex items-center gap-3 text-sm font-medium text-slate-700">
                  <span className={`h-3 w-3 rounded-full ${dot}`} />
                  {label}
                </span>
                <span className="text-2xl font-bold text-slate-900">{count}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Upcoming stays */}
      <section aria-label="Upcoming stays" className="mt-5 rounded-xl bg-white p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <Calendar className="h-5 w-5 text-slate-400" strokeWidth={2} />
          Upcoming stays
        </h3>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No upcoming stays. Your approved future bookings will appear here.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {upcoming.map((b) => (
              <div key={b._id || b.id} className="rounded-xl border border-slate-200 p-4">
                <p className="truncate text-sm font-semibold text-slate-900">{b.room?.name || "Room"}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatDate(b.checkIn)} → {formatDate(b.checkOut)}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <StatusBadge status={b.status} />
                  <span className="text-sm font-bold text-slate-900">{formatPrice(b.totalPrice)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Personalized recommendations */}
      <section aria-label="Recommended for you" className="mt-5 rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Sparkles className="h-5 w-5 text-amber-500" strokeWidth={2} />
            Recommended for you
          </h3>
          <button onClick={() => router.push("/rooms")} className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline">
            All rooms <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        {!recommendations || recommendations.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Book a stay and save favorites — personalized picks appear here.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {recommendations.slice(0, 3).map((r) => (
              <button
                key={r._id}
                onClick={() => router.push(`/rooms/${r._id}`)}
                className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-blue-300 hover:shadow-md"
              >
                <p className="truncate text-sm font-semibold text-slate-900">{r.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">{r.type} · {formatPrice(r.price)}/night</p>
                <p className="mt-2 text-xs font-medium text-blue-700">{r.reason}</p>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Loyalty snapshot */}
      {loyalty && (
        <section aria-label="Loyalty snapshot" className="mt-5 rounded-xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Award className="h-5 w-5 text-amber-500" strokeWidth={2} />
              {(loyalty.balance ?? 0).toLocaleString()} loyalty points
            </h3>
            <button onClick={() => onNavigate?.("rewards")} className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline">
              Rewards <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1 text-sm text-slate-500">Earn 1 pt per ৳500 of approved spend. Redeem from 100 pts.</p>
        </section>
      )}
    </div>
  );
}
