"use client";

// ---------------------------------------------------------------------------
// HotelFlow admin Rooms (/admin/rooms) — room inventory with grid/list
// toggle, add/edit modal (image URL + file preview, BDT price, type,
// capacity, amenities, availability toggle), delete with confirmation.
// Backend CRUD first, toast on every action, skeleton grid while loading.
// ---------------------------------------------------------------------------

import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  LayoutGrid,
  List,
  BedDouble,
  X,
} from "lucide-react";
import { adminFetch, useAdminFetch } from "../../components/admin/dummy";
import { DUMMY_ROOMS, ROOM_TYPES, BED_TYPES, ROOM_AMENITIES } from "../../components/hotelflow/roomsData";
import { CardSkeleton, EmptyState } from "../../components/admin/Skeleton";
import ConfirmModal from "../../components/admin/ConfirmModal";
import { toast } from "../../components/admin/Toast";
import { formatBDT } from "../../lib/format";

const EMPTY_FORM = {
  name: "",
  type: "Deluxe",
  price: "",
  capacity: 2,
  beds: "1 Queen bed",
  bedType: "Queen",
  size: 300,
  view: "City view",
  image: "",
  amenities: { wifi: true, ac: true, tv: true, breakfast: true },
  available: true,
};

function RoomModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...(initial || {}) });
  const [preview, setPreview] = useState(initial?.image || initial?.images?.[0] || "");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) {
      toast.error("Room name and price are required.");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        capacity: Number(form.capacity),
        size: Number(form.size),
        image: preview || form.image,
      };
      if (initial?.id) await adminFetch(`/api/rooms/${initial.id}`, { method: "PUT", body: JSON.stringify(payload) });
      else await adminFetch("/api/rooms", { method: "POST", body: JSON.stringify(payload) });
      toast.success(initial?.id ? "Room updated." : "Room added.");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(`Could not save room (${err.message}).`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={initial?.id ? "Edit room" : "Add room"}>
      <div className="absolute inset-0 bg-black/55" onClick={() => !busy && onClose()} />
      <form onSubmit={save} className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">
            {initial?.id ? "Edit Room" : "Add Room"}
          </h3>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 dark:bg-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col text-[13px] font-semibold sm:col-span-2">
            Room name
            <input value={form.name} onChange={set("name")} required placeholder="e.g. Sea View Deluxe" className="mt-1 rounded-xl border border-slate-200 px-3 py-2.5 font-medium outline-none focus:border-[#2563EB] dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
          </label>
          <label className="flex flex-col text-[13px] font-semibold">
            Type
            <select value={form.type} onChange={set("type")} className="mt-1 rounded-xl border border-slate-200 px-3 py-2.5 outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white">
              {ROOM_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col text-[13px] font-semibold">
            Price per night (BDT ৳)
            <input type="number" min={0} step={100} value={form.price} onChange={set("price")} required placeholder="8500" className="mt-1 rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-[#2563EB] dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
          </label>
          <label className="flex flex-col text-[13px] font-semibold">
            Capacity (guests)
            <input type="number" min={1} max={10} value={form.capacity} onChange={set("capacity")} className="mt-1 rounded-xl border border-slate-200 px-3 py-2.5 outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
          </label>
          <label className="flex flex-col text-[13px] font-semibold">
            Bed type
            <select value={form.bedType} onChange={set("bedType")} className="mt-1 rounded-xl border border-slate-200 px-3 py-2.5 outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white">
              {BED_TYPES.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col text-[13px] font-semibold">
            Beds description
            <input value={form.beds} onChange={set("beds")} className="mt-1 rounded-xl border border-slate-200 px-3 py-2.5 outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
          </label>
          <label className="flex flex-col text-[13px] font-semibold">
            Size (sq ft)
            <input type="number" min={0} value={form.size} onChange={set("size")} className="mt-1 rounded-xl border border-slate-200 px-3 py-2.5 outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
          </label>
          <label className="flex flex-col text-[13px] font-semibold sm:col-span-2">
            View
            <input value={form.view} onChange={set("view")} placeholder="Sea view" className="mt-1 rounded-xl border border-slate-200 px-3 py-2.5 outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
          </label>
          {/* Image: paste a URL and/or pick a file for an instant preview */}
          <div className="sm:col-span-2">
            <p className="text-[13px] font-semibold">Room image</p>
            <div className="mt-1 flex flex-col gap-2 sm:flex-row">
              <input
                value={preview}
                onChange={(e) => setPreview(e.target.value)}
                placeholder="https://… image URL"
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-[13px] outline-none focus:border-[#2563EB] dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
              <input
                type="file"
                accept="image/*"
                aria-label="Upload image for preview"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setPreview(URL.createObjectURL(f));
                }}
                className="text-[12.5px] text-slate-500 file:mr-2 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-bold file:text-[#2563EB]"
              />
            </div>
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Room preview" className="mt-2 h-32 w-full rounded-xl object-cover" />
            )}
          </div>
          <div className="sm:col-span-2">
            <p className="text-[13px] font-semibold">Amenities</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {ROOM_AMENITIES.map((a) => (
                <label key={a.key} className={`cursor-pointer rounded-lg border px-2.5 py-1.5 text-[12px] font-bold transition ${form.amenities?.[a.key] ? "border-[#2563EB] bg-blue-50 text-[#2563EB] dark:bg-blue-500/10" : "border-slate-200 text-slate-500 dark:border-slate-600"}`}>
                  <input
                    type="checkbox"
                    checked={!!form.amenities?.[a.key]}
                    onChange={(e) => setForm((f) => ({ ...f, amenities: { ...f.amenities, [a.key]: e.target.checked } }))}
                    className="sr-only"
                  />
                  {a.label}
                </label>
              ))}
            </div>
          </div>
          <label className="flex cursor-pointer items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 text-[13px] font-semibold sm:col-span-2 dark:bg-slate-700/40">
            Available for booking
            <input
              type="checkbox"
              checked={!!form.available}
              onChange={(e) => setForm((f) => ({ ...f, available: e.target.checked }))}
              className="h-5 w-5 accent-[#2563EB]"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="mt-4 w-full rounded-xl bg-[#2563EB] py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {busy ? "Saving…" : initial?.id ? "Save changes" : "Add room"}
        </button>
      </form>
    </div>
  );
}

