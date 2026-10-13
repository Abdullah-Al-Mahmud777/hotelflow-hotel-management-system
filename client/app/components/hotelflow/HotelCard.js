"use client";

// ---------------------------------------------------------------------------
// HotelFlow HotelCard — white rounded horizontal card:
// left image + wishlist heart | middle details + amenities grid |
// right rating badge + price + CTA. Hover: lift + stronger shadow.
// ---------------------------------------------------------------------------

import Link from "next/link";
import {
  Heart,
  Star,
  MapPin,
  CheckCircle2,
  Car,
  Wifi,
  BedDouble,
  Coffee,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { BRAND, BRAND_DARK, RATING_NAVY } from "./data";
import { HOTEL_IMAGES } from "./images";
import SafeImage from "./SafeImage";
import { formatBDT } from "../../lib/format";

const AMENITIES = [
  { key: "parking", icon: Car, label: "Free Parking" },
  { key: "wifi", icon: Wifi, label: "Free Internet" },
  { key: "bed", icon: BedDouble, label: "King size bed" },
  { key: "breakfast", icon: Coffee, label: "Free breakfast" },
];

export function Stars({ count }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${count} star hotel`}>
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      ))}
    </span>
  );
}

export default function HotelCard({ hotel, isFavorite, onToggleFavorite, ctaHref = "/rooms", ctaLabel = "See availability" }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-[#E3E6EF] bg-white shadow-[0_2px_12px_rgba(18,24,60,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(45,50,140,0.16)] sm:flex-row">
      {/* Left: image */}
      <div className="relative h-52 shrink-0 overflow-hidden bg-slate-100 sm:h-auto sm:min-h-[240px] sm:w-[250px]">
        <SafeImage
          src={hotel.image}
          alt={HOTEL_IMAGES[hotel.id]?.alt || `${hotel.name}, Bangladesh`}
          fill
          sizes="(max-width: 640px) 100vw, 250px"
          className="h-full w-full object-cover"
        />
        <button
          type="button"
          aria-label="Save to wishlist"
          onClick={() => onToggleFavorite?.(hotel.id)}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow-md transition hover:scale-105 active:scale-95"
        >
          <Heart
            className={`h-[18px] w-[18px] ${isFavorite ? "fill-red-500 text-red-500" : "text-[#5A5F79]"}`}
          />
        </button>
      </div>

      {/* Middle: details */}
      <div className="min-w-0 flex-1 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[17px] font-extrabold leading-snug tracking-tight text-[#1B1D2A]">
            {hotel.name}
          </h3>
        </div>
        <div className="mt-1">
          <Stars count={hotel.stars} />
        </div>
        <p className="mt-1.5 flex flex-wrap items-center gap-1 text-[12.5px] text-[#6B7089]">
          <MapPin className="h-3.5 w-3.5" style={{ color: BRAND }} />
          <span className="font-medium text-[#3D6DB5]">{hotel.location}</span>
          <span aria-hidden>•</span>
          <a href="#map" className="font-bold hover:underline" style={{ color: BRAND }}>
            Show on map
          </a>
        </p>

        <p className="mt-2.5 text-[12.5px] font-medium text-[#6B7089]">
          1 night, 2 adults
        </p>
        <div className="mt-1 space-y-1 text-[13px]">
          {hotel.freeCancellation && (
            <p className="flex items-center gap-1.5 font-bold text-emerald-600">
              <CheckCircle2 className="h-4 w-4" /> Free cancellation
            </p>
          )}
          {hotel.noPrepayment && (
            <p className="font-semibold text-emerald-600">No prepayment needed • Pay at hotel</p>
          )}
          <p className="font-medium text-emerald-700">
            You can cancel later, so lock in this great price today!
          </p>
        </div>

        {/* Amenities 2-col icon grid */}
        <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1.5 xs:grid-cols-2 sm:grid-cols-2">
          {AMENITIES.map(({ key, icon: Icon, label }) => {
            const dimmed =
              (key === "parking" && !hotel.parking) ||
              (key === "wifi" && !hotel.wifi) ||
              (key === "breakfast" && !hotel.breakfastIncluded);
            if (dimmed) return null;
            return (
              <span key={key} className="flex items-center gap-2 text-[12.5px] font-medium text-[#3D4159]">
                <Icon className="h-4 w-4 shrink-0" style={{ color: BRAND }} />
                {key === "breakfast" && !hotel.breakfastIncluded ? "Breakfast available" : label}
              </span>
            );
          })}
        </div>
        {hotel.healthSafety && (
          <p className="mt-2 flex items-center gap-1.5 text-[12px] font-medium text-[#6B7089]">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Enhanced health & safety measures
          </p>
        )}
      </div>

      {/* Right: rating + price + CTA */}
      <div className="flex shrink-0 flex-row items-center justify-between gap-3 border-t border-[#EEF0F5] bg-[#FAFBFE] p-4 sm:w-[218px] sm:flex-col sm:items-stretch sm:justify-between sm:border-l sm:border-t-0 sm:p-5 sm:text-right">
        <div className="flex items-center gap-2 sm:justify-end">
          <div className="sm:text-right">
            <p className="text-[13px] font-bold leading-none text-[#1B1D2A]">
              {hotel.ratingLabel}
            </p>
            <p className="mt-1 text-[11.5px] text-[#6B7089]">
              {hotel.reviews.toLocaleString()} Reviews
            </p>
          </div>
          <span
            className="rounded-lg rounded-tr-none px-2.5 py-2 text-[15px] font-extrabold tabular-nums text-white"
            style={{ backgroundColor: RATING_NAVY }}
          >
            {hotel.rating.toFixed(1)}
          </span>
        </div>
        <div className="sm:text-right">
          <p className="hidden text-[11px] text-[#6B7089] sm:block">1 night, 2 adults</p>
          <p className="mt-0.5 text-[22px] font-black tracking-tight tabular-nums text-[#1B1D2A]">
            {formatBDT(hotel.price)}
          </p>
          <p className="text-[11.5px] text-[#9AA0B4]">+{formatBDT(hotel.taxes)} VAT & service charge</p>
          <Link
            href={ctaHref}
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-center text-[13.5px] font-bold text-white transition hover:brightness-110 active:scale-[0.98]"
            style={{ backgroundColor: BRAND }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BRAND_DARK)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BRAND)}
          >
            {ctaLabel} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

// Loading skeleton matching the card shape.
export function HotelCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col overflow-hidden rounded-2xl border border-[#E3E6EF] bg-white sm:flex-row">
      <div className="h-52 bg-[#E8EAF2] sm:h-auto sm:min-h-[240px] sm:w-[250px]" />
      <div className="flex-1 space-y-3 p-5">
        <div className="h-5 w-2/3 rounded bg-[#E8EAF2]" />
        <div className="h-3 w-1/2 rounded bg-[#E8EAF2]" />
        <div className="h-3 w-1/3 rounded bg-[#E8EAF2]" />
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="h-3 rounded bg-[#E8EAF2]" />
          <div className="h-3 rounded bg-[#E8EAF2]" />
          <div className="h-3 rounded bg-[#E8EAF2]" />
          <div className="h-3 rounded bg-[#E8EAF2]" />
        </div>
      </div>
      <div className="w-full space-y-3 border-t border-[#EEF0F5] bg-[#FAFBFE] p-5 sm:w-[218px] sm:border-l sm:border-t-0">
        <div className="ml-auto h-10 w-24 rounded bg-[#E8EAF2]" />
        <div className="ml-auto h-7 w-32 rounded bg-[#E8EAF2]" />
        <div className="h-10 w-full rounded-xl bg-[#E8EAF2]" />
      </div>
    </div>
  );
}
