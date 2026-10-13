"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import SafeImage from "../components/hotelflow/SafeImage";
import {
  Search,
  MapPin,
  Users,
  CalendarDays,
  Wifi,
  Car,
  Coffee,
  BedDouble,
  ShieldCheck,
  Leaf,
  ChevronDown,
  CheckCircle2,
  Zap,
  Recycle,
  Plane,
  Building2,
  CarFront,
  Bus,
  TrainFront,
  Heart,
  ArrowRight,
  X,
  Info,
  SearchX,
  SlidersHorizontal,
  DollarSign,
  LayoutGrid,
} from "lucide-react";

const BRAND = "#5B5FC7";
const BRAND_DARK = "#4B4FB3";
const INK = "#1B1D2A";
const RATING_BG = "#1E2A5A";

const MOCK_HOTELS = [
  {
    id: "1",
    name: "Sea Pearl Beach Resort, Cox's Bazar",
    location: "Kolatoli, Cox's Bazar, Bangladesh",
    image:
      "/images/bd/hotels/hotel-sea-pearl.jpg",
    stayMeta: "1 night, 2 Adults",
    freeCancellation: true,
    noPrepayment: true,
    breakfastIncluded: true,
    isHotel: true,
    amenities: ["parking", "wifi", "kingBed", "breakfast"],
    rating: 8.6,
    ratingLabel: "Excellent",
    reviews: 1243,
    price: 8500,
    safety: true,
    sustainable: true,
  },
  {
    id: "2",
    name: "Green Valley Hotel, Sylhet",
    location: "Zindabazar, Sylhet, Bangladesh",
    image:
      "/images/bd/hotels/hotel-sylhet.jpg",
    stayMeta: "1 night, 2 Adults",
    freeCancellation: true,
    noPrepayment: true,
    breakfastIncluded: true,
    isHotel: true,
    amenities: ["parking", "wifi", "kingBed", "breakfast"],
    rating: 8.6,
    ratingLabel: "Excellent",
    reviews: 986,
    price: 6800,
    safety: true,
    sustainable: false,
  },
  {
    id: "3",
    name: "Padma Riverside Hotel, Rajshahi",
    location: "Shaheb Bazar, Rajshahi, Bangladesh",
    image:
      "/images/bd/hotels/hotel-rajshahi.jpg",
    stayMeta: "1 night, 2 Adults",
    freeCancellation: false,
    noPrepayment: true,
    breakfastIncluded: true,
    isHotel: true,
    amenities: ["wifi", "kingBed", "breakfast"],
    rating: 8.2,
    ratingLabel: "Very Good",
    reviews: 754,
    price: 12500,
    safety: true,
    sustainable: true,
  },
];

const AMENITY_META = {
  parking: { icon: Car, label: "Free Parking" },
  wifi: { icon: Wifi, label: "Free Internet" },
  kingBed: { icon: BedDouble, label: "King size bed" },
  breakfast: { icon: Coffee, label: "Free Breakfast" },
};

const NAV = [
  { label: "Flights", icon: Plane },
  { label: "Hotels", icon: Building2, active: true },
  { label: "Rent a car", icon: CarFront },
  { label: "Bus", icon: Bus },
  { label: "Train", icon: TrainFront },
];

const POPULAR_FILTERS = [
  { key: "freeCancellation", label: "Free cancellation", count: 312 },
  { key: "isHotel", label: "Hotels", count: 423 },
  { key: "noPrepayment", label: "No prepayment", count: 189 },
  { key: "breakfastIncluded", label: "Breakfast Included", count: 256 },
];

function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative h-[22px] w-[40px] shrink-0 rounded-full transition-colors duration-200"
      style={{ backgroundColor: checked ? BRAND : "#CBD2DC" }}
    >
      <span
        className="absolute top-[3px] h-4 w-4 rounded-full bg-white shadow transition-all duration-200"
        style={{ left: checked ? "21px" : "3px" }}
      />
    </button>
  );
}

