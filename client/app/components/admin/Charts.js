"use client";

// ---------------------------------------------------------------------------
// HotelFlow admin charts (recharts). Each renders a skeleton until mounted
// (avoids SSR width warnings) and supports dark mode via currentColor-free
// explicit tick colors passed from the page theme.
// - RevenueChart: area chart + Weekly/Monthly/Yearly toggle.
// - BookingsChart: monthly bar chart.
// - RoomTypeChart: donut of rooms per type.
// - OccupancyChart: occupancy % line trend.
// ---------------------------------------------------------------------------

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartSkeleton } from "./Skeleton";
import { formatBDT } from "../../lib/format";

function useMounted() {
  const [m, setM] = useState(false);
  // Mount gate so recharts only renders on the client (avoids SSR width
  // warnings and hydration mismatches) — intentional setState in effect.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setM(true);
  }, []);
  return m;
}

const card = "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800";
const h3 = "text-[16px] font-bold text-slate-900 dark:text-white";
const tick = { fontSize: 11, fill: "#94A3B8" };

export function RevenueChart({ data = {}, height = 280 }) {
  const mounted = useMounted();
  const [mode, setMode] = useState("Monthly");
  if (!mounted) return <ChartSkeleton height={height} />;
  const rows = data[mode] || [];
  return (
    <div className={card}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className={h3}>Revenue Overview</h3>
          <p className="text-[12.5px] text-slate-500 dark:text-slate-400">Collected revenue (BDT)</p>
        </div>
        <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-700">
          {["Weekly", "Monthly", "Yearly"].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-lg px-3 py-1.5 text-[12px] font-bold transition ${
                mode === m ? "bg-white text-slate-900 shadow dark:bg-slate-800 dark:text-white" : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      <div style={{ height }} className="mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={rows} margin={{ top: 5, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="label" tick={tick} axisLine={false} tickLine={false} />
            <YAxis tick={tick} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
            <Tooltip formatter={(v) => [formatBDT(v), "Revenue"]} />
            <Area type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2.5} fill="#2563EB" fillOpacity={0.18} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function BookingsChart({ data = [], height = 280 }) {
  const mounted = useMounted();
  if (!mounted) return <ChartSkeleton height={height} />;
  return (
    <div className={card}>
      <h3 className={h3}>Bookings by Month</h3>
      <p className="text-[12.5px] text-slate-500 dark:text-slate-400">Confirmed vs all bookings</p>
      <div style={{ height }} className="mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 8, bottom: 0, left: 0 }} barGap={3}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="label" tick={tick} axisLine={false} tickLine={false} />
            <YAxis tick={tick} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="bookings" name="Bookings" fill="#2563EB" radius={[6, 6, 0, 0]} />
            <Bar dataKey="approved" name="Approved" fill="#16A34A" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const DONUT_COLORS = ["#2563EB", "#16A34A", "#F59E0B", "#8B5CF6", "#EC4899", "#64748B"];

export function RoomTypeChart({ data = [], height = 280 }) {
  const mounted = useMounted();
  if (!mounted) return <ChartSkeleton height={height} />;
  return (
    <div className={card}>
      <h3 className={h3}>Room Type Distribution</h3>
      <p className="text-[12.5px] text-slate-500 dark:text-slate-400">Rooms per type</p>
      <div style={{ height }} className="mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius="55%" outerRadius="85%" paddingAngle={3}>
              {data.map((_, i) => (
                <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function OccupancyChart({ data = [], height = 280 }) {
  const mounted = useMounted();
  if (!mounted) return <ChartSkeleton height={height} />;
  return (
    <div className={card}>
      <h3 className={h3}>Occupancy Rate Trend</h3>
      <p className="text-[12.5px] text-slate-500 dark:text-slate-400">Booked room-nights (%)</p>
      <div style={{ height }} className="mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="label" tick={tick} axisLine={false} tickLine={false} />
            <YAxis tick={tick} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip formatter={(v) => [`${v}%`, "Occupancy"]} />
            <Line type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
