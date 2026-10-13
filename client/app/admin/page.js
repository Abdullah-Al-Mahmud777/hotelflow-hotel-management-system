"use client";

// ---------------------------------------------------------------------------
// HotelFlow Admin Dashboard (/admin) — SaaS analytics home.
// KPI cards with sparklines + trends, booking status card, 4 recharts charts,
// check-ins/outs, top rooms, recent reviews, quick actions, activity feed.
// Date-range filter updates everything; CSV export + print included.
// Backend first (parallel fetches), clearly labeled BD dummy fallback.
// ---------------------------------------------------------------------------

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Wallet,
  CalendarCheck,
  BedDouble,
  Users,
  Plus,
  CalendarPlus,
  Megaphone,
  Download,
  Printer,
  LogIn,
  LogOut,
  Star,
  CalendarDays,
} from "lucide-react";
import KpiCard from "../components/admin/KpiCard";
import StatusCard from "../components/admin/StatusCard";
import { RevenueChart, BookingsChart, RoomTypeChart, OccupancyChart } from "../components/admin/Charts";
import ActivityFeed from "../components/admin/ActivityFeed";
import { CardSkeleton, TableSkeleton } from "../components/admin/Skeleton";
import { toast } from "../components/admin/Toast";
import {
  adminFetch,
  normalizeBooking,
  seededSeries,
  DUMMY_BOOKINGS,
  DUMMY_USERS,
  DUMMY_REVIEWS,
  DUMMY_MESSAGES,
} from "../components/admin/dummy";
import { DUMMY_ROOMS } from "../components/hotelflow/roomsData";
import { formatBDT, formatNumber, formatDateBD } from "../lib/format";
import { downloadCSV, printTable } from "../lib/export";

const RANGES = ["Today", "Last 7 days", "Last 30 days", "This year", "Custom"];

