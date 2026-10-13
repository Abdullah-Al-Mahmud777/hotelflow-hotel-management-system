"use client";

// ---------------------------------------------------------------------------
// HotelFlow booking checkout (/booking?roomId=&checkIn=&checkOut=&guests=).
// RequireAuth guarantees a login before this renders. Room loads from the
// API (dummy fallback); invalid ids get a friendly not-found state.
// Availability is enforced by the SERVER (overlap check on POST) — a 400
// becomes "This room is not available for the selected dates." A 401 clears
// the dead session and bounces to login with the page preserved.
// ---------------------------------------------------------------------------

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Users,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  SearchX,
} from "lucide-react";
import Navbar from "../components/hotelflow/Navbar";
import Footer from "../components/hotelflow/Footer";
import RequireAuth from "../components/hotelflow/RequireAuth";
import SafeImage from "../components/hotelflow/SafeImage";
import { ROOM_IMAGES } from "../components/hotelflow/images";
import { normalizeRoom, DUMMY_ROOMS } from "../components/hotelflow/roomsData";
import { Toaster, toast } from "../components/admin/Toast";
import { formatBDT } from "../lib/format";
import { getUser, handleExpiredSession } from "../lib/auth";
import { getApiUrl } from "../../lib/apiUrl";
import { BRAND, PAGE_BG } from "../components/hotelflow/data";

const PAYMENT_METHODS = ["bKash", "Nagad", "Rocket", "Card", "Pay at hotel"];
const ARRIVAL_SLOTS = ["Before 12 PM", "12 PM – 3 PM", "3 PM – 6 PM", "After 6 PM", "Not sure yet"];
const BD_PHONE = /^\+8801[3-9]\d{8}$/;
const SERVICE_RATE = 0.05; // 5% service charge (shown separately from 15% VAT)
const VAT_RATE = 0.15;

const inputCls =
  "mt-1 w-full rounded-xl border border-[#D9DDE8] px-3 py-2.5 text-[13px] font-medium outline-none transition focus:border-[#5B5BE6] focus:ring-2 focus:ring-[#5B5BE6]/15";

