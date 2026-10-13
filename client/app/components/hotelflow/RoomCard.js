"use client";

// ---------------------------------------------------------------------------
// HotelFlow RoomCard — horizontal room card in the site's purple style:
// large image + heart + type badge | details + specs + amenity icons |
// rating + price + "View details" (outline) + "Book now" (filled).
// "Book now" goes to /booking?… when logged in, or opens the login prompt
// (dates/guests preserved) when logged out.
// ---------------------------------------------------------------------------

import Link from "next/link";
import {
  Heart,
  Users,
  BedDouble,
  Maximize,
  Eye,
  Wifi,
  Snowflake,
  Tv,
  Wine,
  Sun,
  Coffee,
  Waves,
  Zap,
  UtensilsCrossed,
  Moon,
  Car,
  CheckCircle2,
} from "lucide-react";
import { BRAND, BRAND_DARK, RATING_NAVY } from "./data";
import { ROOM_IMAGES } from "./images";
import SafeImage from "./SafeImage";
import { useBookNow, AuthPromptModal } from "./AuthPrompt";
import { formatBDT } from "../../lib/format";

// Amenity key → icon + label (mirrors ROOM_AMENITIES in roomsData.js).
export const AMENITY_ICONS = {
  wifi: { icon: Wifi, label: "Free Wi-Fi" },
  ac: { icon: Snowflake, label: "A/C" },
  tv: { icon: Tv, label: "TV" },
  minibar: { icon: Wine, label: "Mini bar" },
  balcony: { icon: Sun, label: "Balcony" },
  breakfast: { icon: Coffee, label: "Breakfast" },
  seaview: { icon: Waves, label: "Sea view" },
  generator: { icon: Zap, label: "Generator backup" },
  halal: { icon: UtensilsCrossed, label: "Halal food" },
  prayer: { icon: Moon, label: "Prayer room nearby" },
  airport: { icon: Car, label: "Airport pickup" },
};

export function AvailabilityBadge({ available }) {
  return available ? (
    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[11.5px] font-bold text-emerald-700">
      <CheckCircle2 className="h-3.5 w-3.5" /> Available
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-[11.5px] font-bold text-red-600">
      Booked
    </span>
  );
}

