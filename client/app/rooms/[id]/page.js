"use client";

// ---------------------------------------------------------------------------
// HotelFlow Room detail page (/rooms/[id]).
// Gallery + rating + price + full description + amenity icons + specs +
// policies + sticky booking card (live nightly total) + similar rooms.
// Booking uses the EXISTING flow: modal POSTs to /api/bookings (with coupon
// support). ?book=1&checkIn=&checkOut=&guests= deep-links from RoomCard and
// auto-opens the modal with prefilled dates. Invalid ids get a friendly
// "Room not found" + back link. API first, dummy data as fallback.
// ---------------------------------------------------------------------------

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Users,
  BedDouble,
  Maximize,
  Eye,
  Heart,
  Star,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock,
  ShieldCheck,
  SearchX,
} from "lucide-react";
import Navbar from "../../components/hotelflow/Navbar";
import Footer from "../../components/hotelflow/Footer";
import { AMENITY_ICONS, AvailabilityBadge } from "../../components/hotelflow/RoomCard";
import { useBookNow, AuthPromptModal } from "../../components/hotelflow/AuthPrompt";
import SafeImage from "../../components/hotelflow/SafeImage";
import { ROOM_IMAGES } from "../../components/hotelflow/images";
import {
  DUMMY_ROOMS,
  normalizeRoom,
} from "../../components/hotelflow/roomsData";
import { BRAND, RATING_NAVY, PAGE_BG } from "../../components/hotelflow/data";
import { formatBDT, formatDateBD } from "../../lib/format";
import { getApiUrl } from "../../../lib/apiUrl";

const nightCount = (inDate, outDate) => {
  if (!inDate || !outDate) return 0;
  const days = Math.ceil((new Date(outDate) - new Date(inDate)) / 86400000);
  return days > 0 ? days : 0;
};

