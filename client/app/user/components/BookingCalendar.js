"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { EmptyState, formatPrice, useToast } from "./ui";
import { getBookingCalendar } from "../../../lib/dashboardApi";

function monthKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function monthLabel(key) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}
const DOT = { approved: "bg-green-500", pending: "bg-yellow-500", cancelled: "bg-slate-400", rejected: "bg-red-500" };

export default function BookingCalendar() {
  const toast = useToast();
  const [cursor, setCursor] = useState(() => new Date());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const key = monthKey(cursor);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getBookingCalendar(key)
      .then((d) => { if (alive) { setData(d); } })
      .catch((err) => { if (alive) toast(err?.message || "Calendar failed to load", "error"); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const bookings = useMemo(() => data?.bookings || [], [data]);

  const cells = useMemo(() => {
    const [y, m] = key.split("-").map(Number);
    const first = new Date(y, m - 1, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(y, m, 0).getDate();
    const arr = [];
    for (let i = 0; i < startDay; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(new Date(y, m - 1, d));
    return arr;
  }, [key]);

  const byDay = useMemo(() => {
    const map = {};
    bookings.forEach((b) => {
      const ci = new Date(b.checkIn);
      const co = new Date(b.checkOut);
      for (let d = new Date(ci); d < co; d.setDate(d.getDate() + 1)) {
        const k = d.toISOString().slice(0, 10);
        (map[k] = map[k] || []).push(b);
      }
    });
    return map;
  }, [bookings]);

  const shift = (n) => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + n, 1));

  const selKey = selected ? selected.toISOString().slice(0, 10) : null;
  const selBookings = selKey ? byDay[selKey] || [] : [];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Booking Calendar</h2>
        <div className="flex items-center gap-2" role="group" aria-label="Month navigation">
          <button onClick={() => shift(-1)} aria-label="Previous month" className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-40 text-center text-sm font-semibold text-slate-900">{monthLabel(key)}</span>
          <button onClick={() => shift(1)} aria-label="Next month" className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50">
            <ChevronRight className="h-4 w-4" />
          </button>
          <button onClick={() => { setCursor(new Date()); }} className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-700">
            Today
          </button>
        </div>
      </div>

      {loading ? (
        <div aria-busy="true" className="grid grid-cols-7 gap-1.5" aria-label="Loading calendar">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100 sm:h-20" />
          ))}
        </div>
      ) : bookings.length === 0 && cells.length > 0 ? (
        <EmptyState icon={CalendarDays} title={`No stays in ${monthLabel(key)}`} hint="Your reservations will light up this calendar" />
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1.5" role="grid" aria-label={`${monthLabel(key)} bookings`}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="pb-1 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400">{d}</div>
            ))}
            {cells.map((date, i) => {
              if (!date) return <div key={`e-${i}`} />;
              const k = date.toISOString().slice(0, 10);
              const day = byDay[k] || [];
              const isToday = new Date().toISOString().slice(0, 10) === k;
              return (
                <button
                  key={k}
                  onClick={() => setSelected(date)}
                  aria-label={`${k}, ${day.length} booking(s)${selKey === k ? ", selected" : ""}`}
                  className={`min-h-16 rounded-xl border p-1.5 text-left transition sm:min-h-20 ${selKey === k ? "border-blue-500 ring-2 ring-blue-200" : "border-slate-200 bg-white hover:border-slate-300"} ${isToday ? "bg-blue-50" : ""}`}
                >
                  <span className={`text-xs font-semibold ${isToday ? "text-blue-700" : "text-slate-700"}`}>{date.getDate()}</span>
                  <span className="mt-1 flex flex-wrap gap-1">
                    {day.slice(0, 4).map((b) => (
                      <span key={b.id} title={`${b.room} (${b.status})`} className={`h-2 w-2 rounded-full ${DOT[b.status] || DOT.pending}`} />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>

          {selected && (
            <section aria-label="Selected day bookings" className="mt-4 rounded-xl bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900">
                {selected.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
              </h3>
              {selBookings.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">No stays on this day.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {selBookings.map((b) => (
                    <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 p-3 text-sm">
                      <span className="font-semibold text-slate-900">{b.room}</span>
                      <span className="text-xs capitalize text-slate-500">{b.status} · {formatPrice(b.totalPrice)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