function BookingInner() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [room, setRoom] = useState(null);
  const [roomLoading, setRoomLoading] = useState(true);
  const [roomMissing, setRoomMissing] = useState(false);

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [form, setForm] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    guests: 2,
    specialRequests: "",
    arrivalTime: "Not sure yet",
    paymentMethod: "Cash at hotel",
    couponCode: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [done, setDone] = useState(null); // confirmed booking from server
  const [roomsQty, setRoomsQty] = useState(1);

  // Read query + prefill from the logged-in user (client-only: no Suspense).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const id = q.get("roomId") || "";
    setRoomId(id);
    if (q.get("checkIn")) setCheckIn(q.get("checkIn"));
    if (q.get("checkOut")) setCheckOut(q.get("checkOut"));
    const g = Number(q.get("guests"));
    const rq = Math.max(1, Number(q.get("rooms")) || 1);
    setRoomsQty(rq);
    const user = getUser();
    setForm((f) => ({
      ...f,
      guestName: user?.name || "",
      guestEmail: user?.email || "",
      guestPhone: user?.phone || "",
      guests: g > 0 ? g : f.guests,
    }));
    if (!id) {
      setRoomLoading(false);
      setRoomMissing(true);
      return;
    }
    (async () => {
      try {
        const res = await fetch(getApiUrl(`/api/rooms/${id}`), { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            const loaded = normalizeRoom(json.data);
            setRoom(loaded);
            // Clamp the requested room count to this room's inventory.
            setRoomsQty((q) => Math.min(q, loaded.totalRooms || 1));
            return;
          }
        }
        throw new Error("not found");
      } catch {
        const d = DUMMY_ROOMS.find((r) => r.id === id);
        // normalizeRoom fills totalRooms/remaining defaults for dummy rows.
        const fallback = d ? normalizeRoom({ ...d, _id: d.id }) : null;
        if (fallback) setRoomsQty((q) => Math.min(q, fallback.totalRooms || 1));
        setRoom(fallback);
        setRoomMissing(!fallback);
      } finally {
        setRoomLoading(false);
      }
    })();
  }, []);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const n = Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000);
    return n > 0 ? n : 0;
  }, [checkIn, checkOut]);

  const subtotal = (room?.price || 0) * nights * roomsQty;
  const vat = subtotal * VAT_RATE;
  const service = subtotal * SERVICE_RATE;
  const estimated = subtotal + vat + service;
  const today = new Date().toISOString().split("T")[0];
  const maxQty = Math.min(room?.totalRooms || 1, 10);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.guestName.trim()) e.guestName = "Full name is required.";
    if (!form.guestEmail.trim()) e.guestEmail = "Email is required.";
    if (!form.guestPhone.trim()) e.guestPhone = "Phone is required.";
    else if (!BD_PHONE.test(form.guestPhone.trim()))
      e.guestPhone = "Use a valid Bangladeshi mobile, e.g. +8801712345678.";
    if (!checkIn) e.checkIn = "Choose a check-in date.";
    else if (checkIn < today) e.checkIn = "Check-in cannot be in the past.";
    if (!checkOut) e.checkOut = "Choose a check-out date.";
    else if (checkIn && checkOut <= checkIn) e.checkOut = "Check-out must be after check-in.";
    const g = Number(form.guests);
    if (!g || g < 1) e.guests = "At least 1 guest.";
    else if (room && g > room.capacity * roomsQty)
      e.guests = `These rooms sleep ${room.capacity * roomsQty} in total.`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (submitting || !validate()) return;
    setSubmitting(true);
    try {
      // Client-side availability pre-check (the server re-checks atomically).
      try {
        setChecking(true);
        const roomId = room._raw?._id || room.id;
        const avail = await fetch(
          getApiUrl(`/api/rooms/${roomId}/availability?checkIn=${checkIn}&checkOut=${checkOut}&rooms=${roomsQty}`),
          { cache: "no-store" }
        );
        const availJson = await avail.json().catch(() => null);
        if (avail.ok && availJson?.data && !availJson.data.available) {
          setErrors({
            form:
              availJson.data.remainingRooms > 0
                ? `Only ${availJson.data.remainingRooms} room(s) left for these dates.`
                : "This room is not available for the selected dates.",
          });
          return;
        }
      } finally {
        setChecking(false);
      }
      const token = localStorage.getItem("token");
      const res = await fetch(getApiUrl("/api/bookings"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          room: room._raw?._id || room.id,
          checkIn,
          checkOut,
          guestName: form.guestName.trim(),
          guestEmail: form.guestEmail.trim(),
          guestPhone: form.guestPhone.trim(),
          numberOfGuests: Number(form.guests),
          rooms: roomsQty,
          specialRequests: form.specialRequests.trim(),
          paymentMethod: form.paymentMethod,
          arrivalTime: form.arrivalTime,
          ...(form.couponCode.trim() ? { couponCode: form.couponCode.trim().toUpperCase() } : {}),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) {
        handleExpiredSession();
        return;
      }
      if (!res.ok) {
        const msg = json.message || "Booking failed. Please try again.";
        // The server's overlap error becomes the friendly availability note.
        setErrors({
          form: /not available|overlap/i.test(msg)
            ? "This room is not available for the selected dates."
            : msg,
        });
        return;
      }
      setDone(json.data);
      toast.success(`Booking ${json.data.bookingRef || ""} confirmed!`);
    } catch {
      setErrors({ form: "Unable to connect to the server. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  // ---- success screen ----
  if (done) {
    return (
      <div className="min-h-screen font-sans" style={{ backgroundColor: PAGE_BG }}>
        <Navbar />
        <div className="mx-auto max-w-[720px] px-4 py-12 text-center sm:px-6">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </span>
          <h1 className="mt-4 text-2xl font-black text-[#1B1D2A]">Booking confirmed!</h1>
          <p className="mt-1 text-[14px] text-slate-500">
            Reference <span className="font-black tabular-nums text-[#1B1D2A]">{done.bookingRef || done._id}</span>
          </p>
          <div className="mt-6 rounded-2xl border border-[#E3E6EF] bg-white p-6 text-left shadow-sm">
            {[
              ["Room", done.room?.name || room?.name],
              ["Check-in", `${checkIn} (2:00 PM)`],
              ["Check-out", `${checkOut} (12:00 PM)`],
              ["Guests", done.numberOfGuests],
              ["Rooms", done.rooms || 1],
              ["Payment", done.paymentMethod],
              ["Total charged", formatBDT(done.totalPrice)],
              ["Status", done.status],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 border-b border-slate-100 py-2.5 text-[13.5px] last:border-0">
                <span className="text-slate-500">{k}</span>
                <span className="text-right font-bold capitalize">{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => router.push("/user/dashboard")}
              className="flex-1 rounded-xl bg-[#5B5BE6] py-3 text-sm font-bold text-white transition hover:brightness-110"
              style={{ backgroundColor: BRAND }}
            >
              View My Bookings
            </button>
            <Link
              href="/rooms"
              className="flex-1 rounded-xl border-2 border-[#5B5BE6] py-3 text-center text-sm font-bold text-[#5B5BE6]"
            >
              Back to Rooms
            </Link>
          </div>
        </div>
        <Footer />
        <Toaster />
      </div>
    );
  }

  // ---- room not found ----
  if (!roomLoading && (roomMissing || !room)) {
    return (
      <div className="min-h-screen font-sans" style={{ backgroundColor: PAGE_BG }}>
        <Navbar />
        <div className="mx-auto max-w-[720px] px-4 py-16 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white shadow">
            <SearchX className="h-7 w-7 text-[#9AA0B4]" />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold">Room not found</h1>
          <p className="mt-2 text-[14px] text-slate-500">This room does not exist or is no longer listed.</p>
          <Link href="/rooms" className="mt-6 inline-block rounded-xl bg-[#5B5BE6] px-6 py-3 text-sm font-bold text-white" style={{ backgroundColor: BRAND }}>
            Back to Rooms
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-slate-900" style={{ backgroundColor: PAGE_BG }}>
      <Navbar />
      <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6">
        <Link href="/rooms" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#5B5BE6] hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Rooms
        </Link>
        <h1 className="mt-2 text-xl font-extrabold tracking-tight sm:text-2xl">Complete your booking</h1>

        {roomLoading ? (
          <div className="mt-4 grid animate-pulse grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="h-96 rounded-2xl bg-[#E8EAF2]" />
            <div className="h-96 rounded-2xl bg-[#E8EAF2]" />
          </div>
        ) : (
          <form onSubmit={submit} className="mt-4 grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
            {/* Left: guest form */}
            <div className="min-w-0 space-y-4">
              <section className="rounded-2xl border border-[#E3E6EF] bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-[16px] font-extrabold">Guest details</h2>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label>
                    <span className="text-[13px] font-bold">Full name</span>
                    <input value={form.guestName} onChange={set("guestName")} className={inputCls} placeholder="Rahim Uddin" />
                    {errors.guestName && <p className="mt-1 text-[12px] font-bold text-red-600">{errors.guestName}</p>}
                  </label>
                  <label>
                    <span className="text-[13px] font-bold">Email</span>
                    <input type="email" value={form.guestEmail} onChange={set("guestEmail")} className={inputCls} placeholder="you@example.com" />
                    {errors.guestEmail && <p className="mt-1 text-[12px] font-bold text-red-600">{errors.guestEmail}</p>}
                  </label>
                  <label>
                    <span className="text-[13px] font-bold">Phone (+880)</span>
                    <input type="tel" value={form.guestPhone} onChange={set("guestPhone")} className={inputCls} placeholder="+8801712345678" />
                    {errors.guestPhone && <p className="mt-1 text-[12px] font-bold text-red-600">{errors.guestPhone}</p>}
                  </label>
                  <label>
                    <span className="text-[13px] font-bold">Guests (max {room.capacity * roomsQty} total)</span>
                    <input type="number" min={1} max={room.capacity * roomsQty} value={form.guests} onChange={set("guests")} className={inputCls} />
                    {errors.guests && <p className="mt-1 text-[12px] font-bold text-red-600">{errors.guests}</p>}
                  </label>
                  <label>
                    <span className="text-[13px] font-bold">Rooms (max {maxQty})</span>
                    <input
                      type="number"
                      min={1}
                      max={maxQty}
                      value={roomsQty}
                      onChange={(e) => setRoomsQty(Math.min(maxQty, Math.max(1, Number(e.target.value) || 1)))}
                      className={inputCls}
                    />
                  </label>
                  <label className="sm:col-span-2">
                    <span className="text-[13px] font-bold">Special requests (optional)</span>
                    <textarea value={form.specialRequests} onChange={set("specialRequests")} rows={2} className={inputCls} placeholder="High floor, early check-in…" />
                  </label>
                  <label>
                    <span className="text-[13px] font-bold">Estimated arrival</span>
                    <select value={form.arrivalTime} onChange={set("arrivalTime")} className={`${inputCls} cursor-pointer`}>
                      {ARRIVAL_SLOTS.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="text-[13px] font-bold">Coupon (optional)</span>
                    <input value={form.couponCode} onChange={(e) => setForm((f) => ({ ...f, couponCode: e.target.value.toUpperCase() }))} className={`${inputCls} uppercase`} placeholder="WELCOME10" />
                  </label>
                </div>
              </section>

              <section className="rounded-2xl border border-[#E3E6EF] bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-[16px] font-extrabold">Stay dates</h2>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label>
                    <span className="flex items-center gap-1.5 text-[13px] font-bold">
                      <CalendarDays className="h-4 w-4 text-[#9AA0B4]" /> Check-in (2:00 PM)
                    </span>
                    <input type="date" value={checkIn} min={today} onChange={(e) => setCheckIn(e.target.value)} className={inputCls} />
                    {errors.checkIn && <p className="mt-1 text-[12px] font-bold text-red-600">{errors.checkIn}</p>}
                  </label>
                  <label>
                    <span className="flex items-center gap-1.5 text-[13px] font-bold">
                      <CalendarDays className="h-4 w-4 text-[#9AA0B4]" /> Check-out (12:00 PM)
                    </span>
                    <input type="date" value={checkOut} min={checkIn || today} onChange={(e) => setCheckOut(e.target.value)} className={inputCls} />
                    {errors.checkOut && <p className="mt-1 text-[12px] font-bold text-red-600">{errors.checkOut}</p>}
                  </label>
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-[12.5px] font-medium text-slate-500">
                  <Users className="h-4 w-4" /> {nights} night{nights === 1 ? "" : "s"} • {form.guests} guest{Number(form.guests) === 1 ? "" : "s"}
                </p>
              </section>

              <section className="rounded-2xl border border-[#E3E6EF] bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-[16px] font-extrabold">Payment method</h2>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {PAYMENT_METHODS.map((m) => (
                    <label
                      key={m}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-[13.5px] font-bold transition ${
                        form.paymentMethod === m ? "border-[#5B5BE6] bg-[#5B5BE6]/5 text-[#1B1D2A]" : "border-[#D9DDE8] text-slate-600"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={form.paymentMethod === m}
                        onChange={() => setForm((f) => ({ ...f, paymentMethod: m }))}
                        className="h-4 w-4 accent-[#5B5BE6]"
                      />
                      {m}
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-[12px] text-slate-500">
                  No online charge today for Pay at hotel. Mobile banking details arrive by SMS after confirmation.
                </p>
              </section>

              {errors.form && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-bold text-red-700">
                  {errors.form}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting || !room.available}
                className="w-full rounded-xl bg-[#5B5BE6] py-3.5 text-[15px] font-bold text-white transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: BRAND }}
              >
                {submitting ? "Confirming…" : room.available ? "Confirm Booking" : "Room currently booked"}
              </button>
            </div>

            {/* Right: sticky summary */}
            <aside className="lg:sticky lg:top-20">
              <div className="overflow-hidden rounded-2xl border border-[#E3E6EF] bg-white shadow-sm">
                <div className="relative h-44 bg-slate-100">
                  <SafeImage
                    src={room.images[0]}
                    alt={ROOM_IMAGES[room.id]?.[0]?.alt || `${room.name}, Bangladesh`}
                    fill
                    sizes="340px"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-[15px] font-extrabold">{room.name}</h3>
                  {(room.hotel || room.address) && (
                    <p className="mt-0.5 text-[12px] text-slate-500">
                      {[room.hotel, room.address].filter(Boolean).join(" • ")}
                    </p>
                  )}
                  <dl className="mt-3 space-y-1.5 text-[13px]">
                    <div className="flex justify-between">
                      <dt className="text-slate-500">{formatBDT(room.price)} × {nights} night{nights === 1 ? "" : "s"} × {roomsQty} room{roomsQty === 1 ? "" : "s"}</dt>
                      <dd className="font-bold tabular-nums">{formatBDT(subtotal)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">VAT (15%)</dt>
                      <dd className="font-bold tabular-nums">{formatBDT(vat)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Service charge (5%)</dt>
                      <dd className="font-bold tabular-nums">{formatBDT(service)}</dd>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-2 text-[15px] font-black">
                      <dt>Estimated total</dt>
                      <dd className="tabular-nums">{formatBDT(estimated)}</dd>
                    </div>
                  </dl>
                  <p className="mt-3 flex items-start gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-[12px] font-semibold text-emerald-700">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                    Free cancellation up to 24 hours before check-in. Final total is confirmed by our server on submit.
                  </p>
                </div>
              </div>
            </aside>
          </form>
        )}
      </div>
      <Footer />
      <Toaster />
    </div>
  );
}

export default function BookingPage() {
  return (
    <RequireAuth>
      <BookingInner />
    </RequireAuth>
  );
}