function FilterRow({ label, count, checked, onChange }) {
  return (
    <label className="group flex cursor-pointer items-center justify-between py-[5px]">
      <span className="flex items-center gap-2.5">
        <span
          className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[4px] border transition"
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
        <span className="text-[13.5px] font-medium text-[#2B2E44] group-hover:text-black">
          {label}
        </span>
      </span>
      <span className="text-xs tabular-nums text-[#9AA0B4]">{count}</span>
    </label>
  );
}

export default function TripWisePage() {
  const [currency, setCurrency] = useState("BDT (৳)");
  const [layoutStyle, setLayoutStyle] = useState("Modern");
  const [location, setLocation] = useState("Cox's Bazar, Chattogram Division, Bangladesh");
  const [guests, setGuests] = useState("1 Room, 2 Adults");
  const [checkIn, setCheckIn] = useState("Sun, 08 Jan");
  const [checkOut, setCheckOut] = useState("Sun, 15 Jan");

  const [minBudget, setMinBudget] = useState(2000);
  const [maxBudget, setMaxBudget] = useState(20000);
  const [budgetEnabled, setBudgetEnabled] = useState(true);
  const [safetyOpen, setSafetyOpen] = useState(true);
  const [safetyOnly, setSafetyOnly] = useState(false);
  const [popular, setPopular] = useState({
    freeCancellation: false,
    isHotel: false,
    noPrepayment: false,
    breakfastIncluded: false,
  });
  const [sustainableOnly, setSustainableOnly] = useState(false);
  const [evOnly, setEvOnly] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [favorites, setFavorites] = useState(new Set(["2"]));
  const [mobileFilters, setMobileFilters] = useState(false);

  const toggleFav = (id) =>
    setFavorites((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const filtered = useMemo(() => {
    return MOCK_HOTELS.filter((h) => {
      if (budgetEnabled && (h.price < minBudget || h.price > maxBudget)) return false;
      if (safetyOnly && !h.safety) return false;
      if (sustainableOnly && !h.sustainable) return false;
      if (popular.freeCancellation && !h.freeCancellation) return false;
      if (popular.isHotel && !h.isHotel) return false;
      if (popular.noPrepayment && !h.noPrepayment) return false;
      if (popular.breakfastIncluded && !h.breakfastIncluded) return false;
      return true;
    });
  }, [minBudget, maxBudget, budgetEnabled, safetyOnly, sustainableOnly, popular]);

  const resetFilters = () => {
    setMinBudget(2000);
    setMaxBudget(20000);
    setBudgetEnabled(true);
    setSafetyOnly(false);
    setPopular({
      freeCancellation: false,
      isHotel: false,
      noPrepayment: false,
      breakfastIncluded: false,
    });
    setSustainableOnly(false);
    setEvOnly(false);
  };

  // Dual-slider fill percentages (track 50–300)
  const RANGE_MIN = 500;
  const RANGE_MAX = 50000;
  const fillLeft = ((minBudget - RANGE_MIN) / (RANGE_MAX - RANGE_MIN)) * 100;
  const fillRight = ((maxBudget - RANGE_MIN) / (RANGE_MAX - RANGE_MIN)) * 100;

  const sidebar = (
    <div className="rounded-[6px] border border-[#E3E6EF] bg-white p-5 shadow-[0_2px_12px_rgba(18,24,60,0.06)]">
      <h2 className="text-[16px] font-extrabold tracking-tight" style={{ color: INK }}>
        Filter Your Result
      </h2>

      {/* Budget */}
      <div className="mt-4 border-t border-[#EEF0F5] pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-bold" style={{ color: INK }}>
            Your budget (per night)
          </h3>
          <Toggle checked={budgetEnabled} onChange={setBudgetEnabled} />
        </div>
        <p className="mt-1.5 text-[13px] font-extrabold tabular-nums" style={{ color: BRAND }}>
          ৳{minBudget.toLocaleString("en-IN")} - ৳{maxBudget.toLocaleString("en-IN")}
        </p>
        <div className={budgetEnabled ? "" : "pointer-events-none opacity-40"}>
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
              value={minBudget}
              onChange={(e) => setMinBudget(Math.min(Number(e.target.value), maxBudget))}
              className="tripwise-range absolute -top-[7px] h-[19px] w-full cursor-pointer appearance-none bg-transparent"
              aria-label="Minimum budget"
            />
            <input
              type="range"
              min={RANGE_MIN}
              max={RANGE_MAX}
              value={maxBudget}
              onChange={(e) => setMaxBudget(Math.max(Number(e.target.value), minBudget))}
              className="tripwise-range absolute -top-[7px] h-[19px] w-full cursor-pointer appearance-none bg-transparent"
              aria-label="Maximum budget"
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] font-medium text-[#9AA0B4]">
            <span>৳500</span>
            <span>৳50,000+</span>
          </div>
        </div>
      </div>

      {/* Health & Safety accordion */}
      <div className="mt-4 border-t border-[#EEF0F5] pt-4">
        <button
          onClick={() => setSafetyOpen(!safetyOpen)}
          className="flex w-full items-center justify-between"
        >
          <span className="text-[13px] font-bold" style={{ color: INK }}>
            Health & Safety
          </span>
          <ChevronDown
            className={`h-4 w-4 text-[#9AA0B4] transition-transform duration-200 ${safetyOpen ? "rotate-180" : ""}`}
          />
        </button>
        {safetyOpen && (
          <div className="mt-1.5">
            <FilterRow
              label="Health & safety measures"
              count={423}
              checked={safetyOnly}
              onChange={setSafetyOnly}
            />
          </div>
        )}
      </div>

      {/* Popular */}
      <div className="mt-4 border-t border-[#EEF0F5] pt-4">
        <h3 className="text-[13px] font-bold" style={{ color: INK }}>
          Popular Filters
        </h3>
        <div className="mt-1.5">
          {POPULAR_FILTERS.map((f) => (
            <FilterRow
              key={f.key}
              label={f.label}
              count={f.count}
              checked={popular[f.key]}
              onChange={() =>
                setPopular((p) => ({ ...p, [f.key]: !p[f.key] }))
              }
            />
          ))}
        </div>
      </div>

      {/* Sustainability */}
      <div className="mt-4 border-t border-[#EEF0F5] pt-4">
        <h3 className="flex items-center gap-1.5 text-[13px] font-bold" style={{ color: INK }}>
          <Leaf className="h-4 w-4 text-emerald-600" /> Sustainability
        </h3>
        <div className="mt-1.5">
          <FilterRow
            label="Travel Sustainable"
            count={87}
            checked={sustainableOnly}
            onChange={setSustainableOnly}
          />
          <FilterRow
            label="EV charging station"
            count={32}
            checked={evOnly}
            onChange={setEvOnly}
          />
        </div>
        <div className="mt-2 flex items-center gap-1.5 rounded-[4px] bg-emerald-50 px-2.5 py-2 text-[11.5px] font-medium text-emerald-800">
          <Recycle className="h-3.5 w-3.5 shrink-0" />
          Certified eco stays only
        </div>
        <button
          onClick={resetFilters}
          className="mt-4 w-full rounded-[4px] py-2.5 text-[13px] font-bold text-white transition hover:brightness-110 active:scale-[0.98]"
          style={{ backgroundColor: BRAND }}
        >
          Clear all filters
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F2F7] font-sans text-slate-900 antialiased">
      <style>{`
        .tripwise-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 9999px;
          background: #fff;
          border: 2px solid ${BRAND};
          box-shadow: 0 1px 4px rgba(20,25,70,.25);
          cursor: pointer;
          pointer-events: auto;
          position: relative;
          z-index: 2;
        }
        .tripwise-range::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 9999px;
          background: #fff;
          border: 2px solid ${BRAND};
          box-shadow: 0 1px 4px rgba(20,25,70,.25);
          cursor: pointer;
          pointer-events: auto;
        }
        .tripwise-range::-webkit-slider-runnable-track { background: transparent; }
        .tripwise-range::-moz-range-track { background: transparent; }
        .tripwise-range { pointer-events: none; }
      `}</style>

      {/* ================= HEADER ================= */}
      <header className="text-white" style={{ backgroundColor: BRAND }}>
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <div className="flex h-[64px] items-center justify-between gap-4">
            <Link href="/tripwise" className="flex shrink-0 items-center gap-2">
              <span
                className="grid h-8 w-8 place-items-center rounded-[6px] bg-white text-[17px] font-black"
                style={{ color: BRAND }}
              >
                T
              </span>
              <span className="text-[17px] font-extrabold tracking-[0.08em]">
                TRIPWISE
              </span>
            </Link>

            <nav className="hidden items-center gap-7 text-[14px] font-medium text-white/85 lg:flex">
              {NAV.map(({ label, icon: Icon, active }) => (
                <a
                  key={label}
                  href="#results"
                  className={`relative flex items-center gap-1.5 py-1 transition hover:text-white ${
                    active ? "font-semibold text-white" : ""
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={2.2} />
                  {label}
                  {active && (
                    <span className="absolute -bottom-[3px] left-0 right-0 h-[2px] rounded-full bg-white" />
                  )}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2.5">
              <button
                aria-label="Search"
                className="grid h-9 w-9 place-items-center rounded-full bg-white/15 transition hover:bg-white/25"
              >
                <Search className="h-[17px] w-[17px]" />
              </button>
              {/* Avatar with initial (no stock people photos) */}
              <span
                aria-label="Sean"
                className="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-sm font-black text-white ring-2 ring-white/70"
              >
                S
              </span>
              <button className="hidden items-center gap-1 text-[14px] font-semibold sm:flex">
                Sean <ChevronDown className="h-4 w-4 opacity-80" />
              </button>
            </div>
          </div>

          {/* Mobile nav scroll */}
          <nav className="flex gap-5 overflow-x-auto pb-3 text-[13px] font-medium text-white/85 lg:hidden">
            {NAV.map(({ label, icon: Icon, active }) => (
              <a
                key={label}
                href="#results"
                className={`flex shrink-0 items-center gap-1.5 ${active ? "font-semibold text-white" : ""}`}
              >
                <Icon className="h-4 w-4" /> {label}
              </a>
            ))}
          </nav>
        </div>
        {/* spacer so floating card overlaps */}
        <div className="h-[52px]" />
      </header>

      {/* ================= FLOATING SEARCH CARD ================= */}
      <div className="relative z-20 mx-auto -mt-[52px] max-w-[1280px] px-4 sm:px-6">
        <div className="flex flex-col gap-2 rounded-[8px] border border-[#E3E6EF] bg-white p-2 shadow-[0_14px_36px_rgba(30,35,110,0.18)] xl:flex-row xl:items-stretch">
          <div className="flex flex-col gap-2 sm:flex-row xl:shrink-0">
            <label className="flex min-w-[148px] flex-1 cursor-pointer items-center gap-2 rounded-[4px] border border-[#D9DDE8] bg-white px-3 py-[9px] transition focus-within:border-[#5B5FC7] xl:flex-none">
              <DollarSign className="h-4 w-4 shrink-0 text-[#9AA0B4]" />
              <span className="flex w-full flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wide text-[#9AA0B4]">
                  Currency
                </span>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="mt-0.5 w-full cursor-pointer bg-transparent text-[13px] font-semibold outline-none"
                  style={{ color: INK }}
                >
                  <option>BDT (৳)</option>
                  <option>USD ($)</option>
                  <option>INR (₹)</option>
                </select>
              </span>
            </label>
            <label className="flex min-w-[128px] flex-1 cursor-pointer items-center gap-2 rounded-[4px] border border-[#D9DDE8] bg-white px-3 py-[9px] transition focus-within:border-[#5B5FC7] xl:flex-none">
              <LayoutGrid className="h-4 w-4 shrink-0 text-[#9AA0B4]" />
              <span className="flex w-full flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wide text-[#9AA0B4]">
                  Layout
                </span>
                <select
                  value={layoutStyle}
                  onChange={(e) => setLayoutStyle(e.target.value)}
                  className="mt-0.5 w-full cursor-pointer bg-transparent text-[13px] font-semibold outline-none"
                  style={{ color: INK }}
                >
                  <option>Modern</option>
                  <option>Classic</option>
                  <option>Minimal</option>
                </select>
              </span>
            </label>
          </div>

          <label className="flex min-w-0 flex-[1.4] cursor-text items-center gap-2.5 rounded-[4px] border border-[#D9DDE8] bg-white px-3 py-[9px] transition focus-within:border-[#5B5FC7]">
            <MapPin className="h-5 w-5 shrink-0" style={{ color: BRAND }} />
            <span className="flex w-full min-w-0 flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wide text-[#9AA0B4]">
                Location
              </span>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-0.5 w-full bg-transparent text-[13px] font-semibold outline-none"
                style={{ color: INK }}
              />
            </span>
          </label>

          <label className="flex min-w-0 flex-1 cursor-text items-center gap-2.5 rounded-[4px] border border-[#D9DDE8] bg-white px-3 py-[9px] transition focus-within:border-[#5B5FC7]">
            <Users className="h-5 w-5 shrink-0 text-[#9AA0B4]" />
            <span className="flex w-full min-w-0 flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wide text-[#9AA0B4]">
                Guests
              </span>
              <input
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="mt-0.5 w-full bg-transparent text-[13px] font-semibold outline-none"
                style={{ color: INK }}
              />
            </span>
          </label>

          <label className="flex min-w-0 flex-1 cursor-text items-center gap-2.5 rounded-[4px] border border-[#D9DDE8] bg-white px-3 py-[9px] transition focus-within:border-[#5B5FC7]">
            <CalendarDays className="h-5 w-5 shrink-0 text-[#9AA0B4]" />
            <span className="flex w-full min-w-0 flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wide text-[#9AA0B4]">
                Check-in Date
              </span>
              <input
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="mt-0.5 w-full bg-transparent text-[13px] font-semibold outline-none"
                style={{ color: INK }}
              />
            </span>
          </label>

          <div className="flex gap-2">
            <label className="flex min-w-0 flex-1 cursor-text items-center gap-2.5 rounded-[4px] border border-[#D9DDE8] bg-white px-3 py-[9px] transition focus-within:border-[#5B5FC7]">
              <CalendarDays className="h-5 w-5 shrink-0 text-[#9AA0B4]" />
              <span className="flex w-full min-w-0 flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wide text-[#9AA0B4]">
                  Check-out Date
                </span>
                <input
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="mt-0.5 w-full bg-transparent text-[13px] font-semibold outline-none"
                  style={{ color: INK }}
                />
              </span>
            </label>
            <button
              className="shrink-0 rounded-[4px] px-6 text-[14px] font-bold text-white transition hover:brightness-110 active:scale-95"
              style={{ backgroundColor: BRAND }}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* ================= MAIN ================= */}
      <main
        id="results"
        className="mx-auto grid max-w-[1280px] grid-cols-1 gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[272px_minmax(0,1fr)]"
      >
        {/* Sidebar — desktop */}
        <aside className="hidden lg:block">
          <div className="sticky top-4">{sidebar}</div>
        </aside>

        {/* Sidebar — mobile collapsible */}
        <div className="lg:hidden">
          <button
            onClick={() => setMobileFilters(!mobileFilters)}
            className="flex w-full items-center justify-between rounded-[6px] border border-[#E3E6EF] bg-white px-4 py-3 text-[14px] font-bold shadow-sm"
            style={{ color: INK }}
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" style={{ color: BRAND }} />
              Filter Your Result
            </span>
            <ChevronDown
              className={`h-4 w-4 text-slate-400 transition-transform ${mobileFilters ? "rotate-180" : ""}`}
            />
          </button>
          {mobileFilters && <div className="mt-3">{sidebar}</div>}
        </div>

        {/* Results */}
        <section className="min-w-0">
          {bannerVisible && (
            <div className="mb-4 flex items-start gap-2.5 rounded-[4px] border border-[#F0D48A] bg-[#FFF8E6] px-4 py-3 text-[13px] shadow-[0_1px_4px_rgba(150,110,0,0.08)]">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#B7791F]" />
              <p className="flex-1 font-medium leading-snug text-[#7A5A16]">
                Based on your filters, 97% of places to stay are unavailable on
                our site.
              </p>
              <button
                aria-label="Dismiss notification"
                onClick={() => setBannerVisible(false)}
                className="rounded p-0.5 text-[#7A5A16] transition hover:bg-[#F0D48A]/40"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <p className="mb-3 text-[13px] text-[#6B7089]">
            <span className="font-extrabold" style={{ color: INK }}>
              {filtered.length} properties
            </span>{" "}
            found • {location}
          </p>

          <div className="space-y-4">
            {filtered.map((hotel) => (
              <article
                key={hotel.id}
                className="flex flex-col overflow-hidden rounded-[6px] border border-[#E3E6EF] bg-white shadow-[0_2px_14px_rgba(18,24,60,0.07)] transition hover:shadow-[0_10px_30px_rgba(45,50,140,0.14)] sm:flex-row"
              >
                {/* Image */}
                <div className="relative h-52 shrink-0 overflow-hidden bg-slate-100 sm:h-auto sm:min-h-[228px] sm:w-[248px]">
                  <SafeImage
                    src={hotel.image}
                    alt={`${hotel.name}, Bangladesh`}
                    fill
                    sizes="(max-width: 640px) 100vw, 248px"
                    className="h-full w-full object-cover"
                  />
                  <button
                    aria-label="Save to favorites"
                    onClick={() => toggleFav(hotel.id)}
                    className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-white/95 shadow-md transition hover:scale-105 active:scale-95"
                  >
                    <Heart
                      className={`h-4 w-4 ${favorites.has(hotel.id) ? "fill-red-500 text-red-500" : "text-[#5A5F79]"}`}
                    />
                  </button>
                  {hotel.sustainable && (
                    <span className="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-[4px] bg-white/95 px-2 py-1 text-[11px] font-bold text-emerald-700 shadow">
                      <Leaf className="h-3 w-3" /> Sustainable
                    </span>
                  )}
                </div>

                {/* Middle */}
                <div className="min-w-0 flex-1 p-4">
                  <h3
                    className="text-[15px] font-extrabold leading-snug tracking-tight"
                    style={{ color: INK }}
                  >
                    {hotel.name}
                  </h3>
                  <p className="mt-1 text-[12px] text-[#6B7089]">
                    {hotel.location} •{" "}
                    <a
                      href="#map"
                      className="font-bold hover:underline"
                      style={{ color: BRAND }}
                    >
                      Show on map
                    </a>
                  </p>
                  <p className="mt-2.5 text-[12px] font-medium text-[#6B7089]">
                    {hotel.stayMeta}
                  </p>
                  <div className="mt-1 space-y-[3px] text-[12.5px]">
                    {hotel.freeCancellation ? (
                      <p className="flex items-center gap-1 font-semibold text-emerald-600">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Free cancellation
                      </p>
                    ) : (
                      <p className="font-medium text-[#E11D48]">
                        Non-refundable rate
                      </p>
                    )}
                    {hotel.noPrepayment && (
                      <p className="font-medium text-emerald-600">
                        No prepayment needed
                      </p>
                    )}
                    {hotel.breakfastIncluded && (
                      <p className="font-medium text-[#2B2E44]">
                        Breakfast included
                      </p>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {hotel.amenities.map((key) => {
                      const A = AMENITY_META[key];
                      if (!A) return null;
                      const Icon = A.icon;
                      return (
                        <span
                          key={key}
                          className="inline-flex items-center gap-1.5 rounded-[4px] border border-[#E3E6EF] bg-[#F7F8FB] px-2 py-[5px] text-[11.5px] font-semibold text-[#3D4159]"
                        >
                          <Icon
                            className="h-3.5 w-3.5"
                            style={{ color: BRAND }}
                          />
                          {A.label}
                        </span>
                      );
                    })}
                  </div>
                  <p className="mt-2.5 flex items-center gap-1 text-[11.5px] font-medium text-[#6B7089]">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Health & safety measures in place
                  </p>
                </div>

                {/* Right rail */}
                <div className="flex shrink-0 flex-row items-center justify-between gap-3 border-t border-[#EEF0F5] bg-[#FAFBFE] p-4 sm:w-[212px] sm:flex-col sm:items-stretch sm:justify-between sm:border-l sm:border-t-0 sm:text-right">
                  <div className="flex items-center gap-2 sm:justify-end">
                    <div className="sm:text-right">
                      <p
                        className="text-[12.5px] font-bold leading-none"
                        style={{ color: INK }}
                      >
                        {hotel.ratingLabel}
                      </p>
                      <p className="mt-1 text-[11px] text-[#6B7089]">
                        {hotel.reviews.toLocaleString()} reviews
                      </p>
                    </div>
                    <span
                      className="rounded-[6px] rounded-tr-none px-[9px] py-[7px] text-[14px] font-extrabold tabular-nums text-white"
                      style={{ backgroundColor: RATING_BG }}
                    >
                      {hotel.rating.toFixed(1)}
                    </span>
                  </div>
                  <div className="sm:text-right">
                    <p className="hidden text-[11px] text-[#6B7089] sm:block">
                      1 night, 2 adults
                    </p>
                    <p
                      className="mt-0.5 text-[21px] font-black tracking-tight tabular-nums"
                      style={{ color: INK }}
                    >
                      ৳{hotel.price.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[11px] text-[#9AA0B4]">
                      Includes 15% VAT & service charge
                    </p>
                    <Link
                      href="/rooms"
                      className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-[4px] px-4 py-[10px] text-center text-[13.5px] font-bold text-white transition hover:brightness-110 active:scale-[0.98]"
                      style={{ backgroundColor: BRAND }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = BRAND_DARK)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = BRAND)
                      }
                    >
                      See availability <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}

            {filtered.length === 0 && (
              <div className="rounded-[6px] border border-[#E3E6EF] bg-white p-12 text-center shadow-sm">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#F1F2F7]">
                  <SearchX className="h-6 w-6 text-[#9AA0B4]" />
                </span>
                <h3
                  className="mt-4 font-extrabold"
                  style={{ color: INK }}
                >
                  No stays match your filters
                </h3>
                <p className="mt-1 text-[13px] text-[#6B7089]">
                  Try widening your ৳{minBudget.toLocaleString("en-IN")} - ৳{maxBudget.toLocaleString("en-IN")} budget.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-4 rounded-[4px] px-5 py-2.5 text-[13px] font-bold text-white"
                  style={{ backgroundColor: BRAND }}
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-[11.5px] text-[#9AA0B4]">
            Prices include taxes and fees • Free cancellation on most stays •
            Secure booking with TripWise
          </p>
        </section>
      </main>
    </div>
  );
}
