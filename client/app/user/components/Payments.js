"use client";

import { useMemo, useState } from "react";
import { Receipt, Download, Wallet } from "lucide-react";
import {
  StatusBadge,
  EmptyState,
  ListSkeleton,
  formatDate,
  formatPrice,
  useToast,
} from "./ui";
import { getInvoiceBooking, downloadInvoicePdf } from "../../../lib/dashboardApi";

function invoiceText(inv) {
  const lines = [
    "HOTELFLOW — BOOKING INVOICE",
    `Booking ID: ${inv._id || inv.id}`,
    `Guest: ${inv.guestName || ""} <${inv.guestEmail || ""}>`,
    `Room: ${inv.room?.name || ""} (${inv.room?.type || ""})`,
    `Check-in: ${inv.checkIn ? new Date(inv.checkIn).toLocaleDateString() : ""}`,
    `Check-out: ${inv.checkOut ? new Date(inv.checkOut).toLocaleDateString() : ""}`,
    `Guests: ${inv.numberOfGuests ?? 1}`,
    `Status: ${inv.status || ""}`,
    `Total: $${Number(inv.totalPrice) || 0}`,
  ];
  return lines.join("\n");
}

export default function Payments({ payments, loading, onToast }) {
  const toast = useToast();
  const [busyId, setBusyId] = useState(null);
  const data = useMemo(() => payments?.data || [], [payments]);
  const totals = payments?.totals || { paid: 0, pending: 0, refundPending: 0 };

  const refunds = useMemo(() => data.filter((t) => t.paymentStatus === "refund-pending"), [data]);

  const download = async (bookingId) => {
    setBusyId(bookingId);
    try {
      // Verified PDF confirmation+invoice from the server (pdfkit)
      await downloadInvoicePdf(bookingId);
      toast("PDF invoice downloaded", "success");
      onToast?.("PDF invoice downloaded", "success");
    } catch (err) {
      // Fallback: render the verified JSON payload as a text invoice
      try {
        const inv = await getInvoiceBooking(bookingId);
        const blob = new Blob([invoiceText(inv)], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `hotelflow-invoice-${bookingId}.txt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast("Invoice downloaded (text fallback)", "success");
        onToast?.("Invoice downloaded (text fallback)", "success");
      } catch (fallbackErr) {
        toast(fallbackErr?.message || err?.message || "Invoice download failed", "error");
      }
    } finally {
      setBusyId(null);
    }
  };

  const summary = [
    { label: "Paid", value: formatPrice(totals.paid), tone: "bg-green-500" },
    { label: "Pending", value: formatPrice(totals.pending), tone: "bg-amber-500" },
    { label: "Refund-pending", value: formatPrice(totals.refundPending), tone: "bg-orange-500" },
  ];

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Payments</h2>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {summary.map((s) => (
          <div key={s.label} className="rounded-xl bg-white p-5 shadow-sm">
            <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <span className={`h-2.5 w-2.5 rounded-full ${s.tone}`} /> {s.label}
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      {refunds.length > 0 && (
        <section aria-label="Refund status" className="mb-5 rounded-xl border border-orange-200 bg-orange-50 p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold text-orange-900">
            <Wallet className="h-4 w-4" /> {refunds.length} refund{refunds.length === 1 ? "" : "s"} in progress
          </h3>
          <p className="mt-1 text-xs text-orange-800">Cancelled stays are refunded to the original payment method within 3–5 business days.</p>
        </section>
      )}

      <section aria-label="Payment history" className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <Receipt className="h-5 w-5 text-slate-400" strokeWidth={2} /> Payment history
        </h3>
        {loading ? (
          <div className="mt-4"><ListSkeleton rows={4} /></div>
        ) : data.length === 0 ? (
          <div className="mt-4">
            <EmptyState icon={Receipt} title="No payments yet" hint="Approved bookings appear here as paid charges" />
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                  <th className="pb-3 pr-4 font-semibold">Stay</th>
                  <th className="pb-3 pr-4 font-semibold">Date</th>
                  <th className="pb-3 pr-4 font-semibold">Payment</th>
                  <th className="pb-3 pr-4 text-right font-semibold">Amount</th>
                  <th className="pb-3 text-right font-semibold">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((t) => (
                  <tr key={t.id} className="transition hover:bg-slate-50">
                    <td className="py-3.5 pr-4 font-medium text-slate-900">{t.room}</td>
                    <td className="py-3.5 pr-4 text-slate-500">{formatDate(t.date)}</td>
                    <td className="py-3.5 pr-4"><StatusBadge status={t.paymentStatus} /></td>
                    <td className="py-3.5 pr-4 text-right font-semibold text-slate-900">{formatPrice(t.amount)}</td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => download(t.bookingId)}
                        disabled={busyId === t.bookingId}
                        aria-label={`Download PDF invoice for ${t.room}`}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                      >
                        <Download className="h-3.5 w-3.5" /> {busyId === t.bookingId ? "…" : "PDF"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
