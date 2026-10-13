"use client";

// ---------------------------------------------------------------------------
// HotelFlow admin Reviews (/admin/reviews) — approve or hide (reject)
// reviews, filter by star rating, search. Toast on every action.
// ---------------------------------------------------------------------------

import { useState, useMemo } from "react";
import { Star, Check, EyeOff } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import { toast } from "../../components/admin/Toast";
import { adminFetch, useAdminFetch, DUMMY_REVIEWS } from "../../components/admin/dummy";
import { formatDateBD } from "../../lib/format";

function Stars({ n }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i < n ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600"}`} />
      ))}
    </span>
  );
}

export default function AdminReviews() {
  const { data, loading, isFallback, setData } = useAdminFetch("/api/admin/reviews", DUMMY_REVIEWS);
  const [star, setStar] = useState("all");
  const [busy, setBusy] = useState(null);

  const reviews = useMemo(
    () =>
      (data || []).map((r) => ({
        id: String(r._id || r.id),
        guest: r.user?.name || r.guest || "Guest",
        room: r.room?.name || r.room || "Room",
        rating: Number(r.rating) || 0,
        comment: r.comment || "",
        status: r.status || "pending",
        createdAt: r.createdAt,
      })),
    [data]
  );
  const shown = star === "all" ? reviews : reviews.filter((r) => r.rating === Number(star));

  const setStatus = async (review, status) => {
    setBusy(review.id);
    try {
      await adminFetch(`/api/admin/reviews/${review.id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      setData((prev) => (prev || []).map((r) => (String(r._id || r.id) === review.id ? { ...r, status } : r)));
      toast.success(`Review ${status === "approved" ? "approved" : "hidden"}.`);
    } catch (err) {
      toast.error(`Could not update review (${err.message}).`);
    } finally {
      setBusy(null);
    }
  };

  const columns = [
    { key: "guest", label: "Guest", sortable: true, render: (r) => <span className="font-bold text-slate-900 dark:text-white">{r.guest}</span> },
    { key: "room", label: "Room", sortable: true },
    { key: "rating", label: "Stars", sortable: true, render: (r) => <Stars n={r.rating} /> },
    { key: "comment", label: "Comment", render: (r) => <span className="block max-w-[320px] truncate" title={r.comment}>{r.comment}</span> },
    { key: "status", label: "Status", render: (r) => (
      <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-black capitalize ${r.status === "approved" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400" : r.status === "rejected" ? "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-300" : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"}`}>
        {r.status === "rejected" ? "Hidden" : r.status}
      </span>
    ) },
    { key: "createdAt", label: "Date", sortable: true, render: (r) => formatDateBD(r.createdAt) || "—" },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <span className="flex gap-1.5">
          {r.status !== "approved" && (
            <button type="button" disabled={busy === r.id} onClick={() => setStatus(r, "approved")} className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11.5px] font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50">
              <Check className="h-3.5 w-3.5" /> Approve
            </button>
          )}
          {r.status !== "rejected" && (
            <button type="button" disabled={busy === r.id} onClick={() => setStatus(r, "rejected")} className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11.5px] font-bold text-slate-500 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300">
              <EyeOff className="h-3.5 w-3.5" /> Hide
            </button>
          )}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-1.5">
        {["all", "5", "4", "3", "2", "1"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStar(s)}
            className={`flex items-center gap-1 rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition ${
              star === s ? "bg-[#2563EB] text-white shadow" : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            {s === "all" ? "All stars" : <><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {s}</>}
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
        searchKeys={["guest", "room", "comment"]}
        searchPlaceholder="Search guest, room or comment…"
        exportName="hotelFlow-reviews"
        printTitle="HotelFlow Reviews Report"
        emptyTitle="No reviews found"
      />
    </div>
  );
}
