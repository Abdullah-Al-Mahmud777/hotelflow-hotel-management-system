"use client";

// ---------------------------------------------------------------------------
// HotelFlow admin KpiCard — icon in a soft circle, big formatted number,
// label, trend badge (TrendingUp/Down) and a mini recharts sparkline.
// ---------------------------------------------------------------------------

import { TrendingUp, TrendingDown } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

export default function KpiCard({ icon: Icon, label, value, trend, trendUp, spark = [], color = "#2563EB", loading = false }) {
  if (loading) {
    return (
      <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-3 h-8 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
      </div>
    );
  }
  const data = spark.map((v, i) => ({ i, v }));
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start justify-between gap-2">
        <span className="grid h-11 w-11 place-items-center rounded-full" style={{ backgroundColor: `${color}1A` }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </span>
        {trend && (
          <span
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-black tabular-nums ${
              trendUp ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
            }`}
          >
            {trendUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {trend}
          </span>
        )}
      </div>
      <p className="mt-3 text-[26px] font-black tabular-nums tracking-tight text-slate-900 dark:text-white">
        {value}
      </p>
      <p className="text-[12.5px] font-semibold text-slate-500 dark:text-slate-400">{label}</p>
      {data.length > 1 && (
        <div className="mt-2 h-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 2, bottom: 0, left: 0, right: 0 }}>
              <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={color} fillOpacity={0.18} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