export default function RoomCard({
  room,
  isFavorite,
  onToggleFavorite,
  checkIn = "",
  checkOut = "",
  guests = "",
  rooms = "1",
}) {
  // Logged in → /booking?… ; logged out → login prompt (dates preserved).
  const { prompt, closePrompt, bookNow } = useBookNow();
  const goBook = () => bookNow(room.id, { checkIn, checkOut, guests, rooms });

  const specs = [
    { icon: Users, label: `${room.capacity} guest${room.capacity > 1 ? "s" : ""}` },
    { icon: BedDouble, label: room.beds },
    { icon: Maximize, label: `${room.size} sq ft` },
    { icon: Eye, label: room.view },
  ];

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-[#E3E6EF] bg-white shadow-[0_2px_12px_rgba(18,24,60,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(45,50,140,0.16)] sm:flex-row">
      {/* Left: image */}
      <div className="relative h-52 shrink-0 overflow-hidden bg-slate-100 sm:h-auto sm:min-h-[240px] sm:w-[260px]">
        <SafeImage
          src={room.images[0]}
          alt={ROOM_IMAGES[room.id]?.[0]?.alt || `${room.name}, Bangladesh`}
          fill
          sizes="(max-width: 640px) 100vw, 260px"
          className="h-full w-full object-cover"
        />
        <button
          type="button"
          aria-label={isFavorite ? `Remove ${room.name} from wishlist` : `Save ${room.name} to wishlist`}
          aria-pressed={isFavorite}
          onClick={onToggleFavorite}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow-md transition hover:scale-105 active:scale-95"
        >
          <Heart className={`h-[18px] w-[18px] ${isFavorite ? "fill-red-500 text-red-500" : "text-[#5A5F79]"}`} />
        </button>
        <span className="absolute bottom-2.5 left-2.5 rounded-md bg-white/95 px-2 py-1 text-[11px] font-bold text-[#1B1D2A] shadow">
          {room.type}
        </span>
      </div>

      {/* Middle: details */}
      <div className="min-w-0 flex-1 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[17px] font-extrabold tracking-tight text-[#1B1D2A]">
            {room.name}
          </h3>
          <AvailabilityBadge available={room.available} />
        </div>
        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-[#6B7089]">
          {room.description}
        </p>
        <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
          {specs.map(({ icon: Icon, label }) => (
            <span key={label} className="flex items-center gap-1.5 text-[12.5px] font-medium text-[#3D4159]">
              <Icon className="h-4 w-4 shrink-0" style={{ color: BRAND }} /> {label}
            </span>
          ))}
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {Object.entries(room.amenities)
            .filter(([, on]) => on)
            .slice(0, 5)
            .map(([key]) => {
              const A = AMENITY_ICONS[key];
              if (!A) return null;
              const Icon = A.icon;
              return (
                <span key={key} className="inline-flex items-center gap-1 rounded-md border border-[#E3E6EF] bg-[#F7F8FB] px-2 py-1 text-[11.5px] font-semibold text-[#3D4159]">
                  <Icon className="h-3.5 w-3.5" style={{ color: BRAND }} /> {A.label}
                </span>
              );
            })}
        </div>
      </div>

      {/* Right: rating + price + CTAs */}
      <div className="flex shrink-0 flex-row items-center justify-between gap-3 border-t border-[#EEF0F5] bg-[#FAFBFE] p-4 sm:w-[228px] sm:flex-col sm:items-stretch sm:justify-between sm:border-l sm:border-t-0 sm:p-5 sm:text-right">
        <div className="flex items-center gap-2 sm:justify-end">
          <div className="sm:text-right">
            <p className="text-[11.5px] text-[#6B7089]">
              {room.reviews.toLocaleString()} Reviews
            </p>
          </div>
          <span
            className="rounded-lg rounded-tr-none px-2.5 py-2 text-[15px] font-extrabold tabular-nums text-white"
            style={{ backgroundColor: RATING_NAVY }}
          >
            {room.rating.toFixed(1)}
          </span>
        </div>
        <div className="sm:text-right">
          <p className="text-[22px] font-black tabular-nums tracking-tight text-[#1B1D2A]">
            {formatBDT(room.price)}
            <span className="text-[13px] font-bold text-[#6B7089]">/night</span>
          </p>
          <p className="text-[11.5px] text-[#9AA0B4]">+ 15% VAT included</p>
          <div className="mt-3 flex gap-2 sm:flex-col">
            <Link
              href={`/rooms/${room.id}`}
              className="inline-flex flex-1 items-center justify-center rounded-xl border-2 px-4 py-2 text-center text-[13px] font-bold transition active:scale-[0.98]"
              style={{ borderColor: BRAND, color: BRAND }}
            >
              View details
            </Link>
            {room.available ? (
              <button
                type="button"
                onClick={goBook}
                className="inline-flex flex-1 items-center justify-center rounded-xl px-4 py-2.5 text-center text-[13px] font-bold text-white transition hover:brightness-110 active:scale-[0.98]"
                style={{ backgroundColor: BRAND }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BRAND_DARK)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BRAND)}
              >
                Book now
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex flex-1 cursor-not-allowed items-center justify-center rounded-xl bg-[#E4E7F0] px-4 py-2.5 text-center text-[13px] font-bold text-[#9AA0B4]"
              >
                Book now
              </button>
            )}
            <AuthPromptModal redirect={prompt} onClose={closePrompt} />
          </div>
        </div>
      </div>
    </article>
  );
}

// Loading skeleton shaped like a RoomCard.
export function RoomCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col overflow-hidden rounded-2xl border border-[#E3E6EF] bg-white sm:flex-row">
      <div className="h-52 bg-[#E8EAF2] sm:h-auto sm:min-h-[240px] sm:w-[260px]" />
      <div className="flex-1 space-y-3 p-5">
        <div className="h-5 w-2/3 rounded bg-[#E8EAF2]" />
        <div className="h-3 w-full rounded bg-[#E8EAF2]" />
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="h-3 rounded bg-[#E8EAF2]" />
          <div className="h-3 rounded bg-[#E8EAF2]" />
          <div className="h-3 rounded bg-[#E8EAF2]" />
          <div className="h-3 rounded bg-[#E8EAF2]" />
        </div>
      </div>
      <div className="w-full space-y-3 border-t border-[#EEF0F5] bg-[#FAFBFE] p-5 sm:w-[228px] sm:border-l sm:border-t-0">
        <div className="ml-auto h-10 w-24 rounded bg-[#E8EAF2]" />
        <div className="ml-auto h-7 w-32 rounded bg-[#E8EAF2]" />
        <div className="h-10 w-full rounded-xl bg-[#E8EAF2]" />
      </div>
    </div>
  );
}