export default function RoomDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id || "");

  const [room, setRoom] = useState(null);
  const [allRooms, setAllRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Sticky booking card state (also feeds the booking modal).
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [dateError, setDateError] = useState("");

  // Book-now gating: logged in -> /booking?… ; logged out -> login prompt.
  const { prompt, closePrompt, bookNow } = useBookNow();
  const goBook = () => {
    if (!room) return;
    if (checkIn && checkOut && checkOut <= checkIn) {
      setDateError("Check-out date must be after the check-in date.");
      return;
    }
    setDateError("");
    bookNow(room.id, { checkIn, checkOut, guests });
  };

  // Load room (API first, dummy fallback) + room list for "Similar rooms".
  // Query params (?book=1&checkIn=&checkOut=&guests=) are read client-side to
  // prefill the booking card and auto-open the booking modal.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [one, all] = await Promise.all([
          fetch(getApiUrl(`/api/rooms/${id}`), { cache: "no-store" })
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null),
          fetch(getApiUrl("/api/rooms"), { cache: "no-store" })
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null),
        ]);
        if (cancelled) return;
        const list = (all?.data || []).map(normalizeRoom);
        setAllRooms(list.length ? list : DUMMY_ROOMS);
        if (one?.data) setRoom(normalizeRoom(one.data));
        else setRoom(DUMMY_ROOMS.find((r) => r.id === id) || null);
      } catch {
        if (!cancelled) {
          setAllRooms(DUMMY_ROOMS);
          setRoom(DUMMY_ROOMS.find((r) => r.id === id) || null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }

      // Prefill from query string (RoomCard "Book now" deep link).
      try {
        const q = new URLSearchParams(window.location.search);
        const qi = q.get("checkIn") || "";
        const qo = q.get("checkOut") || "";
        const g = Number(q.get("guests")) || 0;
        if (qi) setCheckIn(qi);
        if (qo) setCheckOut(qo);
        if (g > 0) setGuests(g);
      } catch {
        /* query parsing is best-effort */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Reviews for this room (best-effort; empty state when unavailable).
  useEffect(() => {
    let cancelled = false;
    fetch(getApiUrl(`/api/reviews/room/${id}`), { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled) setReviews(d?.data || []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [id]);

  const toggleFavorite = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      if (isFavorite) {
        await fetch(`${base}/api/favorites/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsFavorite(false);
      } else {
        const r = await fetch(`${base}/api/favorites`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ roomId: id }),
        });
        if (r.ok || r.status === 409) setIsFavorite(true);
      }
    } catch (e) {
      console.error("Wishlist error:", e);
    }
  };

  const nights = nightCount(checkIn, checkOut);
  const total = nights * (room?.price || 0);

  const similar = useMemo(() => {
    if (!room) return [];
    const sameType = allRooms.filter((r) => r.id !== room.id && r.type === room.type);
    const rest = allRooms.filter((r) => r.id !== room.id && r.type !== room.type);
    return [...sameType, ...rest].slice(0, 3);
  }, [room, allRooms]);

  if (loading) {
    return (
      <div className="min-h-screen font-sans" style={{ backgroundColor: PAGE_BG }}>
        <Navbar />
        <div className="mx-auto max-w-[1280px] animate-pulse px-4 py-8 sm:px-6">
          <div className="h-96 rounded-2xl bg-[#E8EAF2]" />
          <div className="mt-4 h-6 w-1/2 rounded bg-[#E8EAF2]" />
          <div className="mt-2 h-4 w-1/3 rounded bg-[#E8EAF2]" />
        </div>
      </div>
    );
  }

  // Friendly not-found state for invalid ids.
  if (!room) {
    return (
      <div className="min-h-screen font-sans" style={{ backgroundColor: PAGE_BG }}>
        <Navbar />
        <div className="mx-auto max-w-[1280px] px-4 py-16 text-center sm:px-6">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white shadow">
            <SearchX className="h-7 w-7 text-[#9AA0B4]" />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-[#1B1D2A]">Room not found</h1>
          <p className="mt-2 text-[14px] text-[#6B7089]">
            This room does not exist or is no longer available.
          </p>
          <Link
            href="/rooms"
            className="mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white"
            style={{ backgroundColor: BRAND }}
          >
            <ArrowLeft className="h-4 w-4" /> Back to all rooms
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const specs = [
    { icon: Users, label: `${room.capacity} guest${room.capacity > 1 ? "s" : ""}` },
    { icon: BedDouble, label: room.beds },
    { icon: Maximize, label: `${room.size} sq ft` },
    { icon: Eye, label: room.view },
  ];
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : null;

  return (
    <div className="min-h-screen font-sans text-slate-900" style={{ backgroundColor: PAGE_BG }}>
      <Navbar />
      <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6">
        <Link href="/rooms" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#5B5BE6] hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to all rooms
        </Link>

        <div className="mt-3 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Main column */}
          <div className="min-w-0">
            {/* Gallery */}
            <div className="overflow-hidden rounded-2xl border border-[#E3E6EF] bg-white shadow-[0_2px_12px_rgba(18,24,60,0.06)]">
              <div className="relative h-64 bg-slate-100 sm:h-96">
                <SafeImage
                  src={room.images[activeImg] || room.images[0]}
                  alt={ROOM_IMAGES[room.id]?.[activeImg]?.alt || `${room.name}, Bangladesh`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 800px"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={toggleFavorite}
                  aria-label={isFavorite ? "Remove from wishlist" : "Save to wishlist"}
                  aria-pressed={isFavorite}
                  className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/95 shadow-md transition hover:scale-105"
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-[#5A5F79]"}`} />
                </button>
                <span className="absolute bottom-3 left-3 rounded-md bg-white/95 px-2.5 py-1 text-[12px] font-bold text-[#1B1D2A] shadow">
                  {room.type}
                </span>
              </div>
              <div className="flex gap-2 overflow-x-auto p-3">
                {room.images.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    aria-label={`View photo ${i + 1}`}
                    className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                      i === activeImg ? "border-[#5B5BE6]" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <SafeImage
                      src={src}
                      alt={ROOM_IMAGES[room.id]?.[i]?.alt || `${room.name} photo ${i + 1}, Bangladesh`}
                      fill
                      sizes="96px"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Title + rating */}
            <div className="mt-4 rounded-2xl border border-[#E3E6EF] bg-white p-5 shadow-[0_2px_12px_rgba(18,24,60,0.06)] sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-[#1B1D2A]">{room.name}</h1>
                  {(room.hotel || room.address) && (
                    <p className="mt-1 text-[13px] font-medium text-[#6B7089]">
                      {[room.hotel, room.address].filter(Boolean).join(" • ")}
                    </p>
                  )}
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <AvailabilityBadge available={room.available} />
                    <span className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < Math.round(room.rating / 2) ? "fill-amber-400 text-amber-400" : "text-[#CBD2DC]"}`}
                        />
                      ))}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-[11.5px] text-[#6B7089]">{room.reviews.toLocaleString()} Reviews</p>
                  </div>
                  <span
                    className="rounded-lg rounded-tr-none px-2.5 py-2 text-[15px] font-extrabold text-white"
                    style={{ backgroundColor: RATING_NAVY }}
                  >
                    {room.rating.toFixed(1)}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-[14px] leading-relaxed text-[#3D4159]">{room.description}</p>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
                {specs.map(({ icon: Icon, label }) => (
                  <span key={label} className="flex items-center gap-1.5 text-[13px] font-medium text-[#3D4159]">
                    <Icon className="h-4 w-4" style={{ color: BRAND }} /> {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="mt-4 rounded-2xl border border-[#E3E6EF] bg-white p-5 shadow-[0_2px_12px_rgba(18,24,60,0.06)] sm:p-6">
              <h2 className="text-[16px] font-extrabold text-[#1B1D2A]">Amenities</h2>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {Object.entries(room.amenities).map(([key, on]) => {
                  const A = AMENITY_ICONS[key];
                  if (!A) return null;
                  const Icon = A.icon;
                  return (
                    <p key={key} className={`flex items-center gap-2 text-[13.5px] font-medium ${on ? "text-[#2B2E44]" : "text-[#9AA0B4] line-through"}`}>
                      <Icon className="h-4 w-4" style={{ color: on ? BRAND : "#CBD2DC" }} /> {A.label}
                    </p>
                  );
                })}
              </div>
            </div>

            {/* Policies */}
            <div className="mt-4 rounded-2xl border border-[#E3E6EF] bg-white p-5 shadow-[0_2px_12px_rgba(18,24,60,0.06)] sm:p-6">
              <h2 className="text-[16px] font-extrabold text-[#1B1D2A]">Policies</h2>
              <ul className="mt-3 space-y-2 text-[13.5px] text-[#3D4159]">
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0" style={{ color: BRAND }} />
                  Check-in: {room.policies.checkIn} • Check-out: {room.policies.checkOut}
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  {room.policies.cancellation}
                </li>
              </ul>
            </div>

            {/* Reviews (compact) */}
            <div className="mt-4 rounded-2xl border border-[#E3E6EF] bg-white p-5 shadow-[0_2px_12px_rgba(18,24,60,0.06)] sm:p-6">
              <h2 className="text-[16px] font-extrabold text-[#1B1D2A]">
                Guest reviews {avgRating ? `(${avgRating.toFixed(1)} / 5)` : ""}
              </h2>
              {reviews.length === 0 ? (
                <p className="mt-2 text-[13.5px] text-[#6B7089]">
                  No reviews yet — be the first to review this room!
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  {reviews.slice(0, 3).map((r) => (
                    <div key={r._id} className="rounded-xl border border-[#EEF0F5] p-4">
                      <p className="text-[13px] font-bold text-[#1B1D2A]">
                        {r.user?.name || "Guest"} • <span className="text-amber-500">{"★".repeat(r.rating)}</span>
                        {r.createdAt && (
                          <span className="ml-2 font-medium text-[#9AA0B4]">{formatDateBD(r.createdAt)}</span>
                        )}
                      </p>
                      <p className="mt-1 text-[13px] text-[#3D4159]">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sticky booking card */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-2xl border border-[#E3E6EF] bg-white p-5 shadow-[0_2px_12px_rgba(18,24,60,0.06)]">
              <p className="text-[26px] font-black tabular-nums text-[#1B1D2A]">
                {formatBDT(room.price)}
                <span className="text-[14px] font-bold text-[#6B7089]"> / night</span>
              </p>
              <p className="text-[11.5px] text-[#9AA0B4]">+ 15% VAT included • Pay at hotel available</p>
              <div className="mt-4 space-y-2">
                <label className="flex items-center gap-2 rounded-xl border border-[#D9DDE8] px-3 py-2.5">
                  <CalendarDays className="h-4 w-4 shrink-0 text-[#9AA0B4]" />
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    aria-label="Check-in date"
                    className="w-full bg-transparent text-[13px] font-semibold outline-none"
                  />
                </label>
                <label className="flex items-center gap-2 rounded-xl border border-[#D9DDE8] px-3 py-2.5">
                  <CalendarDays className="h-4 w-4 shrink-0 text-[#9AA0B4]" />
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    aria-label="Check-out date"
                    className="w-full bg-transparent text-[13px] font-semibold outline-none"
                  />
                </label>
                <label className="flex items-center gap-2 rounded-xl border border-[#D9DDE8] px-3 py-2.5">
                  <Users className="h-4 w-4 shrink-0 text-[#9AA0B4]" />
                  <input
                    type="number"
                    min={1}
                    max={room.capacity}
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    aria-label="Number of guests"
                    className="w-full bg-transparent text-[13px] font-semibold outline-none"
                  />
                </label>
              </div>
              {dateError && <p className="mt-2 text-[12.5px] font-bold text-red-600">{dateError}</p>}
              <div className="mt-3 rounded-xl bg-[#F5F6FA] p-3 text-[13px]">
                <div className="flex justify-between text-[#3D4159]">
                  <span>{formatBDT(room.price)} × {nights} {nights === 1 ? "night" : "nights"}</span>
                  <span className="font-bold tabular-nums">{formatBDT(total)}</span>
                </div>
                <div className="mt-1 flex justify-between border-t border-[#E3E6EF] pt-2 font-extrabold text-[#1B1D2A]">
                  <span>Total</span>
                  <span className="tabular-nums">{formatBDT(total)}</span>
                </div>
              </div>
              {room.available ? (
                <button
                  type="button"
                  onClick={goBook}
                  className="mt-3 w-full rounded-xl py-3 text-sm font-bold text-white transition hover:brightness-110 active:scale-[0.98]"
                  style={{ backgroundColor: BRAND }}
                >
                  Book now
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="mt-3 w-full cursor-not-allowed rounded-xl bg-[#E4E7F0] py-3 text-sm font-bold text-[#9AA0B4]"
                >
                  Currently booked
                </button>
              )}
              <p className="mt-2 text-center text-[11.5px] text-[#9AA0B4]">
                Free cancellation on most rates
              </p>
            </div>
          </aside>
        </div>

        {/* Similar rooms */}
        {similar.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-extrabold tracking-tight text-[#1B1D2A]">Similar rooms</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              {similar.map((r) => (
                <Link
                  key={r.id}
                  href={`/rooms/${r.id}`}
                  className="group overflow-hidden rounded-2xl border border-[#E3E6EF] bg-white shadow-[0_2px_12px_rgba(18,24,60,0.06)] transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(45,50,140,0.16)]"
                >
                  <div className="relative h-40 overflow-hidden bg-slate-100">
                    <SafeImage
                      src={r.images[0]}
                      alt={ROOM_IMAGES[r.id]?.[0]?.alt || `${r.name}, Bangladesh`}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <span className="absolute bottom-2 left-2 rounded-md bg-white/95 px-2 py-0.5 text-[11px] font-bold">
                      {r.type}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="truncate text-[14.5px] font-extrabold text-[#1B1D2A]">{r.name}</h3>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-[16px] font-black tabular-nums">
                        {formatBDT(r.price)}
                        <span className="text-[12px] font-bold text-[#6B7089]">/night</span>
                      </p>
                      <span className="inline-flex items-center gap-1 text-[13px] font-bold" style={{ color: BRAND }}>
                        View <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <AuthPromptModal redirect={prompt} onClose={closePrompt} />
      <Footer />
    </div>
  );
}
