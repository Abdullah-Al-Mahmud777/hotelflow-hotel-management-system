"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Clock, Pencil, Trash2, BadgeCheck } from "lucide-react";
import {
  EmptyState,
  ListSkeleton,
  ConfirmDialog,
  RatingStars,
  StatusBadge,
  formatDateTime,
  useToast,
} from "./ui";
import { createReview, updateReview, deleteReview } from "../../../lib/dashboardApi";

export default function UserReviews({ reviews = [], bookings = [], loading, onChanged }) {
  const router = useRouter();
  const toast = useToast();
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ rating: 0, comment: "" });
  const [busy, setBusy] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [creatingFor, setCreatingFor] = useState(null);
  const [createForm, setCreateForm] = useState({ rating: 0, comment: "" });

  const reviewedBookingIds = useMemo(() => new Set(reviews.map((r) => String(r.booking))), [reviews]);

  // Completed-stay verification: only approved bookings without a review are eligible
  const eligible = useMemo(
    () => (bookings || []).filter((b) => b.status === "approved" && !reviewedBookingIds.has(String(b._id || b.id))),
    [bookings, reviewedBookingIds]
  );

  const startEdit = (r) => {
    setEditingId(r._id);
    setForm({ rating: r.rating || 0, comment: r.comment || "" });
  };

  const saveEdit = async (id) => {
    if (!form.rating || form.comment.trim().length < 3) {
      toast("Rating (1–5) and a comment of 3+ characters are required", "error");
      return;
    }
    setBusy(true);
    try {
      await updateReview(id, { rating: form.rating, comment: form.comment.trim() });
      toast("Review updated — resubmitted for approval", "success");
      setEditingId(null);
      onChanged?.();
    } catch (err) {
      toast(err?.message || "Update failed", "error");
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async () => {
    if (!deleteId) return;
    setBusy(true);
    try {
      await deleteReview(deleteId);
      toast("Review deleted", "success");
      setDeleteId(null);
      onChanged?.();
    } catch (err) {
      toast(err?.message || "Delete failed", "error");
    } finally {
      setBusy(false);
    }
  };

  const doCreate = async (bookingId) => {
    if (!createForm.rating || createForm.comment.trim().length < 3) {
      toast("Rating (1–5) and a comment of 3+ characters are required", "error");
      return;
    }
    setBusy(true);
    try {
      await createReview({ bookingId, rating: createForm.rating, comment: createForm.comment.trim() });
      toast("Review submitted for approval", "success");
      setCreatingFor(null);
      setCreateForm({ rating: 0, comment: "" });
      onChanged?.();
    } catch (err) {
      toast(err?.message || "Submit failed", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">My Reviews</h2>

      {/* Eligible stays */}
      {!loading && eligible.length > 0 && (
        <section aria-label="Stays awaiting your review" className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold text-blue-900">
            <BadgeCheck className="h-4 w-4" /> {eligible.length} completed {eligible.length === 1 ? "stay" : "stays"} awaiting your review
          </h3>
          <div className="mt-3 space-y-2">
            {eligible.map((b) => {
              const id = b._id || b.id;
              return (
                <div key={id} className="rounded-xl bg-white p-3.5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">{b.room?.name || "Room"}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setCreatingFor(creatingFor === id ? null : id); setCreateForm({ rating: 0, comment: "" }); }}
                        className="rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-slate-700"
                      >
                        {creatingFor === id ? "Close" : "Review now"}
                      </button>
                      <button
                        onClick={() => router.push(`/user/review/${id}`)}
                        className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                      >
                        Full page
                      </button>
                    </div>
                  </div>
                  {creatingFor === id && (
                    <div className="mt-3 space-y-3 border-t border-slate-100 pt-3">
                      <RatingStars value={createForm.rating} onChange={(v) => setCreateForm((f) => ({ ...f, rating: v }))} />
                      <textarea
                        value={createForm.comment}
                        onChange={(e) => setCreateForm((f) => ({ ...f, comment: e.target.value }))}
                        rows={3}
                        placeholder="Share your experience…"
                        aria-label="Review comment"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
                      />
                      <button disabled={busy} onClick={() => doCreate(id)} className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50">
                        {busy ? "Submitting…" : "Submit review"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {loading ? (
        <ListSkeleton rows={3} />
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No reviews yet"
          hint="Write a review after an approved stay completes"
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <article key={review._id} className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row">
                {review.room?.image && (
                  <div className="h-24 overflow-hidden rounded-xl bg-slate-100 sm:w-32">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={review.room.image} alt={review.room?.name || "Room"} loading="lazy" className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-900">{review.room?.name || "Room"}</h3>
                    <StatusBadge status={review.status} />
                  </div>

                  {editingId === review._id ? (
                    <div className="space-y-3">
                      <RatingStars value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
                      <textarea
                        value={form.comment}
                        onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                        rows={3}
                        aria-label="Edit review comment"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
                      />
                      <div className="flex gap-2">
                        <button disabled={busy} onClick={() => saveEdit(review._id)} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50">
                          {busy ? "Saving…" : "Save"}
                        </button>
                        <button onClick={() => setEditingId(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                          Cancel
                        </button>
                      </div>
                      <p className="text-xs text-slate-400">Edited reviews return to pending for re-approval.</p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-2"><RatingStars value={review.rating} /></div>
                      <p className="mb-2 text-sm leading-relaxed text-slate-700">{review.comment}</p>
                      <p className="mb-3 text-xs text-slate-500">{formatDateTime(review.createdAt)}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <button onClick={() => startEdit(review)} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50">
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button onClick={() => setDeleteId(review._id)} className="inline-flex items-center gap-1 rounded-xl border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50">
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                        {review.status === "pending" && (
                          <span className="inline-flex items-center gap-1 text-xs text-yellow-700"><Clock className="h-3.5 w-3.5" /> Waiting for admin approval</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete this review?"
          body="This permanently removes your review."
          confirmLabel="Yes, delete"
          busy={busy}
          onCancel={() => setDeleteId(null)}
          onConfirm={doDelete}
        />
      )}
    </div>
  );
}
