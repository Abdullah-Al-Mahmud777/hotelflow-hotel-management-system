"use client";

// ---------------------------------------------------------------------------
// HotelFlow SearchBar — white rounded card with:
// top row (Currency + Mode) + main row (4 bordered fields + Search button)
// + collapsible "Advanced filters" (room type, min/max price).
// Controlled component: parent owns `value` + `onChange` + `onSearch`.
// ---------------------------------------------------------------------------

import { useState } from "react";
import {
  MapPin,
  Users,
  CalendarDays,
  DollarSign,
  LayoutGrid,
  ChevronDown,
  Search,
} from "lucide-react";
import { BRAND } from "./data";

const FIELD =
  "flex min-w-0 flex-1 cursor-text items-center gap-2.5 rounded-xl border border-[#D9DDE8] bg-white px-3 py-2.5 transition focus-within:border-[#5B5BE6] focus-within:ring-2 focus-within:ring-[#5B5BE6]/15";
const LABEL =
  "text-[10px] font-bold uppercase tracking-wide text-[#9AA0B4]";
const INPUT =
  "mt-0.5 w-full bg-transparent text-[13px] font-semibold text-[#1B1D2A] outline-none placeholder:text-[#B6BBCB]";

export default function SearchBar({ value, onChange, onSearch, loading }) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const set = (key) => (e) => onChange({ ...value, [key]: e.target.value });

  return (
    <div className="rounded-2xl border border-[#E3E6EF] bg-white p-2.5 shadow-[0_14px_36px_rgba(30,35,110,0.16)] sm:p-3">
      {/* Top row: small dropdowns */}
      <div className="mb-2 flex flex-wrap gap-2">
        <label className="flex min-w-[150px] flex-1 cursor-pointer items-center gap-2 rounded-lg border border-[#D9DDE8] px-3 py-2 sm:flex-none">
          <DollarSign className="h-4 w-4 shrink-0 text-[#9AA0B4]" />
          <span className="flex w-full flex-col">
            <span className={LABEL}>Currency</span>
            <select
              value={value.currency}
              onChange={set("currency")}
              className="mt-0.5 w-full cursor-pointer bg-transparent text-[13px] font-semibold text-[#1B1D2A] outline-none"
            >
              <option value="BDT">BDT</option>
              <option value="USD">USD</option>
              <option value="INR">INR</option>
            </select>
          </span>
        </label>
        <label className="flex min-w-[150px] flex-1 cursor-pointer items-center gap-2 rounded-lg border border-[#D9DDE8] px-3 py-2 sm:flex-none">
          <LayoutGrid className="h-4 w-4 shrink-0 text-[#9AA0B4]" />
          <span className="flex w-full flex-col">
            <span className={LABEL}>Mode</span>
            <select
              value={value.mode}
              onChange={set("mode")}
              className="mt-0.5 w-full cursor-pointer bg-transparent text-[13px] font-semibold text-[#1B1D2A] outline-none"
            >
              <option value="Standard">Standard</option>
              <option value="Modern">Modern</option>
              <option value="Minimal">Minimal</option>
            </select>
          </span>
        </label>

        <button
          type="button"
          onClick={() => setAdvancedOpen(!advancedOpen)}
          className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12.5px] font-bold text-[#5B5BE6] transition hover:bg-[#5B5BE6]/10"
        >
          Advanced filters
          <ChevronDown
            className={`h-4 w-4 transition-transform ${advancedOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Main row: 4 fields + search */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearch?.();
        }}
        className="flex flex-col gap-2 xl:flex-row"
      >
        <label className={`${FIELD} xl:flex-[1.5]`}>
          <MapPin className="h-5 w-5 shrink-0" style={{ color: BRAND }} />
          <span className="flex w-full min-w-0 flex-col">
            <span className={LABEL}>Destination</span>
            <input
              value={value.destination}
              onChange={set("destination")}
              placeholder="Cox's Bazar, Chattogram Division, Bangladesh"
              className={INPUT}
            />
          </span>
        </label>

        <label className={FIELD}>
          <Users className="h-5 w-5 shrink-0 text-[#9AA0B4]" />
          <span className="flex w-full min-w-0 flex-col">
            <span className={LABEL}>Rooms & Guests</span>
            <input
              value={value.guests}
              onChange={set("guests")}
              placeholder="1 Room, 2 Adults"
              className={INPUT}
            />
          </span>
        </label>

        <label className={FIELD}>
          <CalendarDays className="h-5 w-5 shrink-0 text-[#9AA0B4]" />
          <span className="flex w-full min-w-0 flex-col">
            <span className={LABEL}>Check-in date</span>
            <input
              type="date"
              value={value.checkIn}
              onChange={set("checkIn")}
              className={INPUT}
            />
          </span>
        </label>

        <div className="flex min-w-0 flex-1 gap-2">
          <label className={FIELD}>
            <CalendarDays className="h-5 w-5 shrink-0 text-[#9AA0B4]" />
            <span className="flex w-full min-w-0 flex-col">
              <span className={LABEL}>Check-out date</span>
              <input
                type="date"
                value={value.checkOut}
                onChange={set("checkOut")}
                className={INPUT}
              />
            </span>
          </label>
          <button
            type="submit"
            disabled={loading}
            className="flex shrink-0 items-center gap-2 rounded-xl px-6 text-sm font-bold text-white transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ backgroundColor: BRAND }}
          >
            <Search className="h-4 w-4" />
            {loading ? "Searching…" : "Search"}
          </button>
        </div>
      </form>

      {/* Collapsible advanced filters */}
      {advancedOpen && (
        <div className="mt-2 grid animate-fade-in grid-cols-1 gap-2 rounded-xl bg-[#F5F6FA] p-3 sm:grid-cols-3">
          <label className="flex flex-col rounded-lg border border-[#D9DDE8] bg-white px-3 py-2">
            <span className={LABEL}>Room type</span>
            <select
              value={value.roomType}
              onChange={set("roomType")}
              className="mt-0.5 cursor-pointer bg-transparent text-[13px] font-semibold text-[#1B1D2A] outline-none"
            >
              <option value="all">All types</option>
              <option value="Standard">Standard</option>
              <option value="Deluxe">Deluxe</option>
              <option value="Suite">Suite</option>
            </select>
          </label>
          <label className="flex flex-col rounded-lg border border-[#D9DDE8] bg-white px-3 py-2">
            <span className={LABEL}>Min price (per night)</span>
            <input
              type="number"
              min={0}
              value={value.minPrice}
              onChange={set("minPrice")}
              placeholder="৳0"
              className={INPUT}
            />
          </label>
          <label className="flex flex-col rounded-lg border border-[#D9DDE8] bg-white px-3 py-2">
            <span className={LABEL}>Max price (per night)</span>
            <input
              type="number"
              min={0}
              value={value.maxPrice}
              onChange={set("maxPrice")}
              placeholder="৳20,000"
              className={INPUT}
            />
          </label>
        </div>
      )}
    </div>
  );
}
