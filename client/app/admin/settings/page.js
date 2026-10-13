"use client";

// ---------------------------------------------------------------------------
// HotelFlow admin Settings (/admin/settings) — hotel profile, notification
// preferences and display currency (fixed to BDT). Saved to localStorage
// with a toast confirmation.
// ---------------------------------------------------------------------------

import { useState, useEffect } from "react";
import { Building2, Bell, Wallet } from "lucide-react";
import { toast } from "../../components/admin/Toast";

const KEY = "hf-settings";

const DEFAULTS = {
  hotelName: "HotelFlow Grand, Dhaka",
  address: "House 25, Road 12, Dhanmondi, Dhaka 1209, Bangladesh",
  phone: "+880 1712-345678",
  email: "support@hotelflow.com.bd",
  checkIn: "2:00 PM",
  checkOut: "12:00 PM",
  currency: "BDT",
  emailBookings: true,
  smsBookings: false,
  reviewAlerts: true,
  weeklyReport: true,
};

export default function AdminSettings() {
  const [form, setForm] = useState(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setForm({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {
      /* keep defaults */
    }
  }, []);

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const save = (e) => {
    e.preventDefault();
    localStorage.setItem(KEY, JSON.stringify(form));
    toast.success("Settings saved.");
  };

  const input =
    "mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-[13px] font-medium outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white";

  return (
    <form onSubmit={save} className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {/* Hotel profile */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="flex items-center gap-2 text-[16px] font-bold text-slate-900 dark:text-white">
          <Building2 className="h-5 w-5 text-[#2563EB]" /> Hotel Profile
        </h3>
        <div className="mt-4 space-y-3">
          <label className="block text-[13px] font-semibold">
            Hotel name
            <input value={form.hotelName} onChange={set("hotelName")} className={input} />
          </label>
          <label className="block text-[13px] font-semibold">
            Address
            <input value={form.address} onChange={set("address")} className={input} />
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block text-[13px] font-semibold">
              Phone
              <input value={form.phone} onChange={set("phone")} placeholder="+880 1XXX-XXXXXX" className={input} />
            </label>
            <label className="block text-[13px] font-semibold">
              Email
              <input type="email" value={form.email} onChange={set("email")} className={input} />
            </label>
            <label className="block text-[13px] font-semibold">
              Check-in time
              <input value={form.checkIn} onChange={set("checkIn")} className={input} />
            </label>
            <label className="block text-[13px] font-semibold">
              Check-out time
              <input value={form.checkOut} onChange={set("checkOut")} className={input} />
            </label>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        {/* Notifications */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h3 className="flex items-center gap-2 text-[16px] font-bold text-slate-900 dark:text-white">
            <Bell className="h-5 w-5 text-[#2563EB]" /> Notifications
          </h3>
          <div className="mt-4 space-y-2.5">
            {[
              ["emailBookings", "Email me on new bookings"],
              ["smsBookings", "SMS alerts for new bookings"],
              ["reviewAlerts", "Notify me about new reviews"],
              ["weeklyReport", "Send weekly revenue summary"],
            ].map(([k, label]) => (
              <label key={k} className="flex cursor-pointer items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 text-[13px] font-semibold dark:bg-slate-700/40">
                {label}
                <input
                  type="checkbox"
                  checked={!!form[k]}
                  onChange={set(k)}
                  className="h-5 w-5 accent-[#2563EB]"
                />
              </label>
            ))}
          </div>
        </section>

        {/* Display */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h3 className="flex items-center gap-2 text-[16px] font-bold text-slate-900 dark:text-white">
            <Wallet className="h-5 w-5 text-[#2563EB]" /> Display Currency
          </h3>
          <label className="mt-4 block text-[13px] font-semibold">
            Currency
            <select value={form.currency} disabled className={`${input} cursor-not-allowed opacity-70`}>
              <option value="BDT">BDT — Bangladeshi Taka (৳)</option>
            </select>
          </label>
          <p className="mt-1.5 text-[12px] text-slate-500">
            HotelFlow Bangladesh operates in Taka only. Prices show lakh-style grouping (৳1,25,000).
          </p>
          <button
            type="submit"
            className="mt-4 w-full rounded-xl bg-[#2563EB] py-3 text-sm font-bold text-white transition hover:bg-blue-700 active:scale-[0.99]"
          >
            Save settings
          </button>
        </section>
      </div>
    </form>
  );
}
