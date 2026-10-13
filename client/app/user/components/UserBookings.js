"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  Users,
  Star,
  ChevronRight,
  ChevronDown,
  Search,
  XCircle,
  Pencil,
  Download,
} from "lucide-react";
import {
  StatusBadge,
  EmptyState,
  ListSkeleton,
  ConfirmDialog,
  formatDate,
  formatPrice,
  useToast,
} from "./ui";
import ModifyBookingModal from "./ModifyBookingModal";
import { cancelBooking, downloadInvoicePdf } from "../../../lib/dashboardApi";

const PAGE_SIZE = 5;
const STATUSES = ["all", "pending", "approved", "cancelled", "rejected"];
const SORTS = [
  { id: "newest", label: "Newest first" },
  { id: "checkin", label: "Check-in date" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "price-asc", label: "Price: low to high" },
];

function canCancel(b) {
  if (["cancelled", "rejected"].includes(b.status)) return { ok: false, reason: `Already ${b.status}` };
  if (b.status === "pending") return { ok: true };
  if (b.status === "approved") {
    const ms = new Date(b.checkIn).getTime() - Date.now();
    if (Number.isNaN(ms) || ms <= 0) return { ok: false, reason: "Stay already started" };
    if (ms < 24 * 60 * 60 * 1000) return { ok: false, reason: "Only 24h+ before check-in" };
    return { ok: true };
  }
  return { ok: false, reason: "Not cancellable" };
}

function Timeline({ booking }) {
  const steps = [
    { label: "Requested", done: true, date: booking.createdAt },
    { label: "Approved", done: ["approved"].includes(booking.status), date: booking.approvedAt },
    {
      label: booking.status === "cancelled" ? "Cancelled" : booking.status === "rejected" ? "Rejected" : "Stay",
      done: ["approved", "cancelled", "rejected"].includes(booking.status),
      date: booking.status === "cancelled" ? booking.updatedAt : booking.checkIn,
      tone: booking.status === "cancelled" || booking.status === "rejected" ? "red" : "green",
    },
  ];
  return (
    <ol aria-label="Booking status timeline" className="mt-4 space-y-0 border-l-2 border-slate-200 pl-0">
      {steps.map((s) => (
        <li key={s.label} className="relative pb-4 pl-5 last:pb-0">
          <span
            className={`absolute -left-[7px] top-1 h-3 w-3 rounded-full ${
              s.tone === "red" ? "bg-red-500" : s.done ? "bg-green-500" : "bg-slate-300"
            }`}
          />
          <p className="text-sm font-medium text-slate-900">{s.label}</p>
          <p className="text-xs text-slate-500">{formatDate(s.date)}</p>
        </li>
      ))}
    </ol>
  );
}

