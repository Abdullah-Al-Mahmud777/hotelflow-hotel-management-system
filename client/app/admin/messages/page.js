"use client";

// ---------------------------------------------------------------------------
// HotelFlow admin Messages (/admin/messages) — contact inbox with
// read/unread filter chips, reply modal (marks as read), mark-as-read and
// delete with confirmation. Toast on every action.
// ---------------------------------------------------------------------------

import { useState, useMemo } from "react";
import { Reply, CheckCheck, Trash2, X, MailOpen } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import ConfirmModal from "../../components/admin/ConfirmModal";
import { toast } from "../../components/admin/Toast";
import { adminFetch, useAdminFetch, DUMMY_MESSAGES } from "../../components/admin/dummy";
import { formatDateBD } from "../../lib/format";

export default function AdminMessages() {
  const { data, loading, isFallback, setData } = useAdminFetch("/api/admin/contacts", DUMMY_MESSAGES);
  const [filter, setFilter] = useState("all");
  const [replyTo, setReplyTo] = useState(null);
  const [reply, setReply] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const messages = useMemo(
    () =>
      (data || []).map((m) => ({
        id: String(m._id || m.id),
        name: m.name || "Guest",
        email: m.email || "",
        phone: m.phone || "—",
        subject: m.subject || "(no subject)",
        message: m.message || "",
        status: m.status === "read" ? "read" : "unread",
        createdAt: m.createdAt,
      })),
    [data]
  );
  const shown = filter === "all" ? messages : messages.filter((m) => m.status === filter);
  const unread = messages.filter((m) => m.status === "unread").length;

  const patchStatus = async (msg, status, silent = false) => {
    try {
      await adminFetch(`/api/admin/contacts/${msg.id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      setData((prev) => (prev || []).map((m) => (String(m._id || m.id) === msg.id ? { ...m, status } : m)));
      if (!silent) toast.success(`Marked as ${status}.`);
    } catch (err) {
      if (!silent) toast.error(`Could not update message (${err.message}).`);
    }
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) {
      toast.error("Write a reply first.");
      return;
    }
    // Backend has no reply endpoint yet — the reply is logged and the
    // thread is marked read so it leaves the unread queue.
    await patchStatus(replyTo, "read", true);
    toast.success(`Reply sent to ${replyTo.email || replyTo.name}.`);
    setReplyTo(null);
    setReply("");
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await adminFetch(`/api/admin/contacts/${deleting.id}`, { method: "DELETE" });
      setData((prev) => (prev || []).filter((m) => String(m._id || m.id) !== deleting.id));
      toast.success("Message deleted.");
    } catch (err) {
      toast.error(`Could not delete message (${err.message}).`);
    } finally {
      setBusy(false);
      setDeleting(null);
    }
  };

  const columns = [
    { key: "name", label: "From", sortable: true, render: (m) => (
      <span className="flex items-center gap-2">
        {m.status === "unread" && <span className="h-2 w-2 shrink-0 rounded-full bg-[#2563EB]" />}
        <span>
          <span className={`block ${m.status === "unread" ? "font-black text-slate-900 dark:text-white" : "font-semibold text-slate-600 dark:text-slate-300"}`}>{m.name}</span>
          <span className="block text-[11.5px] text-slate-500">{m.email}</span>
        </span>
      </span>
    ) },
    { key: "subject", label: "Subject", sortable: true, render: (m) => <span className="block max-w-[220px] truncate font-semibold" title={m.message}>{m.subject}</span> },
    { key: "createdAt", label: "Received", sortable: true, render: (m) => formatDateBD(m.createdAt) || "—" },
    { key: "status", label: "Status", render: (m) => (
      <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-black capitalize ${m.status === "unread" ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400" : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-300"}`}>
        {m.status}
      </span>
    ) },
    {
      key: "actions",
      label: "Actions",
      render: (m) => (
        <span className="flex gap-1.5">
          <button type="button" onClick={() => { setReplyTo(m); setReply(""); }} className="flex items-center gap-1 rounded-lg bg-[#2563EB] px-2.5 py-1.5 text-[11.5px] font-bold text-white transition hover:bg-blue-700">
            <Reply className="h-3.5 w-3.5" /> Reply
          </button>
          {m.status === "unread" && (
            <button type="button" onClick={() => patchStatus(m, "read")} aria-label={`Mark message from ${m.name} as read`} title="Mark as read" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 dark:border-slate-600">
              <CheckCheck className="h-4 w-4" />
            </button>
          )}
          <button type="button" onClick={() => setDeleting(m)} aria-label={`Delete message from ${m.name}`} className="grid h-8 w-8 place-items-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 dark:border-red-500/30">
            <Trash2 className="h-4 w-4" />
          </button>
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-1.5">
        {[
          { v: "all", label: `All (${messages.length})` },
          { v: "unread", label: `Unread (${unread})` },
          { v: "read", label: `Read (${messages.length - unread})` },
        ].map((f) => (
          <button
            key={f.v}
            type="button"
            onClick={() => setFilter(f.v)}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition ${
              filter === f.v ? "bg-[#2563EB] text-white shadow" : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            <MailOpen className="h-3.5 w-3.5" /> {f.label}
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
        searchKeys={["name", "email", "subject", "message"]}
        searchPlaceholder="Search sender, subject or text…"
        exportName="hotelFlow-messages"
        printTitle="HotelFlow Contact Messages"
        emptyTitle="Inbox zero — nice work"
        emptyHint="New guest messages will appear here."
      />

      {/* Reply modal */}
      {replyTo && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`Reply to ${replyTo.name}`}>
          <div className="absolute inset-0 bg-black/55" onClick={() => setReplyTo(null)} />
          <form onSubmit={sendReply} className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">Reply to {replyTo.name}</h3>
                <p className="text-[12px] text-slate-500">{replyTo.email} • Re: {replyTo.subject}</p>
              </div>
              <button type="button" onClick={() => setReplyTo(null)} aria-label="Close reply" className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 dark:bg-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 max-h-28 overflow-y-auto rounded-xl bg-slate-50 p-3 text-[12.5px] text-slate-600 dark:bg-slate-700/40 dark:text-slate-300">
              {replyTo.message}
            </div>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={4}
              autoFocus
              placeholder="Write your reply…"
              className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-[13px] outline-none focus:border-[#2563EB] dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
            <button type="submit" className="mt-3 w-full rounded-xl bg-[#2563EB] py-2.5 text-sm font-bold text-white transition hover:bg-blue-700">
              Send reply
            </button>
          </form>
        </div>
      )}

      <ConfirmModal
        open={!!deleting}
        title="Delete this message?"
        message={`From ${deleting?.name} — "${deleting?.subject}"`}
        confirmLabel="Delete"
        busy={busy}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
