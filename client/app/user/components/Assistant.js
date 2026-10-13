"use client";

import { useRef, useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import { useToast } from "./ui";
import { aiChat } from "../../../lib/dashboardApi";

export default function Assistant() {
  const toast = useToast();
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I'm your HotelFlow travel assistant. Ask about rooms, prices, policies, or your bookings." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [provider, setProvider] = useState(null);
  const bottomRef = useRef(null);

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    const history = messages.map((m) => ({ role: m.role, text: m.text }));
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setBusy(true);
    try {
      const r = await aiChat(text, history);
      setMessages((m) => [...m, { role: "assistant", text: r.reply }]);
      setProvider(r.provider || null);
    } catch (err) {
      toast(err?.message || "Assistant failed", "error");
      setMessages((m) => [...m, { role: "assistant", text: "Sorry — I couldn't answer that. Please try again or open a support ticket." }]);
    } finally {
      setBusy(false);
      requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }));
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          <Bot className="h-7 w-7 text-blue-600" /> AI Travel Assistant
        </h2>
        {provider && (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
            <Sparkles className="h-3.5 w-3.5" /> {provider === "fallback" ? "built-in guide" : provider}
          </span>
        )}
      </div>

      <div className="flex h-[60vh] min-h-[420px] flex-col overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-5" aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <p className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.role === "user" ? "rounded-br-md bg-slate-900 text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-800 shadow-sm"}`}>
                {m.text}
              </p>
            </div>
          ))}
          {busy && <p className="text-sm text-slate-400">Thinking…</p>}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={send} className="flex gap-2 border-t border-slate-200 p-4">
          <label htmlFor="ai-input" className="sr-only">Ask the travel assistant</label>
          <input
            id="ai-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Family suite under ৳15000 next weekend?"
            maxLength={2000}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
          />
          <button type="submit" disabled={busy || !input.trim()} aria-label="Send message" className="flex h-[42px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:opacity-50">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
