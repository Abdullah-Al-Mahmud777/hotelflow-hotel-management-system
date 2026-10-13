"use client";

// ---------------------------------------------------------------------------
// HotelFlow RoomFilters — sticky sidebar card for the Rooms page:
// price range slider, room type checkboxes, amenity checkboxes, bed type,
// "Available only" toggle + "Clear all filters". Also exports a mobile
// slide-in FilterDrawer. Controlled via `filters` + `onChange`.
// ---------------------------------------------------------------------------

import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { BRAND } from "./data";
import { formatBDT } from "../../lib/format";
import { ROOM_TYPES, BED_TYPES, ROOM_AMENITIES, DUMMY_ROOMS } from "./roomsData";

export const PRICE_MIN = 500;
export const PRICE_MAX = 50000;
export const PRICE_STEP = 500;

export const DEFAULT_ROOM_FILTERS = {
  minPrice: PRICE_MIN,
  maxPrice: PRICE_MAX,
  types: [],
  amenities: [],
  bedTypes: [],
  availableOnly: false,
};

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-[#EEF0F5] py-4 first:border-t-0 first:pt-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-[13px] font-bold text-[#1B1D2A]">{title}</span>
        <ChevronDown
          className={`h-4 w-4 text-[#9AA0B4] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}

function CheckRow({ label, count, checked, onChange }) {
  return (
    <label className="group flex cursor-pointer items-center justify-between py-[5px]">
      <span className="flex min-w-0 items-center gap-2.5">
        <span
          className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px] border transition"
          style={{
            backgroundColor: checked ? BRAND : "#fff",
            borderColor: checked ? BRAND : "#C7CCDA",
          }}
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="sr-only"
          />
          {checked && (
            <svg viewBox="0 0 12 12" className="h-3 w-3 fill-none stroke-white stroke-2">
              <path d="M2 6.5 4.8 9 10 3.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <span className="truncate text-[13.5px] font-medium text-[#2B2E44] group-hover:text-black">
          {label}
        </span>
      </span>
      {count != null && (
        <span className="ml-2 shrink-0 text-xs tabular-nums text-[#9AA0B4]">{count}</span>
      )}
    </label>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative h-[22px] w-[40px] shrink-0 rounded-full transition-colors"
      style={{ backgroundColor: checked ? BRAND : "#CBD2DC" }}
    >
      <span
        className="absolute top-[3px] h-4 w-4 rounded-full bg-white shadow transition-all"
        style={{ left: checked ? "21px" : "3px" }}
      />
    </button>
  );
}

export default function RoomFilters({ rooms, filters, onChange, totalCount }) {
  const set = (patch) => onChange({ ...filters, ...patch });
  const toggleInList = (list, v) =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
  const source = rooms?.length ? rooms : DUMMY_ROOMS;

  const fillLeft = ((filters.minPrice - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const fillRight = ((filters.maxPrice - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  return (
    <div className="rounded-2xl border border-[#E3E6EF] bg-white p-5 shadow-[0_2px_12px_rgba(18,24,60,0.06)]">
      <h2 className="text-base font-extrabold tracking-tight text-[#1B1D2A]">
        Filter rooms
      </h2>
      <p className="mt-0.5 text-xs text-[#6B7089]">
        Showing {totalCount} {totalCount === 1 ? "room" : "rooms"}
      </p>

      <div className="mt-4">
        <Section title="Price per night">
          <p className="text-[13px] font-extrabold tabular-nums" style={{ color: BRAND }}>
            {formatBDT(filters.minPrice)} - {formatBDT(filters.maxPrice)}
          </p>
          <div className="relative mt-4 h-[5px] rounded-full bg-[#E4E7F0]">
            <div
              className="absolute h-[5px] rounded-full"
              style={{
                left: `${fillLeft}%`,
                width: `${Math.max(fillRight - fillLeft, 2)}%`,
                backgroundColor: BRAND,
              }}
            />
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={PRICE_STEP}
              value={filters.minPrice}
              onChange={(e) => set({ minPrice: Math.min(Number(e.target.value), filters.maxPrice) })}
              className="hf-range absolute -top-[7px] h-[19px] w-full cursor-pointer appearance-none bg-transparent"
              aria-label="Minimum price"
            />
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={PRICE_STEP}
              value={filters.maxPrice}
              onChange={(e) => set({ maxPrice: Math.max(Number(e.target.value), filters.minPrice) })}
              className="hf-range absolute -top-[7px] h-[19px] w-full cursor-pointer appearance-none bg-transparent"
              aria-label="Maximum price"
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] font-medium text-[#9AA0B4]">
            <span>{formatBDT(PRICE_MIN)}</span>
            <span>{formatBDT(PRICE_MAX)}+</span>
          </div>
        </Section>

        <Section title="Room type">
          {ROOM_TYPES.map((t) => (
            <CheckRow
              key={t}
              label={t}
              count={source.filter((r) => r.type === t).length}
              checked={filters.types.includes(t)}
              onChange={() => set({ types: toggleInList(filters.types, t) })}
            />
          ))}
        </Section>

        <Section title="Amenities">
          {ROOM_AMENITIES.map((a) => (
            <CheckRow
              key={a.key}
              label={a.label}
              checked={filters.amenities.includes(a.key)}
              onChange={() => set({ amenities: toggleInList(filters.amenities, a.key) })}
            />
          ))}
        </Section>

        <Section title="Bed type" defaultOpen={false}>
          {BED_TYPES.map((b) => (
            <CheckRow
              key={b}
              label={`${b} bed`}
              checked={filters.bedTypes.includes(b)}
              onChange={() => set({ bedTypes: toggleInList(filters.bedTypes, b) })}
            />
          ))}
        </Section>

        <Section title="Availability">
          <label className="flex cursor-pointer items-center justify-between py-[5px] text-[13.5px] font-medium text-[#2B2E44]">
            Available only
            <Toggle
              checked={filters.availableOnly}
              onChange={(v) => set({ availableOnly: v })}
              label="Available only"
            />
          </label>
        </Section>
      </div>

      <button
        type="button"
        onClick={() => onChange(DEFAULT_ROOM_FILTERS)}
        className="mt-2 text-[13px] font-bold underline-offset-2 hover:underline"
        style={{ color: BRAND }}
      >
        Clear all filters
      </button>
    </div>
  );
}

// Mobile slide-in drawer wrapping the RoomFilters card.
export function RoomFilterDrawer({ open, onClose, onClear, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Room filters">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-y-0 left-0 flex w-[320px] max-w-[85vw] flex-col bg-[#F5F6FA] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E3E6EF] bg-white px-4 py-3">
          <span className="text-[15px] font-extrabold text-[#1B1D2A]">Filters</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClear} className="text-[12.5px] font-bold" style={{ color: BRAND }}>
              Clear all
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close filters"
              className="grid h-9 w-9 place-items-center rounded-full bg-[#F1F2F7] transition hover:bg-[#E4E7F0]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3">{children}</div>
        <div className="border-t border-[#E3E6EF] bg-white p-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl py-3 text-sm font-bold text-white transition hover:brightness-110 active:scale-[0.98]"
            style={{ backgroundColor: BRAND }}
          >
            Show rooms
          </button>
        </div>
      </div>
    </div>
  );
}
