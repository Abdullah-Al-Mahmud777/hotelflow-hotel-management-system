"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useToast } from "./ui";
import { getPreferences, updatePreferences } from "../../../lib/dashboardApi";

const inputCls =
  "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15";

const AMENITY_OPTIONS = ["WiFi", "Pool", "Spa", "Gym", "Breakfast", "Parking", "Sea view", "Balcony"];

export default function Preferences() {
  const toast = useToast();
  const [form, setForm] = useState({ roomType: "Any", amenities: [], bedType: "", dietary: "", notes: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    getPreferences()
      .then((d) => { if (alive && d) setForm((f) => ({ ...f, ...d })); })
      .catch((err) => toast(err?.message || "Preferences failed to load", "error"))
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleAmenity = (a) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a].slice(0, 20),
    }));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = await updatePreferences(form);
      setForm((f) => ({ ...f, ...saved }));
      toast("Preferences saved", "success");
    } catch (err) {
      toast(err?.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div aria-busy="true" className="h-48 animate-pulse rounded-xl bg-slate-100" />;

  return (
    <form onSubmit={save} className="rounded-xl bg-white p-6 shadow-sm">
      <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
        <SlidersHorizontal className="h-4 w-4" /> Room Preferences & Special Requests
      </h3>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pref-type" className="mb-1.5 block text-sm font-medium text-slate-700">Preferred room type</label>
          <select id="pref-type" value={form.roomType} onChange={(e) => setForm({ ...form, roomType: e.target.value })} className={inputCls}>
            {["Any", "Standard", "Deluxe", "Suite"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="pref-bed" className="mb-1.5 block text-sm font-medium text-slate-700">Bed preference</label>
          <input id="pref-bed" value={form.bedType} onChange={(e) => setForm({ ...form, bedType: e.target.value })} placeholder="King, twin…" maxLength={100} className={inputCls} />
        </div>
      </div>
      <fieldset className="mt-4">
        <legend className="mb-2 text-sm font-medium text-slate-700">Must-have amenities</legend>
        <div className="flex flex-wrap gap-2">
          {AMENITY_OPTIONS.map((a) => (
            <button
              key={a}
              type="button"
              aria-pressed={form.amenities.includes(a)}
              onClick={() => toggleAmenity(a)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${form.amenities.includes(a) ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {a}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pref-diet" className="mb-1.5 block text-sm font-medium text-slate-700">Dietary needs</label>
          <input id="pref-diet" value={form.dietary} onChange={(e) => setForm({ ...form, dietary: e.target.value })} placeholder="Vegetarian, halal…" maxLength={100} className={inputCls} />
        </div>
        <div>
          <label htmlFor="pref-notes" className="mb-1.5 block text-sm font-medium text-slate-700">Default special requests</label>
          <input id="pref-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="High floor, quiet…" maxLength={500} className={inputCls} />
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-400">Saved preferences pre-fill future reservations and power recommendations.</p>
      <button disabled={saving} className="mt-4 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
        {saving ? "Saving…" : "Save preferences"}
      </button>
    </form>
  );
}
