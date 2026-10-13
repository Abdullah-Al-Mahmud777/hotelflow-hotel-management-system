"use client";

import { useState } from "react";
import { Award, Ticket, Copy, Gift, Check } from "lucide-react";
import { EmptyState, formatPrice, useToast } from "./ui";
import { redeemLoyalty, validateCoupon, listCoupons } from "../../../lib/dashboardApi";
import { useEffect } from "react";

export default function Rewards({ loyalty, loading, onChanged }) {
  const toast = useToast();
  const [points, setPoints] = useState(100);
  const [busy, setBusy] = useState(false);
  const [coupons, setCoupons] = useState(null);
  const [code, setCode] = useState("");
  const [quote, setQuote] = useState(null);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    let alive = true;
    listCoupons({ limit: 20 }).then((d) => { if (alive) setCoupons(d); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  const redeem = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const key = `redeem:${Date.now()}:${Math.random().toString(36).slice(2, 9)}`;
      const r = await redeemLoyalty(Number(points), key);
      toast(`Redeemed! Coupon ${r.coupon.code} ($${r.coupon.value} off)`, "success");
      onChanged?.();
    } catch (err) {
      toast(err?.message || "Redemption failed", "error");
    } finally {
      setBusy(false);
    }
  };

  const check = async (e) => {
    e.preventDefault();
    try {
      const r = await validateCoupon(code.trim(), 200);
      setQuote(r);
      toast(`Valid: -$${r.discount}`, "success");
    } catch (err) {
      setQuote(null);
      toast(err?.message || "Invalid coupon", "error");
    }
  };

  const copy = async (c) => {
    try {
      await navigator.clipboard.writeText(c);
      setCopied(c);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast("Copy failed", "error");
    }
  };

  const balance = loyalty?.balance ?? 0;
  const history = loyalty?.history || [];

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Rewards & Coupons</h2>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Loyalty */}
        <section aria-label="Loyalty points" className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Award className="h-5 w-5 text-amber-500" /> Loyalty Points
          </h3>
          {loading ? (
            <div className="mt-4 h-12 animate-pulse rounded-xl bg-slate-100" />
          ) : (
            <>
              <p className="mt-3 text-4xl font-bold text-slate-900">{balance.toLocaleString()} <span className="text-sm font-medium text-slate-500">pts</span></p>
              <p className="mt-1 text-xs text-slate-500">1 pt per ৳500 of approved spend · {loyalty?.earnedLifetime ?? 0} earned lifetime</p>
              <form onSubmit={redeem} className="mt-4 flex gap-2">
                <label htmlFor="redeem-pts" className="sr-only">Points to redeem</label>
                <input id="redeem-pts" type="number" min={100} step={100} value={points} onChange={(e) => setPoints(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
                <button disabled={busy || balance < 100} className="shrink-0 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-40">
                  {busy ? "…" : "Redeem"}
                </button>
              </form>
              <p className="mt-1 text-xs text-slate-400">100 pts = ৳500 promo coupon (min ৳5,000 spend).</p>
              {history.length > 0 && (
                <ul className="mt-4 max-h-48 space-y-2 overflow-y-auto">
                  {history.map((t) => (
                    <li key={t._id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                      <span className="font-medium capitalize text-slate-700">{t.kind} · {t.ref || ""}</span>
                      <span className={`font-bold ${t.kind === "earn" ? "text-green-700" : "text-slate-900"}`}>
                        {t.kind === "earn" ? "+" : "-"}{t.points}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>

        {/* Coupons */}
        <section aria-label="Coupons and promo codes" className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Ticket className="h-5 w-5 text-blue-500" /> Coupons & Promo Codes
          </h3>
          <form onSubmit={check} className="mt-4 flex gap-2">
            <label htmlFor="coupon-check" className="sr-only">Validate coupon code</label>
            <input id="coupon-check" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Enter code (e.g. WELCOME10)" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm uppercase outline-none placeholder:normal-case focus:border-blue-500" />
            <button className="shrink-0 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700">
              Validate
            </button>
          </form>
          {quote && <p className="mt-2 text-sm font-medium text-green-700">Valid on ৳15,000 stay: -৳{quote.discount} → ৳{quote.total}</p>}

          <div className="mt-4 space-y-2">
            {(!coupons || (coupons.data || []).length === 0) && (
              <EmptyState icon={Gift} title="No active promos" hint="Redeem loyalty points to mint your own coupon" />
            )}
            {(coupons?.data || []).map((c) => (
              <div key={c._id || c.code} className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3">
                <div>
                  <p className="font-mono text-sm font-bold text-slate-900">{c.code}</p>
                  <p className="text-xs text-slate-500">
                    {c.kind === "percent" ? `${c.value}% off` : `${formatPrice(c.value)} off`}
                    {c.minSpend > 0 ? ` · min ${formatPrice(c.minSpend)}` : ""}
                    {c.expiresAt ? ` · ends ${new Date(c.expiresAt).toLocaleDateString()}` : ""}
                  </p>
                </div>
                <button onClick={() => copy(c.code)} aria-label={`Copy ${c.code}`} className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-slate-900">
                  {copied === c.code ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
