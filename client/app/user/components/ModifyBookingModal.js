"use client";

import { useState } from "react";
import { Pencil, Ticket } from "lucide-react";
import { useToast } from "./ui";
import { modifyBooking, validateCoupon } from "../../../lib/dashboardApi";

const inputCls =
  "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15";

export default function ModifyBookingModal({ booking, onClose, onSaved }) {
  const toast = useToast();
  const toISO = (v) => (v ? new Date(v).toISOString().slice(0, 10) : "");
  const [form, setForm] = useState({
    checkIn: toISO(booking.checkIn),
    checkOut: toISO(booking.checkOut),
    numberOfGuests: booking.numberOfGuests || 1,
    specialRequests: booking.specialRequests || "",
    couponCode: "",
  });
  const [busy, setBusy] = useState(false);
  const [quote, setQuote] = useState(null);

  const checkCoupon = async () => {
    if (!form.couponCode.trim()) {
      toast("Enter a coupon code first", "error");
      return;
    }
    try {
      const nights = Math.max(1, Math.ceil((new Date(form.checkOut) - new Date(form.checkIn)) / 86400000));
      const subtotal = nights * Number(booking.room?.price || 0);
      const r = await validateCoupon(form.couponCode.trim(), subtotal);
      setQuote(r);
      toast(`Coupon valid: -$${r.discount}`, "success");
    } catch (err) {
      setQuote(null);
      toast(err?.message || "Invalid coupon", "error");
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        checkIn: form.checkIn || undefined,
        checkOut: form.checkOut || undefined,
        numberOfGuests: Number(form.numberOfGuests),
        specialRequests: form.specialRequests,
      };
      if (form.couponCode.trim()) payload.couponCode = form.couponCode.trim();
      await modifyBooking(booking._id || booking.id, payload);
      toast("Reservation updated", "success");
      onSaved?.();
      onClose?.();
    } catch (err) {
      toast(err?.message || "Modification failed", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Modify reservation" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form onSubmit={save} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <Pencil className="h-5 w-5 text-slate-400" /> Modify reservation
        </h3>
        <p className="mt-1 text-xs text-slate-500">Pending trips modify anytime · approved trips 48h+ before check-in.</p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="mod-in" className="mb-1.5 block text-sm font-medium text-slate-700">Check-in</label>
            <input id="mod-in" type="date" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label htmlFor="mod-out" className="mb-1.5 block text-sm font-medium text-slate-700">Check-out</label>
            <input id="mod-out" type="date" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label htmlFor="mod-guests" className="mb-1.5 block text-sm font-medium text-slate-700">Guests (max {booking.room?.capacity || "—"})</label>
            <input id="mod-guests" type="number" min={1} max={booking.room?.capacity || 10} value={form.numberOfGuests} onChange={(e) => setForm({ ...form, numberOfGuests: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label htmlFor="mod-coupon" className="mb-1.5 block text-sm font-medium text-slate-700">Coupon code</label>
            <div className="flex gap-2">
              <input id="mod-coupon" value={form.couponCode} onChange={(e) => setForm({ ...form, couponCode: e.target.value.toUpperCase() })} placeholder="WELCOME10" className={inputCls} />
              <button type="button" onClick={checkCoupon} aria-label="Validate coupon" className="shrink-0 rounded-xl border border-slate-200 px-3 text-slate-600 hover:bg-slate-50">
                <Ticket className="h-4 w-4" />
              </button>
            </div>
            {quote && <p className="mt-1 text-xs font-medium text-green-700">Saves ${quote.discount} → ${quote.total}</p>}
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="mod-req" className="mb-1.5 block text-sm font-medium text-slate-700">Special requests / room preferences</label>
          <textarea id="mod-req" value={form.specialRequests} onChange={(e) => setForm({ ...form, specialRequests: e.target.value })} rows={3} maxLength={1000} placeholder="High floor, quiet room, early check-in…" className={`${inputCls} resize-none`} />
        </div>

        <div className="mt-5 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button type="submit" disabled={busy} className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
            {busy ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