export default function AdminRooms() {
  const { data, loading, isFallback, refresh, setData } = useAdminFetch("/api/rooms", DUMMY_ROOMS);
  const [view, setView] = useState("grid");
  const [modal, setModal] = useState(null); // null | {…room} | "new"
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const rooms = (data || []).map((r) => ({
    id: String(r._id || r.id),
    name: r.name,
    type: r.type,
    price: r.price,
    capacity: r.capacity,
    image: r.image || r.images?.[0],
    available: r.available !== false && r.status !== "booked",
    rating: r.rating,
  }));

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await adminFetch(`/api/rooms/${deleting.id}`, { method: "DELETE" });
      setData((prev) => (prev || []).filter((r) => String(r._id || r.id) !== deleting.id));
      toast.success(`"${deleting.name}" deleted.`);
    } catch (err) {
      toast.error(`Could not delete (${err.message}).`);
    } finally {
      setBusy(false);
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[13px] text-slate-500 dark:text-slate-400">
          {rooms.length} room{rooms.length === 1 ? "" : "s"}
          {isFallback && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase text-amber-700">Sample data</span>}
        </p>
        <span className="flex-1" />
        <div className="flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
          {[
            { v: "grid", icon: LayoutGrid, label: "Grid view" },
            { v: "list", icon: List, label: "List view" },
          ].map(({ v, icon: Icon, label }) => (
            <button key={v} type="button" onClick={() => setView(v)} aria-label={label} className={`rounded-lg p-2 transition ${view === v ? "bg-[#2563EB] text-white" : "text-slate-500"}`}>
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setModal("new")}
          className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-[13px] font-bold text-white transition hover:bg-blue-700 active:scale-95"
        >
          <Plus className="h-4 w-4" /> Add Room
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : rooms.length === 0 ? (
        <EmptyState icon={BedDouble} title="No rooms yet" hint="Add your first room to start taking bookings." />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rooms.map((r) => (
            <div key={r.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800">
              <div className="relative h-40 bg-slate-100 dark:bg-slate-700">
                {r.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.image} alt={r.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <span className="absolute inset-0 grid place-items-center text-slate-300">
                    <BedDouble className="h-10 w-10" />
                  </span>
                )}
                <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-black ${r.available ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
                  {r.available ? "Available" : "Booked"}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="truncate text-[14.5px] font-extrabold text-slate-900 dark:text-white">{r.name}</h3>
                    <p className="text-[12px] text-slate-500">{r.type} • {r.capacity} guests</p>
                  </div>
                  <p className="text-[16px] font-black tabular-nums text-slate-900 dark:text-white">{formatBDT(r.price)}</p>
                </div>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => setModal(r)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-[12.5px] font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button type="button" onClick={() => setDeleting(r)} aria-label={`Delete ${r.name}`} className="grid w-10 place-items-center rounded-xl border border-red-200 text-red-600 transition hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          {rooms.map((r) => (
            <div key={r.id} className="flex items-center gap-3 border-b border-slate-100 p-3 last:border-0 dark:border-slate-700">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
                <BedDouble className="h-5 w-5 text-[#2563EB]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-bold text-slate-900 dark:text-white">{r.name}</p>
                <p className="text-[12px] text-slate-500">{r.type} • {formatBDT(r.price)}/night</p>
              </div>
              <button type="button" onClick={() => setModal(r)} aria-label={`Edit ${r.name}`} className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-600">
                <Pencil className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setDeleting(r)} aria-label={`Delete ${r.name}`} className="grid h-9 w-9 place-items-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/30">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <RoomModal
          initial={modal === "new" ? null : rooms.find((r) => r.id === modal.id)}
          onClose={() => setModal(null)}
          onSaved={refresh}
        />
      )}
      <ConfirmModal
        open={!!deleting}
        title={`Delete "${deleting?.name}"?`}
        message="The room will be removed permanently. Existing bookings are kept."
        confirmLabel="Delete"
        busy={busy}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