export default function UserBookings({ bookings = [], reviews = [], loading, onChanged }) {
  const router = useRouter();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [modifyTarget, setModifyTarget] = useState(null);
  const [pdfBusy, setPdfBusy] = useState(null);

  const reviewedIds = useMemo(
    () => new Set([...reviews.map((r) => String(r.booking))]),
    [reviews]
  );

  const filtered = useMemo(() => {
    let list = [...bookings];
    if (status !== "all") list = list.filter((b) => b.status === status);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((b) =>
        `${b.room?.name || ""} ${b.room?.type || ""} ${b.guestName || ""} ${b.status}`.toLowerCase().includes(q)
      );
    }
    switch (sort) {
      case "checkin":
        list.sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn));
        break;
      case "price-desc":
        list.sort((a, b) => (Number(b.totalPrice) || 0) - (Number(a.totalPrice) || 0));
        break;
      case "price-asc":
        list.sort((a, b) => (Number(a.totalPrice) || 0) - (Number(b.totalPrice) || 0));
        break;
      default:
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return list;
  }, [bookings, status, query, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const doCancel = async () => {
    if (!confirmId) return;
    setBusy(true);
    try {
      await cancelBooking(confirmId);
      toast("Booking cancelled", "success");
      setConfirmId(null);
      setOpenId(null);
      onChanged?.();
    } catch (err) {
      toast(err?.message || "Cancellation failed", "error");
    } finally {
      setBusy(false);
    }
  };

  const doPdf = async (id) => {
    setPdfBusy(id);
    try {
      await downloadInvoicePdf(id);
      toast("PDF invoice downloaded", "success");
    } catch (err) {
      toast(err?.message || "PDF download failed", "error");
    } finally {
      setPdfBusy(null);
    }
  };

  const modifiable = (b) => {
    if (["cancelled", "rejected"].includes(b.status)) return false;
    if (b.status === "pending") return true;
    const ms = new Date(b.checkIn).getTime() - Date.now();
    return !Number.isNaN(ms) && ms > 2 * 24 * 60 * 60 * 1000;
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">My Bookings</h2>
        <button
          onClick={() => router.push("/rooms")}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          New booking
        </button>
      </div>

      {/* Search / filter / sort */}
      <div className="mb-4 flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm lg:flex-row lg:items-center">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search room, guest, status…"
            aria-label="Search bookings"
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
          />
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              aria-pressed={status === s}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition ${
                status === s ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort bookings"
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
        >
          {SORTS.map((o) => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <ListSkeleton rows={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={bookings.length === 0 ? "No bookings yet" : "No bookings match your filters"}
          hint={bookings.length === 0 ? "Browse rooms to make your first reservation" : "Try a different search or status"}
          action={
            <button onClick={() => router.push("/rooms")} className="mt-4 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700">
              Browse Rooms
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {visible.map((booking) => {
            const id = booking._id || booking.id;
            const open = openId === id;
            const rule = canCancel(booking);
            return (
              <article key={id} className="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row">
                  {booking.room?.image && (
                    <div className="h-32 overflow-hidden rounded-xl bg-slate-100 lg:h-auto lg:w-48">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={booking.room.image} alt={booking.room.name} loading="lazy" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold text-slate-900">{booking.room?.name || "Room"}</h3>
                        <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
                          <MapPin className="h-3.5 w-3.5" /> {booking.room?.type || "—"}
                        </p>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>

                    <dl className="mb-4 grid grid-cols-2 gap-4">
                      <div>
                        <dt className="flex items-center gap-1 text-xs text-slate-500"><Calendar className="h-3.5 w-3.5" /> Check-in</dt>
                        <dd className="mt-0.5 text-sm font-semibold text-slate-900">{formatDate(booking.checkIn)}</dd>
                      </div>
                      <div>
                        <dt className="flex items-center gap-1 text-xs text-slate-500"><Calendar className="h-3.5 w-3.5" /> Check-out</dt>
                        <dd className="mt-0.5 text-sm font-semibold text-slate-900">{formatDate(booking.checkOut)}</dd>
                      </div>
                      <div>
                        <dt className="flex items-center gap-1 text-xs text-slate-500"><Users className="h-3.5 w-3.5" /> Guests</dt>
                        <dd className="mt-0.5 text-sm font-semibold text-slate-900">{booking.numberOfGuests ?? "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-500">Total Price</dt>
                        <dd className="mt-0.5 text-base font-bold text-slate-900">{formatPrice(booking.totalPrice)}</dd>
                      </div>
                    </dl>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setOpenId(open ? null : id)}
                        aria-expanded={open}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        {open ? "Hide details" : "View details"}
                        <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
                      </button>
                      {booking.status === "approved" && !reviewedIds.has(String(id)) && (
                        <button
                          onClick={() => router.push(`/user/review/${id}`)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                        >
                          <Star className="h-4 w-4" /> Write Review
                        </button>
                      )}
                      {modifiable(booking) && (
                        <button
                          onClick={() => setModifyTarget(booking)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 px-3.5 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
                        >
                          <Pencil className="h-4 w-4" /> Modify
                        </button>
                      )}
                      <button
                        onClick={() => doPdf(id)}
                        disabled={pdfBusy === id}
                        aria-label="Download PDF confirmation and invoice"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                      >
                        <Download className="h-4 w-4" /> {pdfBusy === id ? "…" : "PDF"}
                      </button>
                      {rule.ok ? (
                        <button
                          onClick={() => setConfirmId(id)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3.5 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4" /> Cancel booking
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400" title={rule.reason}>
                          {booking.status === "approved" ? `Cancellation: ${rule.reason}` : ""}
                        </span>
                      )}
                      <ChevronRight className="ml-auto h-4 w-4 text-slate-300" />
                    </div>

                    {open && (
                      <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm">
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <p><span className="text-slate-500">Guest:</span> <span className="font-medium text-slate-900">{booking.guestName || "—"}</span></p>
                          <p><span className="text-slate-500">Email:</span> <span className="font-medium text-slate-900">{booking.guestEmail || "—"}</span></p>
                          <p><span className="text-slate-500">Phone:</span> <span className="font-medium text-slate-900">{booking.guestPhone || "—"}</span></p>
                          <p><span className="text-slate-500">Booking ID:</span> <span className="font-mono text-xs text-slate-900">{id}</span></p>
                        </div>
                        {booking.specialRequests && (
                          <p className="mt-2"><span className="text-slate-500">Requests:</span> <span className="text-slate-700">{booking.specialRequests}</span></p>
                        )}
                        {booking.couponCode && (
                          <p className="mt-2"><span className="text-slate-500">Coupon:</span> <span className="font-mono font-medium text-green-700">{booking.couponCode}</span> <span className="text-slate-500">(−{formatPrice(booking.discount)})</span></p>
                        )}
                        <Timeline booking={booking} />
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}

          {/* Pagination */}
          {pages > 1 && (
            <nav aria-label="Bookings pagination" className="flex items-center justify-center gap-2 pt-2">
              <button disabled={safePage <= 1} onClick={() => setPage(safePage - 1)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-40">
                Prev
              </button>
              <span className="text-sm text-slate-500">Page {safePage} of {pages}</span>
              <button disabled={safePage >= pages} onClick={() => setPage(safePage + 1)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-40">
                Next
              </button>
            </nav>
          )}
        </div>
      )}

      {confirmId && (
        <ConfirmDialog
          title="Cancel this booking?"
          body="This frees the room for those dates. Cancelled stays move to refund-pending in Payments."
          confirmLabel="Yes, cancel"
          busy={busy}
          onCancel={() => setConfirmId(null)}
          onConfirm={doCancel}
        />
      )}

      {modifyTarget && (
        <ModifyBookingModal
          booking={modifyTarget}
          onClose={() => setModifyTarget(null)}
          onSaved={() => { setModifyTarget(null); onChanged?.(); }}
        />
      )}
    </div>
  );
}
