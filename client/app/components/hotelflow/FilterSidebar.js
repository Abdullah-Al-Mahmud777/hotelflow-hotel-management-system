"use client";

// ---------------------------------------------------------------------------
// HotelFlow FilterSidebar — sticky 280px card with collapsible sections:
// budget (dual slider + toggle), health & safety, popular, facilities,
// star rating, guest rating, room type + "Clear all filters".
// Controlled via `filters` + `onChange` props.
// ---------------------------------------------------------------------------

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { BRAND } from "./data";
import { formatBDT } from "../../lib/format";

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
        <span className="ml-2 shrink-0 text-xs tabular-nums text-[#9AA0B4]">
          {count}
        </span>
      )}
    </label>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
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

const RANGE_MIN = 500;
const RANGE_MAX = 50000;
const RANGE_STEP = 500;

export default function FilterSidebar({ filters, onChange, totalCount }) {
  const set = (patch) => onChange({ ...filters, ...patch });
  const setFlag = (key) => (v) => set({ [key]: v });

  const fillLeft = ((filters.minBudget - RANGE_MIN) / (RANGE_MAX - RANGE_MIN)) * 100;
  const fillRight = ((filters.maxBudget - RANGE_MIN) / (RANGE_MAX - RANGE_MIN)) * 100;

  const clearAll = () =>
    onChange({
      ...filters,
      minBudget: 500,
      maxBudget: 50000,
      budgetEnabled: true,
      healthSafety: false,
      freeCancellation: false,
      isHotel: false,
      noPrepayment: false,
      breakfast: false,
      wifi: false,
      parking: false,
      pool: false,
      gym: false,
      stars: [],
      guestRating: "any",
      roomTypes: [],
    });

  const toggleInList = (list, v) =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

  return (
    <div className="rounded-2xl border border-[#E3E6EF] bg-white p-5 shadow-[0_2px_12px_rgba(18,24,60,0.06)]">
      <h2 className="text-base font-extrabold tracking-tight text-[#1B1D2A]">
        Filter your results
      </h2>
      <p className="mt-0.5 text-xs text-[#6B7089]">
        Showing {totalCount} {totalCount === 1 ? "property" : "properties"}
      </p>

      <div className="mt-4">
        {/* Budget */}
        <Section title="Your budget (per night)">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-extrabold tabular-nums" style={{ color: BRAND }}>
              {formatBDT(filters.minBudget)} - {formatBDT(filters.maxBudget)}
            </p>
            <Toggle checked={filters.budgetEnabled} onChange={setFlag("budgetEnabled")} />
          </div>
          <div className={filters.budgetEnabled ? "" : "pointer-events-none opacity-40"}>
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
                min={RANGE_MIN}
                max={RANGE_MAX}
                step={RANGE_STEP}
                value={filters.minBudget}
                onChange={(e) =>
                  set({ minBudget: Math.min(Number(e.target.value), filters.maxBudget) })
                }
                className="hf-range absolute -top-[7px] h-[19px] w-full cursor-pointer appearance-none bg-transparent"
                aria-label="Minimum budget"
              />
              <input
                type="range"
                min={RANGE_MIN}
                max={RANGE_MAX}
                step={RANGE_STEP}
                value={filters.maxBudget}
                onChange={(e) =>
                  set({ maxBudget: Math.max(Number(e.target.value), filters.minBudget) })
                }
                className="hf-range absolute -top-[7px] h-[19px] w-full cursor-pointer appearance-none bg-transparent"
                aria-label="Maximum budget"
              />
            </div>
            <div className="mt-2 flex justify-between text-[11px] font-medium text-[#9AA0B4]">
              <span>{formatBDT(RANGE_MIN)}</span>
              <span>{formatBDT(RANGE_MAX)}+</span>
            </div>
          </div>
        </Section>

        {/* Health & Safety */}
        <Section title="Health & Safety">
          <CheckRow
            label="Properties with enhanced health & safety measures"
            count={423}
            checked={filters.healthSafety}
            onChange={setFlag("healthSafety")}
          />
        </Section>

        {/* Popular */}
        <Section title="Popular Filters">
          <CheckRow label="Free cancellation" count={312} checked={filters.freeCancellation} onChange={setFlag("freeCancellation")} />
          <CheckRow label="Hotel" count={423} checked={filters.isHotel} onChange={setFlag("isHotel")} />
          <CheckRow label="No prepayment" count={189} checked={filters.noPrepayment} onChange={setFlag("noPrepayment")} />
          <CheckRow label="Breakfast included" count={256} checked={filters.breakfast} onChange={setFlag("breakfast")} />
        </Section>

        {/* Facilities */}
        <Section title="Facilities">
          <CheckRow label="Free Wi-Fi" count={512} checked={filters.wifi} onChange={setFlag("wifi")} />
          <CheckRow label="Free Parking" count={348} checked={filters.parking} onChange={setFlag("parking")} />
          <CheckRow label="Pool" count={204} checked={filters.pool} onChange={setFlag("pool")} />
          <CheckRow label="Gym" count={176} checked={filters.gym} onChange={setFlag("gym")} />
        </Section>

        {/* Star rating */}
        <Section title="Star rating" defaultOpen={false}>
          {[5, 4, 3, 2].map((s) => (
            <CheckRow
              key={s}
              label={`${s} stars`}
              count={s * 47}
              checked={filters.stars.includes(s)}
              onChange={() => set({ stars: toggleInList(filters.stars, s) })}
            />
          ))}
        </Section>

        {/* Guest rating */}
        <Section title="Guest rating" defaultOpen={false}>
          {[
            { v: "any", label: "Any score" },
            { v: "9", label: "Superb: 9+" },
            { v: "8", label: "Excellent: 8+" },
            { v: "7", label: "Good: 7+" },
          ].map((o) => (
            <label key={o.v} className="flex cursor-pointer items-center gap-2.5 py-[5px] text-[13.5px] font-medium text-[#2B2E44]">
              <input
                type="radio"
                name="guestRating"
                checked={filters.guestRating === o.v}
                onChange={() => set({ guestRating: o.v })}
                className="h-4 w-4"
                style={{ accentColor: BRAND }}
              />
              {o.label}
            </label>
          ))}
        </Section>

        {/* Room type */}
        <Section title="Room type" defaultOpen={false}>
          {["Standard", "Deluxe", "Suite"].map((t) => (
            <CheckRow
              key={t}
              label={t}
              checked={filters.roomTypes.includes(t)}
              onChange={() => set({ roomTypes: toggleInList(filters.roomTypes, t) })}
            />
          ))}
        </Section>
      </div>

      <button
        type="button"
        onClick={clearAll}
        className="mt-2 text-[13px] font-bold underline-offset-2 hover:underline"
        style={{ color: BRAND }}
      >
        Clear all filters
      </button>
    </div>
  );
}

export const DEFAULT_FILTERS = {
  minBudget: 500,
  maxBudget: 50000,
  budgetEnabled: true,
  healthSafety: false,
  freeCancellation: false,
  isHotel: false,
  noPrepayment: false,
  breakfast: false,
  wifi: false,
  parking: false,
  pool: false,
  gym: false,
  stars: [],
  guestRating: "any",
  roomTypes: [],
};
