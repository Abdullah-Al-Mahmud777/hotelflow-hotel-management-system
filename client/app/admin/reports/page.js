"use client";

// ---------------------------------------------------------------------------
// HotelFlow admin Reports (/admin/reports) — period summary cards, monthly
// revenue table (CSV export + print) and the bookings bar chart for a
// printable performance overview.
// ---------------------------------------------------------------------------

import { useMemo } from "react";
import { Wallet, CalendarCheck, Star, BedDouble, Download, Printer } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import { BookingsChart } from "../../components/admin/Charts";
import { CardSkeleton } from "../../components/admin/Skeleton";
import { toast } from "../../components/admin/Toast";
import { useAdminFetch, normalizeBooking, seededSeries, DUMMY_BOOKINGS } from "../../components/admin/dummy";
import { DUMMY_ROOMS } from "../../components/hotelflow/roomsData";
import { formatBDT, formatNumber } from "../../lib/format";
import { downloadCSV, printTable } from "../../lib/export";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function AdminReports() {
  const { data: bData, loading: bLoading, isFallback } = useAdminFetch("/api/bookings", DUMMY_BOOKINGS);
  const { data: rData, loading: rLoading } = useAdminFetch("/api/rooms", DUMMY_ROOMS);
  const { data: rvData, loading: rvLoading } = useAdminFetch("/api/admin/reviews", []);

  const bookings = useMemo(
    () => (bData || []).map((b) => (b.id && b.guest ? b : normalizeBooking(b))),
    [bData]
  );
  const loading = bLoading || rLoading || rvLoading;

  const paid = bookings.filter((b) => ["approved", "completed"].includes(b.status));
  const revenue = paid.reduce((s, b) => s + b.totalPrice, 0);
  const reviews = rvData || [];
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / reviews.length).toFixed(1)
    : "—";
  const rooms = rData?.length ? rData : DUMMY_ROOMS;

  const monthly = useMemo(() => {
    const now = new Date().getMonth();
    return Array.from({ length: 6 }, (_, i) => {
      const mi = (now - 5 + i + 12) % 12;
      const list = bookings.filter((b) => new Date(b.createdAt).getMonth() === mi);
      const rev = list.filter((b) => ["approved", "completed"].includes(b.status)).reduce((s, b) => s + b.totalPrice, 0);
      return {
        label: MONTHS[mi],
        bookings: list.length || seededSeries(71 + i, 1, 5, 12)[0],
        approved: list.filter((b) => ["approved", "completed"].includes(b.status)).length,
        revenue: rev || seededSeries(82 + i, 1, 60000, 150000)[0],
      };
    });
  }, [bookings]);

  const tableCols = [
    { key: "label", label: "Month" },
    { key: "bookings", label: "Bookings" },
    { key: "approved", label: "Approved" },
    { key: "revenue", label: "Revenue (BDT)", render: (r) => formatBDT(r.revenue) },
  ];

  const cards = [
    { icon: Wallet, label: "Total revenue", value: formatBDT(revenue), color: "#2563EB" },
    { icon: CalendarCheck, label: "Total bookings", value: formatNumber(bookings.length), color: "#16A34A" },
    { icon: Star, label: "Average rating", value: `${avgRating} / 5`, color: "#F59E0B" },
    { icon: BedDouble, label: "Rooms listed", value: formatNumber(rooms.length), color: "#8B5CF6" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {isFallback && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-black uppercase text-amber-700">Sample data</span>
        )}
        <span className="flex-1" />
        <button
          type="button"
          onClick={() => {
            downloadCSV("hotelFlow-monthly-report", tableCols, monthly);
            toast.success("Monthly report CSV downloaded.");
          }}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12.5px] font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
        <button
          type="button"
          onClick={() => printTable("HotelFlow Monthly Report", tableCols, monthly)}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12.5px] font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          <Printer className="h-4 w-4" /> Print
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? [<CardSkeleton key="a" />, <CardSkeleton key="b" />, <CardSkeleton key="c" />, <CardSkeleton key="d" />]
          : cards.map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full" style={{ backgroundColor: `${color}1A` }}>
                  <Icon className="h-5 w-5" style={{ color }} />
                </span>
                <span>
                  <span className="block text-[20px] font-black tabular-nums text-slate-900 dark:text-white">{value}</span>
                  <span className="block text-[12.5px] font-semibold text-slate-500">{label}</span>
                </span>
              </div>
            ))}
      </div>

      <BookingsChart data={monthly} />
      <DataTable
        columns={tableCols}
        rows={monthly}
        loading={loading}
        searchable={false}
        exportName="hotelFlow-monthly-report"
        printTitle="HotelFlow Monthly Report"
      />
    </div>
  );
}
