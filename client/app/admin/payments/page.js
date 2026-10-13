"use client";

// ---------------------------------------------------------------------------
// HotelFlow admin Payments (/admin/payments) — payment records derived from
// bookings (no dedicated payments endpoint exists yet): approved/completed
// read as Paid, pending as Pending, cancelled/rejected as Failed. Summary
// cards, search, CSV export + print. Clearly labeled fallback when offline.
// ---------------------------------------------------------------------------

import { useMemo } from "react";
import { Wallet, Clock, XCircle } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import { CardSkeleton } from "../../components/admin/Skeleton";
import { useAdminFetch, normalizeBooking, DUMMY_BOOKINGS } from "../../components/admin/dummy";
import { formatBDT, formatDateBD } from "../../lib/format";

const STATE = {
  Paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  Failed: "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400",
};

const toPayment = (b) => ({
  id: `pay-${b.id}`,
  bookingId: b.id,
  guest: b.guest,
  room: b.room,
  method: b.paymentMethod || "Cash at hotel",
  amount: b.totalPrice,
  state: ["approved", "completed"].includes(b.status) ? "Paid" : b.status === "pending" ? "Pending" : "Failed",
  date: b.createdAt,
});

export default function AdminPayments() {
  const { data, loading, isFallback } = useAdminFetch("/api/bookings", DUMMY_BOOKINGS);

  const payments = useMemo(
    () => (data || []).map((b) => toPayment(b.id && b.guest ? b : normalizeBooking(b))),
    [data]
  );
  const sum = (s) => payments.filter((p) => p.state === s).reduce((t, p) => t + p.amount, 0);

  const cards = [
    { icon: Wallet, label: "Collected", value: formatBDT(sum("Paid")), color: "#16A34A" },
    { icon: Clock, label: "Pending", value: formatBDT(sum("Pending")), color: "#F59E0B" },
    { icon: XCircle, label: "Failed", value: formatBDT(sum("Failed")), color: "#DC2626" },
  ];

  const columns = [
    { key: "bookingId", label: "Booking", sortable: true, render: (p) => <span className="font-mono text-[12px]">{p.bookingId.slice(-6)}</span> },
    { key: "guest", label: "Guest", sortable: true, render: (p) => <span className="font-bold text-slate-900 dark:text-white">{p.guest}</span> },
    { key: "room", label: "Room", sortable: true },
    { key: "method", label: "Method", sortable: true },
    { key: "amount", label: "Amount", sortable: true, render: (p) => <span className="font-black tabular-nums">{formatBDT(p.amount)}</span> },
    { key: "state", label: "State", render: (p) => (
      <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-black ${STATE[p.state]}`}>{p.state}</span>
    ) },
    { key: "date", label: "Date", sortable: true, render: (p) => formatDateBD(p.date) || "—" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {loading
          ? [<CardSkeleton key="a" />, <CardSkeleton key="b" />, <CardSkeleton key="c" />]
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
      {isFallback && (
        <p className="inline-block rounded-full bg-amber-100 px-3 py-1 text-[11px] font-black uppercase text-amber-700">Sample data</p>
      )}
      <DataTable
        columns={columns}
        rows={payments}
        loading={loading}
        searchKeys={["guest", "room", "method", "bookingId"]}
        searchPlaceholder="Search guest, room or method…"
        exportName="hotelFlow-payments"
        printTitle="HotelFlow Payments Report"
        emptyTitle="No payments found"
      />
    </div>
  );
}
