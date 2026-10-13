"use client";

// ---------------------------------------------------------------------------
// HotelFlow book-now gating — shared by room cards and the room detail page.
// - useBookNow(): call bookNow(roomId, { checkIn, checkOut, guests }).
//   Logged in → pushes /booking?roomId=…&dates&guests. Logged out → opens
//   the AuthPrompt modal instead (dates/guests are preserved in redirect).
// - AuthPromptModal: "Please log in or create an account to book a room"
//   with Log in / Create account buttons carrying the redirect param.
// ---------------------------------------------------------------------------

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus, X } from "lucide-react";
import { isLoggedIn } from "../../lib/auth";

export function useBookNow() {
  const router = useRouter();
  // Holds the post-login destination while the prompt modal is open.
  const [prompt, setPrompt] = useState(null);

  const bookNow = useCallback(
    (roomId, { checkIn = "", checkOut = "", guests = "", rooms = "" } = {}) => {
      const qs = new URLSearchParams({ roomId: String(roomId) });
      if (checkIn) qs.set("checkIn", checkIn);
      if (checkOut) qs.set("checkOut", checkOut);
      if (guests) qs.set("guests", String(guests));
      if (rooms) qs.set("rooms", String(rooms));
      const target = `/booking?${qs.toString()}`;
      if (isLoggedIn()) router.push(target);
      else setPrompt(target);
    },
    [router]
  );

  const closePrompt = useCallback(() => setPrompt(null), []);
  return { prompt, closePrompt, bookNow };
}

export function AuthPromptModal({ redirect, onClose }) {
  if (!redirect) return null;
  const q = `redirect=${encodeURIComponent(redirect)}`;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Login required">
      <div className="absolute inset-0 bg-black/55" onClick={onClose} />
      <div className="relative w-full max-w-sm animate-fade-in rounded-2xl bg-white p-6 text-center shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-slate-100 hover:bg-slate-200"
        >
          <X className="h-4 w-4" />
        </button>
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#5B5BE6]/10">
          <LogIn className="h-6 w-6 text-[#5B5BE6]" />
        </span>
        <h3 className="mt-3 text-[16px] font-extrabold text-[#1B1D2A]">Login required</h3>
        <p className="mt-1 text-[13px] text-slate-500">
          Please log in or create an account to book a room. Your dates and guests are saved.
        </p>
        <div className="mt-4 space-y-2">
          <Link
            href={`/login?${q}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5B5BE6] py-2.5 text-sm font-bold text-white transition hover:brightness-110"
          >
            <LogIn className="h-4 w-4" /> Log in
          </Link>
          <Link
            href={`/register?${q}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#5B5BE6] py-2.5 text-sm font-bold text-[#5B5BE6] transition hover:bg-[#5B5BE6]/5"
          >
            <UserPlus className="h-4 w-4" /> Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
