"use client";

// ---------------------------------------------------------------------------
// HotelFlow admin Bookings (/admin/bookings) — data table with search,
// status filter chips, sort + pagination (via DataTable), row actions
// (View, Approve, Reject, Cancel) behind a confirmation modal, and a booking
// details side drawer. Toast on every action.
// ---------------------------------------------------------------------------

import { useState, useMemo } from "react";
import { Eye, Check, X, Ban } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import ConfirmModal from "../../components/admin/ConfirmModal";
import { toast } from "../../components/admin/Toast";
import { adminFetch, useAdminFetch, normalizeBooking, DUMMY_BOOKINGS } from "../../components/admin/dummy";
import { formatBDT, formatDateBD } from "../../lib/format";

const STATUSES = ["pending", "approved", "rejected", "cancelled", "completed"];

const CHIP = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  approved: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  rejected: "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400",
  cancelled: "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
};

export function StatusPill({ status }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-black capitalize ${CHIP[status] || CHIP.pending}`}>
      {status}
    </span>
  );
}

export default function AdminBookings() {
  const { data, loading, isFallback, setData } = useAdminFetch("/api/bookings", DUMMY_BOOKINGS);
  const [chip, setChip] = useState("all");
  const [drawer, setDrawer] = useState(null);
  const [confirm, setConfirm] = useState(null); // { booking, action }
  const [busy, setBusy] = useState(false);

  const bookings = useMemo(
    () => (data || []).map((b) => (b.id && b.guest ? b : normalizeBooking(b))),
    [data]
  );
  const shown = chip === "all" ? bookings : bookings.filter((b) => b.status === chip);
  const counts = useMemo(() => {
    const c = { all: bookings.length };
    STATUSES.forEach((s) => {
      c[s] = bookings.filter((b) => b.status === s).length;
    });
    return c;
  }, [bookings]);

  const setStatus = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      const adminEmail = localStorage.getItem("adminEmail") || "";
      await adminFetch(`/api/bookings/${confirm.booking.id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: confirm.action, adminEmail }),
      });
      setData((prev) => (prev || []).map((b) => {
        const id = String(b._id || b.id);
        return id === confirm.booking.id ? { ...b, status: confirm.action } : b;
      }));
      toast.success(`Booking ${confirm.action}.`);
    } catch (err) {
      toast.error(`Could not update booking (${err.message}).`);
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  };

  const columns = [
    { key: "id", label: "ID", sortable: true, render: (b) => <span className="font-mono text-[12px]">{b.id.slice(-6)}</span> },
    { key: "guest", label: "Guest", sortable: true, render: (b) => <span className="font-bold text-slate-900 dark:text-white">{b.guest}</span> },
    { key: "room", label: "Room", sortable: true },
    { key: "checkIn", label: "Check-in", sortable: true, render: (b) => formatDateBD(b.checkIn) },
    { key: "totalPrice", label: "Total", sortable: true, render: (b) => <span className="font-black tabular-nums">{formatBDT(b.totalPrice)}</span> },
    { key: "status", label: "Status", render: (b) => <StatusPill status={b.status} /> },
    {
      key: "actions",
      label: "Actions",
      render: (b) => (
        <span className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <button type="button" onClick={() => setDrawer(b)} aria-label={`View booking ${b.id}`} title="View" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 dark:border-slate-600">
            <Eye className="h-4 w-4" />
          </button>
          {b.status === "pending" && (
            <>
              <button type="button" onClick={() => setConfirm({ booking: b, action: "approved" })} aria-label={`Approve booking ${b.id}`} title="Approve" className="grid h-8 w-8 place-items-center rounded-lg border border-emerald-200 text-emerald-600 transition hover:bg-emerald-50 dark:border-emerald-500/30">
                <Check className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setConfirm({ booking: b, action: "rejected" })} aria-label={`Reject booking ${b.id}`} title="Reject" className="grid h-8 w-8 place-items-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 dark:border-red-500/30">
                <X className="h-4 w-4" />
              </button>
            </>
          )}
          {["pending", "approved"].includes(b.status) && (
            <button type="button" onClick={() => setConfirm({ booking: b, action: "cancelled" })} aria-label={`Cancel booking ${b.id}`} title="Cancel" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 dark:border-slate-600">
              <Ban className="h-4 w-4" />
            </button>
          )}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Status filter chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        {["all", ...STATUSES].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setChip(s)}
            className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-bold capitalize transition ${
              chip === s ? "bg-[#2563EB] text-white shadow" : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            {s} ({counts[s] || 0})
          </button>
        ))}
        <span className="flex-1" />
        {isFallback && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-black uppercase text-amber-700">Sample data</span>
        )}
      </div>

      <DataTable
        columns={columns}
        rows={shown}
        loading={loading}
        searchKeys={["guest", "room", "id", "phone"]}
        searchPlaceholder="Search guest, room, phone or ID…"
        exportName="hotelFlow-bookings"
        printTitle="HotelFlow Bookings Report"
        emptyTitle="No bookings found"
        emptyHint="Try a different search or status filter."
      />

      {/* Details side drawer */}
      {drawer && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Booking details">
          <div className="absolute inset-0 bg-black/55" onClick={() => setDrawer(null)} />
          <aside className="absolute inset-y-0 right-0 w-[380px] max-w-[92vw] overflow-y-auto bg-white p-6 shadow-2xl dark:bg-slate-800">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">Booking {drawer.id.slice(-6)}</h3>
                <div className="mt-1"><StatusPill status={drawer.status} /></div>
              </div>
              <button type="button" onClick={() => setDrawer(null)} aria-label="Close details" className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 dark:bg-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>
            <dl className="mt-5 space-y-3 text-[13px]">
              {[
                ["Guest", drawer.guest],
                ["Email", drawer.email || "—"],
                ["Phone", drawer.phone || "—"],
                ["Room", drawer.room],
                ["Check-in", formatDateBD(drawer.checkIn)],
                ["Check-out", formatDateBD(drawer.checkOut)],
                ["Guests", drawer.guests],
                ["Payment", drawer.paymentMethod || "Cash at hotel"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 border-b border-slate-100 pb-2.5 dark:border-slate-700">
                  <dt className="text-slate-500">{k}</dt>
                  <dd className="text-right font-bold text-slate-800 dark:text-slate-100">{v}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-3 pt-1">
                <dt className="font-extrabold text-slate-900 dark:text-white">Total</dt>
                <dd className="text-[18px] font-black tabular-nums text-slate-900 dark:text-white">{formatBDT(drawer.totalPrice)}</dd>
              </div>
            </dl>
            {drawer.status === "pending" && (
              <div className="mt-5 flex gap-2">
                <button type="button" onClick={() => { setDrawer(null); setConfirm({ booking: drawer, action: "approved" }); }} className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">
                  Approve
                </button>
                <button type="button" onClick={() => { setDrawer(null); setConfirm({ booking: drawer, action: "rejected" }); }} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-700">
                  Reject
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      <ConfirmModal
        open={!!confirm}
        title={`${confirm?.action === "approved" ? "Approve" : confirm?.action === "rejected" ? "Reject" : "Cancel"} booking?`}
        message={`${confirm?.booking?.guest} • ${confirm?.booking?.room} • ${confirm?.booking?.id}`}
        confirmLabel={confirm?.action === "approved" ? "Approve" : confirm?.action === "rejected" ? "Reject" : "Cancel booking"}
        danger={confirm?.action !== "approved"}
        busy={busy}
        onConfirm={setStatus}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
