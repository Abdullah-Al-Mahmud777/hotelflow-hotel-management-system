"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Trash2, GitCompare, X, BedDouble } from "lucide-react";
import { EmptyState, ListSkeleton, formatPrice, useToast } from "./ui";
import { removeFavorite } from "../../../lib/dashboardApi";

const MAX_COMPARE = 3;

export default function Wishlist({ favorites, loading, onChanged }) {
  const router = useRouter();
  const toast = useToast();
  const [compareIds, setCompareIds] = useState([]);
  const [busyId, setBusyId] = useState(null);

  const items = useMemo(() => favorites?.data || [], [favorites]);

  const toggleCompare = (id) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) {
        toast(`Compare up to ${MAX_COMPARE} hotels`, "error");
        return prev;
      }
      return [...prev, id];
    });
  };

  const remove = async (roomId) => {
    setBusyId(roomId);
    try {
      await removeFavorite(roomId);
      toast("Removed from wishlist", "success");
      setCompareIds((prev) => prev.filter((x) => x !== roomId));
      onChanged?.();
    } catch (err) {
      toast(err?.message || "Remove failed", "error");
    } finally {
      setBusyId(null);
    }
  };

  const compareRooms = items
    .filter((f) => compareIds.includes(String(f.room?._id || f.room)))
    .map((f) => f.room)
    .filter(Boolean);

  const rows = [
    { label: "Type", get: (r) => r.type },
    { label: "Price / night", get: (r) => formatPrice(r.price) },
    { label: "Capacity", get: (r) => `${r.capacity} guests` },
    { label: "Amenities", get: (r) => (r.amenities || []).join(", ") || "—" },
    { label: "Available", get: (r) => (r.availability ? "Yes" : "No") },
  ];

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Wishlist & Compare</h2>

      {loading ? (
        <ListSkeleton rows={3} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favorites yet"
          hint="Tap the heart on any room to save it here"
          action={
            <button onClick={() => router.push("/rooms")} className="mt-4 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700">
              Browse Rooms
            </button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((f) => {
              const room = f.room || {};
              const rid = String(room._id || f.room);
              const selected = compareIds.includes(rid);
              return (
                <article key={f._id} className={`rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md ${selected ? "ring-2 ring-blue-500" : ""}`}>
                  {room.image && (
                    <div className="mb-3 h-36 overflow-hidden rounded-xl bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={room.image} alt={room.name} loading="lazy" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <h3 className="truncate text-base font-semibold text-slate-900">{room.name || "Room"}</h3>
                  <p className="text-sm text-slate-500">{room.type} · {formatPrice(room.price)}/night</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => toggleCompare(rid)}
                      aria-pressed={selected}
                      className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium transition ${selected ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-700 hover:bg-slate-50"}`}
                    >
                      <GitCompare className="h-3.5 w-3.5" /> {selected ? "Selected" : "Compare"}
                    </button>
                    <button
                      onClick={() => router.push(`/rooms/${rid}`)}
                      className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      View
                    </button>
                    <button
                      onClick={() => remove(rid)}
                      disabled={busyId === rid}
                      aria-label={`Remove ${room.name || "room"} from wishlist`}
                      className="ml-auto rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Comparison table */}
          <section aria-label="Hotel comparison" className="mt-6 rounded-xl bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <GitCompare className="h-5 w-5 text-slate-400" /> Compare ({compareRooms.length}/{MAX_COMPARE})
            </h3>
            {compareRooms.length < 2 ? (
              <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                <BedDouble className="h-4 w-4" /> Select at least 2 favorites to compare side by side.
              </p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-3 pr-4 text-xs uppercase tracking-wider text-slate-400">Feature</th>
                      {compareRooms.map((r) => (
                        <th key={r._id} className="pb-3 pr-4 font-semibold text-slate-900">
                          {r.name}
                          <button onClick={() => toggleCompare(String(r._id))} aria-label={`Remove ${r.name} from comparison`} className="ml-2 text-slate-400 hover:text-red-600">
                            <X className="inline h-3.5 w-3.5" />
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((row) => (
                      <tr key={row.label} className="hover:bg-slate-50">
                        <td className="py-3 pr-4 font-medium text-slate-500">{row.label}</td>
                        {compareRooms.map((r) => (
                          <td key={r._id} className="py-3 pr-4 text-slate-900">{row.get(r)}</td>
                        ))}
                      </tr>
                    ))}
                    <tr>
                      <td className="py-3 pr-4 font-medium text-slate-500">Book</td>
                      {compareRooms.map((r) => (
                        <td key={r._id} className="py-3 pr-4">
                          <button onClick={() => router.push(`/rooms/${r._id}`)} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700">
                            Book {formatPrice(r.price)}
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
