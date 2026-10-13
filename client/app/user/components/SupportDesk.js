"use client";

import { useEffect, useRef, useState } from "react";
import { LifeBuoy, Send, Plus } from "lucide-react";
import { EmptyState, ListSkeleton, StatusBadge, useToast } from "./ui";
import { listTickets, createTicket, listMessages, postMessage, updateTicketStatus } from "../../../lib/dashboardApi";

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/15";

export default function SupportDesk() {
  const toast = useToast();
  const [tickets, setTickets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ subject: "", category: "Booking", message: "" });
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  const loadTickets = async () => {
    try {
      const d = await listTickets({ limit: 30 });
      setTickets(d);
      return d;
    } catch (err) {
      toast(err?.message || "Tickets failed to load", "error");
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openTicket = async (id) => {
    setActiveId(id);
    setMsgLoading(true);
    try {
      const d = await listMessages(id, { limit: 100 });
      setMessages(d.data || []);
    } catch (err) {
      toast(err?.message || "Messages failed to load", "error");
    } finally {
      setMsgLoading(false);
    }
  };

  // Live polling while a ticket is open (5s)
  useEffect(() => {
    if (!activeId) return;
    pollRef.current = setInterval(async () => {
      try {
        const last = messages[messages.length - 1]?.createdAt;
        const d = await listMessages(activeId, { ...(last ? { after: last } : {}), limit: 100 });
        if ((d.data || []).length > 0) setMessages((m) => [...m, ...d.data]);
      } catch { /* polling must never toast-spam */ }
    }, 5000);
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const t = await createTicket(form);
      toast("Ticket opened — agents typically reply in minutes", "success");
      setForm({ subject: "", category: "Booking", message: "" });
      setShowNew(false);
      await loadTickets();
      openTicket(t._id || t.id);
    } catch (err) {
      toast(err?.message || "Ticket creation failed", "error");
    } finally {
      setBusy(false);
    }
  };

  const send = async (e) => {
    e.preventDefault();
    const text = reply.trim();
    if (!text || !activeId) return;
    setReply("");
    try {
      const m = await postMessage(activeId, text);
      setMessages((prev) => [...prev, m]);
      loadTickets();
    } catch (err) {
      setReply(text);
      toast(err?.message || "Send failed", "error");
    }
  };

  const close = async () => {
    try {
      await updateTicketStatus(activeId, "closed");
      toast("Ticket closed", "success");
      loadTickets();
    } catch (err) {
      toast(err?.message || "Close failed", "error");
    }
  };

  const active = (tickets?.data || []).find((t) => t._id === activeId);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          <LifeBuoy className="h-7 w-7 text-blue-600" /> Support & Live Chat
        </h2>
        <button onClick={() => setShowNew(!showNew)} className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700">
          <Plus className="h-4 w-4" /> New ticket
        </button>
      </div>

      {showNew && (
        <form onSubmit={submit} className="mb-5 space-y-3 rounded-xl bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject" required minLength={3} aria-label="Ticket subject" className={inputCls} />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} aria-label="Ticket category" className={inputCls}>
              {["Booking", "Payment", "Cancellation", "Modification", "Loyalty", "Other"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Describe the issue… (optional first message)" rows={3} className={`${inputCls} resize-none`} />
          <button disabled={busy} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
            {busy ? "Opening…" : "Open ticket"}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        {/* Ticket list */}
        <div className="xl:col-span-2">
          {loading ? (
            <ListSkeleton rows={4} />
          ) : (tickets?.data || []).length === 0 ? (
            <EmptyState icon={LifeBuoy} title="No tickets yet" hint="Open your first support ticket above" />
          ) : (
            <ul className="space-y-2" aria-label="Support tickets">
              {(tickets.data || []).map((t) => (
                <li key={t._id}>
                  <button
                    onClick={() => openTicket(t._id)}
                    aria-pressed={activeId === t._id}
                    className={`w-full rounded-xl bg-white p-4 text-left shadow-sm transition hover:shadow-md ${activeId === t._id ? "ring-2 ring-blue-500" : ""}`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-slate-900">{t.subject}</span>
                      <StatusBadge status={t.status} />
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">{t.category} · {new Date(t.updatedAt).toLocaleDateString()}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Live thread */}
        <div className="xl:col-span-3">
          {!activeId ? (
            <EmptyState icon={Send} title="Select a ticket" hint="Choose a conversation to start live chatting" />
          ) : (
            <div className="flex h-[55vh] min-h-[380px] flex-col overflow-hidden rounded-xl bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 p-4">
                <p className="truncate text-sm font-bold text-slate-900">{active?.subject}</p>
                {active && !["resolved", "closed"].includes(active.status) && (
                  <button onClick={close} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                    Close ticket
                  </button>
                )}
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4" aria-live="polite">
                {msgLoading ? (
                  <ListSkeleton rows={3} />
                ) : messages.length === 0 ? (
                  <p className="text-center text-sm text-slate-400">No messages yet — say hello.</p>
                ) : messages.map((m) => (
                  <div key={m._id} className={`flex ${m.senderRole === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${m.senderRole === "user" ? "rounded-br-md bg-slate-900 text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-800 shadow-sm"}`}>
                      <p className="mb-0.5 text-[11px] font-semibold opacity-60">
                        {m.senderRole === "user" ? "You" : m.senderRole === "agent" ? "Support agent" : m.senderRole}
                      </p>
                      <p className="leading-relaxed">{m.text}</p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={send} className="flex gap-2 border-t border-slate-100 p-3">
                <label htmlFor="support-reply" className="sr-only">Reply</label>
                <input id="support-reply" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type a reply…" maxLength={2000} className={inputCls} />
                <button aria-label="Send reply" className="flex h-[42px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700">
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