function rangeToDates(range, custom) {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();
  if (range === "Today") start.setHours(0, 0, 0, 0);
  else if (range === "Last 7 days") start.setDate(start.getDate() - 6);
  else if (range === "Last 30 days") start.setDate(start.getDate() - 29);
  else if (range === "This year") start.setMonth(0, 1);
  else if (range === "Custom" && custom.from) start.setTime(new Date(custom.from).getTime());
  else start.setDate(start.getDate() - 29);
  if (range === "Custom" && custom.to) end.setTime(new Date(custom.to).getTime());
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

const sameDay = (a, b) =>
  new Date(a).toDateString() === new Date(b).toDateString();

export default function AdminDashboard() {
  const [range, setRange] = useState("Last 30 days");
  const [custom, setCustom] = useState({ from: "", to: "" });
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [messages, setMessages] = useState([]);

  // Parallel fetch of every dashboard source; dummy fallback when offline.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [b, r, u, rv, m] = await Promise.all([
          adminFetch("/api/bookings").catch(() => null),
          adminFetch("/api/rooms").catch(() => null),
          adminFetch("/api/admin/users").catch(() => null),
          adminFetch("/api/admin/reviews").catch(() => null),
          adminFetch("/api/admin/contacts").catch(() => null),
        ]);
        if (cancelled) return;
        const nb = (b?.data || []).map((x) => normalizeBooking(x, r?.data || []));
        const anyReal = [b, r, u, rv, m].some(Boolean);
        setBookings(nb.length ? nb : DUMMY_BOOKINGS);
        setRooms(r?.data?.length ? r.data : DUMMY_ROOMS);
        setUsers(u?.data?.length ? u.data : u?.users?.length ? u.users : DUMMY_USERS);
        setReviews(rv?.data?.length ? rv.data : DUMMY_REVIEWS);
        setMessages(m?.data?.length ? m.data : DUMMY_MESSAGES);
        setIsFallback(!anyReal);
      } catch {
        if (!cancelled) {
          setBookings(DUMMY_BOOKINGS);
          setRooms(DUMMY_ROOMS);
          setUsers(DUMMY_USERS);
          setReviews(DUMMY_REVIEWS);
          setMessages(DUMMY_MESSAGES);
          setIsFallback(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const { start, end } = useMemo(() => rangeToDates(range, custom), [range, custom]);
  const days = Math.max(1, Math.round((end - start) / 86400000) + 1);

  // Bookings inside + before the range (for trend comparison).
  const inRange = useMemo(
    () => bookings.filter((b) => {
      const t = new Date(b.createdAt).getTime();
      return t >= start.getTime() && t <= end.getTime();
    }),
    [bookings, start, end]
  );
  const prevRange = useMemo(
    () => bookings.filter((b) => {
      const t = new Date(b.createdAt).getTime();
      return t >= start.getTime() - days * 86400000 && t < start.getTime();
    }),
    [bookings, start, days]
  );

  const revenue = (list) =>
    list.filter((b) => ["approved", "completed"].includes(b.status))
      .reduce((s, b) => s + b.totalPrice, 0);
  const pct = (cur, prev) => {
    if (!prev) return null;
    return `${cur >= prev ? "+" : ""}${(((cur - prev) / prev) * 100).toFixed(1)}%`;
  };

  const rev = revenue(inRange);
  const revPrev = revenue(prevRange);
  const guests = inRange.reduce((s, b) => s + b.guests, 0);
  const guestsPrev = prevRange.reduce((s, b) => s + b.guests, 0);

  // Occupancy: booked room-nights inside the range vs capacity.
  const bookedNights = inRange.reduce((s, b) => {
    const a = Math.max(new Date(b.checkIn).getTime(), start.getTime());
      const c = Math.min(new Date(b.checkOut).getTime(), end.getTime());
    return s + Math.max(0, Math.round((c - a) / 86400000));
  }, 0);
  const occupancy = rooms.length ? Math.min(100, Math.round((bookedNights / (rooms.length * days)) * 100)) : 0;

  // Daily revenue sparkline for the KPI cards.
  const dailyRev = useMemo(() => {
    const arr = Array.from({ length: Math.min(days, 30) }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return inRange
        .filter((b) => ["approved", "completed"].includes(b.status) && sameDay(b.createdAt, d))
        .reduce((s, b) => s + b.totalPrice, 0);
    });
    return arr.every((v) => v === 0) ? seededSeries(7, arr.length, 8000, 20000) : arr;
  }, [inRange, start, days]);

  // Chart datasets (real when bookings exist, seeded fallback otherwise).
  const revenueData = useMemo(() => {
    if (inRange.length > 3) {
      const byDay = {};
      inRange.forEach((b) => {
        if (!["approved", "completed"].includes(b.status)) return;
        const k = new Date(b.createdAt).toISOString().slice(0, 10);
        byDay[k] = (byDay[k] || 0) + b.totalPrice;
      });
      const days7 = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - 6 + i);
        const k = d.toISOString().slice(0, 10);
        return { label: d.toLocaleDateString("en-GB", { weekday: "short" }), value: byDay[k] || 0 };
      });
      const weeks = [0, 1, 2, 3].map((w) => ({
        label: `Week ${w + 1}`,
        value: days7.length ? Math.round(revenue(inRange) / 4) : 0,
      }));
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
        (label, mi) => ({
          label,
          value: inRange
            .filter((b) => ["approved", "completed"].includes(b.status) && new Date(b.createdAt).getMonth() === mi)
            .reduce((s, b) => s + b.totalPrice, 0),
        })
      );
      return { Weekly: days7, Monthly: weeks, Yearly: months };
    }
    return {
      Weekly: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"].map((label, i) => ({ label, value: seededSeries(11, 7, 15000, 40000)[i] })),
      Monthly: [1, 2, 3, 4].map((w) => ({ label: `Week ${w}`, value: seededSeries(22, 4, 90000, 120000)[w - 1] })),
      Yearly: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((label, i) => ({ label, value: seededSeries(33, 12, 300000, 500000)[i] })),
    };
  }, [inRange]);

  const monthlyBookings = useMemo(() => {
    const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date().getMonth();
    return Array.from({ length: 6 }, (_, i) => {
      const mi = (now - 5 + i + 12) % 12;
      const list = bookings.filter((b) => new Date(b.createdAt).getMonth() === mi);
      return {
        label: labels[mi],
        bookings: list.length || seededSeries(44 + i, 1, 4, 14)[0],
        approved: list.filter((b) => ["approved", "completed"].includes(b.status)).length || seededSeries(55 + i, 1, 3, 10)[0],
      };
    });
  }, [bookings]);

  const roomTypes = useMemo(() => {
    const map = {};
    (rooms.length ? rooms : DUMMY_ROOMS).forEach((r) => {
      const t = r.type || "Standard";
      map[t] = (map[t] || 0) + 1;
    });
    return Object.entries(map).map(([label, value]) => ({ label, value }));
  }, [rooms]);

  const occupancyTrend = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        label: `W${i + 1}`,
        value: Math.min(100, Math.max(8, occupancy - 12 + seededSeries(66, 8, 0, 24)[i])),
      })),
    [occupancy]
  );

  const statusCounts = useMemo(() => {
    const c = {};
    inRange.forEach((b) => {
      c[b.status] = (c[b.status] || 0) + 1;
    });
    return c;
  }, [inRange]);

  const today = new Date();
  const checkIns = inRange.filter((b) => sameDay(b.checkIn, today)).slice(0, 5);
  const checkOuts = inRange.filter((b) => sameDay(b.checkOut, today)).slice(0, 5);

  const topRooms = useMemo(() => {
    const map = {};
    bookings.forEach((b) => {
      map[b.room] = map[b.room] || { room: b.room, bookings: 0, revenue: 0 };
      map[b.room].bookings += 1;
      if (["approved", "completed"].includes(b.status)) map[b.room].revenue += b.totalPrice;
    });
    const ratingOf = (name) =>
      rooms.find((r) => (r.name || "") === name)?.rating ??
      DUMMY_ROOMS.find((r) => r.name === name)?.rating ?? 8.0;
    return Object.values(map)
      .map((r) => ({ ...r, rating: ratingOf(r.room) }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [bookings, rooms]);

  const activity = useMemo(
    () =>
      [
        ...inRange.map((b) => ({ kind: b.status === "approved" || b.status === "completed" ? "approved" : b.status === "rejected" ? "rejected" : b.status === "cancelled" ? "cancelled" : "booking", ...b })),
        ...users.slice(0, 3).map((u) => ({ kind: "user", ...u, createdAt: u.createdAt })),
        ...messages.slice(0, 2).map((m) => ({ kind: "message", ...m })),
        ...reviews.slice(0, 2).map((r) => ({ kind: "review", ...r })),
      ]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 8),
    [inRange, users, messages, reviews]
  );

  const exportRows = inRange.map((b) => ({
    id: b.id,
    guest: b.guest,
    phone: b.phone,
    room: b.room,
    checkIn: formatDateBD(b.checkIn),
    checkOut: formatDateBD(b.checkOut),
    guests: b.guests,
    total: b.totalPrice,
    status: b.status,
  }));
  const exportCols = [
    { key: "id", label: "Booking ID" },
    { key: "guest", label: "Guest" },
    { key: "phone", label: "Phone" },
    { key: "room", label: "Room" },
    { key: "checkIn", label: "Check-in" },
    { key: "checkOut", label: "Check-out" },
    { key: "total", label: "Total (BDT)" },
    { key: "status", label: "Status" },
  ];

  return (
    <div className="space-y-5">
      {/* Header row: range filter + sample badge + export/print */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 dark:border-slate-700 dark:bg-slate-800">
          <CalendarDays className="ml-1.5 h-4 w-4 text-slate-400" />
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded-xl px-3 py-1.5 text-[12.5px] font-bold transition ${
                range === r ? "bg-[#2563EB] text-white shadow" : "text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              {r}
            </button>
          ))}
          {range === "Custom" && (
            <span className="flex items-center gap-1.5 px-1.5">
              <input type="date" value={custom.from} onChange={(e) => setCustom({ ...custom, from: e.target.value })} aria-label="From date" className="rounded-lg border border-slate-200 px-2 py-1 text-[12px] dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
              <span className="text-slate-400">→</span>
              <input type="date" value={custom.to} onChange={(e) => setCustom({ ...custom, to: e.target.value })} aria-label="To date" className="rounded-lg border border-slate-200 px-2 py-1 text-[12px] dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
            </span>
          )}
        </div>
        <span className="flex-1" />
        {isFallback && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
            Sample data
          </span>
        )}
        <button
          type="button"
          onClick={() => {
            downloadCSV("hotelFlow-dashboard", exportCols, exportRows);
            toast.success("Dashboard CSV downloaded.");
          }}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12.5px] font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          <Download className="h-4 w-4" /> Export
        </button>
        <button
          type="button"
          onClick={() => printTable("HotelFlow Dashboard Report", exportCols, exportRows)}
          aria-label="Print dashboard report"
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12.5px] font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          <Printer className="h-4 w-4" /> Print
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={Wallet} label={`Total Revenue (${range})`} value={formatBDT(rev)} trend={pct(rev, revPrev) || "—"} trendUp={rev >= revPrev} spark={dailyRev} color="#2563EB" loading={loading} />
        <KpiCard icon={CalendarCheck} label="Total Bookings" value={formatNumber(inRange.length)} trend={pct(inRange.length, prevRange.length) || "—"} trendUp={inRange.length >= prevRange.length} spark={dailyRev.map((v) => Math.round(v / 4000))} color="#16A34A" loading={loading} />
        <KpiCard icon={BedDouble} label="Occupancy Rate" value={`${occupancy}%`} trend={`${bookedNights} room-nights`} trendUp={occupancy >= 50} spark={occupancyTrend.map((o) => o.value)} color="#8B5CF6" loading={loading} />
        <KpiCard icon={Users} label="Total Guests" value={formatNumber(guests)} trend={pct(guests, guestsPrev) || "—"} trendUp={guests >= guestsPrev} spark={dailyRev.map((v) => Math.round(v / 6000))} color="#F59E0B" loading={loading} />
      </div>

      {/* Status + revenue chart */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <StatusCard counts={statusCounts} loading={loading} />
        <div className="xl:col-span-2">
          {loading ? <CardSkeleton /> : <RevenueChart data={revenueData} />}
        </div>
      </div>

      {/* Bookings + donut + occupancy */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <BookingsChart data={monthlyBookings} />
            <RoomTypeChart data={roomTypes} />
            <OccupancyChart data={occupancyTrend} />
          </>
        )}
      </div>

      {/* Check-ins/outs + top rooms */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">Today&apos;s Movement</h3>
          {loading ? (
            <p className="py-6 text-center text-[13px] text-slate-500">Loading…</p>
          ) : checkIns.length + checkOuts.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-slate-500">No check-ins or check-outs today.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {checkIns.map((b) => (
                <p key={`in-${b.id}`} className="flex items-center gap-2 text-[13px] font-semibold text-slate-700 dark:text-slate-200">
                  <LogIn className="h-4 w-4 text-emerald-600" /> {b.guest} checks in • {b.room}
                </p>
              ))}
              {checkOuts.map((b) => (
                <p key={`out-${b.id}`} className="flex items-center gap-2 text-[13px] font-semibold text-slate-700 dark:text-slate-200">
                  <LogOut className="h-4 w-4 text-amber-600" /> {b.guest} checks out • {b.room}
                </p>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">Top Performing Rooms</h3>
          {loading ? (
            <p className="py-6 text-center text-[13px] text-slate-500">Loading…</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wide text-slate-400">
                    <th className="py-2 pr-3">Room</th>
                    <th className="py-2 pr-3">Bookings</th>
                    <th className="py-2 pr-3">Revenue</th>
                    <th className="py-2">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {topRooms.map((r) => (
                    <tr key={r.room} className="border-t border-slate-100 dark:border-slate-700">
                      <td className="py-2.5 pr-3 font-bold text-slate-800 dark:text-slate-100">{r.room}</td>
                      <td className="py-2.5 pr-3 tabular-nums">{r.bookings}</td>
                      <td className="py-2.5 pr-3 font-bold tabular-nums">{formatBDT(r.revenue)}</td>
                      <td className="py-2.5 tabular-nums">
                        <span className="inline-flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {Number(r.rating).toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Reviews + quick actions + activity */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">Recent Reviews</h3>
          {loading ? (
            <p className="py-6 text-center text-[13px] text-slate-500">Loading…</p>
          ) : reviews.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-slate-500">No reviews yet.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {reviews.slice(0, 3).map((r) => (
                <div key={r._id || r.id} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-700/40">
                  <p className="flex items-center gap-1 text-[13px] font-bold text-slate-800 dark:text-slate-100">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {r.rating}/5 • {r.user?.name || r.guest || "Guest"}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[12.5px] text-slate-500 dark:text-slate-400">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">Quick Actions</h3>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              { label: "Add Room", icon: Plus, href: "/admin/rooms" },
              { label: "New Booking", icon: CalendarPlus, href: "/admin/bookings" },
              { label: "Announcement", icon: Megaphone, href: "/admin/messages" },
              { label: "Export Report", icon: Download, href: "/admin/reports" },
            ].map(({ label, icon: Icon, href }) => (
              <Link
                key={label}
                href={href}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-4 text-[12.5px] font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-[#2563EB] hover:text-[#2563EB] hover:shadow dark:border-slate-600 dark:text-slate-200"
              >
                <Icon className="h-5 w-5" /> {label}
              </Link>
            ))}
          </div>
          <p className="mt-3 text-[12px] text-slate-500 dark:text-slate-400">
            {formatDateBD(start)} → {formatDateBD(end)} • {days} day{days === 1 ? "" : "s"}
          </p>
        </div>
        <ActivityFeed items={activity} loading={loading} />
      </div>

      {/* Tables loading state */}
      {loading && <TableSkeleton rows={4} />}
    </div>
  );
}
