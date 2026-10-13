"use client";

// ---------------------------------------------------------------------------
// HotelFlow Rooms page (/rooms) — lists ALL hotel rooms.
// Data: backend first (GET /api/rooms), dummy rooms as fallback.
// Search bar + sticky sidebar filter live (client-side); sort, wishlist,
// validation (check-out after check-in), skeletons, empty state, load more.
// ---------------------------------------------------------------------------

import { useState, useEffect, useMemo } from "react";
import {
  CalendarDays,
  Users,
  Info,
  X,
  ChevronDown,
  SlidersHorizontal,
  Armchair,
} from "lucide-react";
import Navbar from "../components/hotelflow/Navbar";
import Footer from "../components/hotelflow/Footer";
import RoomCard, { RoomCardSkeleton } from "../components/hotelflow/RoomCard";
import RoomFilters, {
  DEFAULT_ROOM_FILTERS,
  RoomFilterDrawer,
} from "../components/hotelflow/RoomFilters";
import {
  DUMMY_ROOMS,
  ROOM_SORT_OPTIONS,
  normalizeRoom,
} from "../components/hotelflow/roomsData";
import { BRAND, PAGE_BG } from "../components/hotelflow/data";
import { getApiUrl } from "../../lib/apiUrl";

const PAGE_SIZE = 6;
const LABEL = "text-[10px] font-bold uppercase tracking-wide text-[#9AA0B4]";
const BOX =
  "flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-[#D9DDE8] bg-white px-3 py-2.5 transition focus-within:border-[#5B5BE6] focus-within:ring-2 focus-within:ring-[#5B5BE6]/15";
const INPUT =
  "mt-0.5 w-full bg-transparent text-[13px] font-semibold text-[#1B1D2A] outline-none";

const INITIAL_SEARCH = {
  checkIn: "",
  checkOut: "",
  type: "All Types",
  guests: "2",
  minPrice: "",
  maxPrice: "",
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [usingFallback, setUsingFallback] = useState(false);
  const [search, setSearch] = useState(INITIAL_SEARCH);
  const [filters, setFilters] = useState(DEFAULT_ROOM_FILTERS);
  const [sort, setSort] = useState("recommended");
  const [initialLoading, setInitialLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [bannerVisible, setBannerVisible] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Backend first, dummy data as fallback so the page always renders.
  // When dates are set they ride along, so the server annotates each room
  // with date-aware availability (remainingRooms / availableForDates).
  const loadRooms = async (dates, done) => {
    try {
      const qs =
        dates?.checkIn && dates?.checkOut
          ? `?checkIn=${dates.checkIn}&checkOut=${dates.checkOut}`
          : "";
      const res = await fetch(getApiUrl(`/api/rooms${qs}`), { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list = (data.data || []).map(normalizeRoom);
      if (list.length) {
        setRooms(list);
        setUsingFallback(false);
      } else {
        setRooms(DUMMY_ROOMS);
        setUsingFallback(true);
      }
    } catch {
      setRooms(DUMMY_ROOMS);
      setUsingFallback(true);
    } finally {
      done?.();
    }
  };

  useEffect(() => {
    let cancelled = false;
    loadRooms(null, () => {
      if (!cancelled) setInitialLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setS = (key) => (e) => setSearch((s) => ({ ...s, [key]: e.target.value }));
  const setF = (patch) => {
    setFilters((f) => ({ ...f, ...patch }));
    setVisibleCount(PAGE_SIZE);
  };
  const toggleFav = (id) =>
    setFavorites((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  // Check-out must be after check-in; then merge search into live filters.
  const handleSearch = () => {
    if (search.checkIn && search.checkOut && search.checkOut <= search.checkIn) {
      setError("Check-out date must be after the check-in date.");
      return;
    }
    setError("");
    setSearching(true);
    // Re-query with the new dates so availability badges reflect them.
    loadRooms(
      { checkIn: search.checkIn, checkOut: search.checkOut },
      () => setSearching(false)
    );
    setFilters((f) => ({
      ...f,
      types: search.type === "All Types" ? [] : [search.type.replace("All Types", "").trim()].filter(Boolean),
      minPrice: search.minPrice !== "" ? Number(search.minPrice) : f.minPrice,
      maxPrice: search.maxPrice !== "" ? Number(search.maxPrice) : f.maxPrice,
    }));
    setVisibleCount(PAGE_SIZE);
    document.getElementById("room-results")?.scrollIntoView({ behavior: "smooth" });
  };

  const filtered = useMemo(() => {
    const guests = Number(search.guests) || 0;
    const list = rooms.filter((r) => {
      if (r.price < filters.minPrice || r.price > filters.maxPrice) return false;
      if (filters.types.length && !filters.types.includes(r.type)) return false;
      if (guests > 0 && r.capacity < guests) return false;
      if (filters.amenities.length && !filters.amenities.every((a) => r.amenities[a])) return false;
      if (filters.bedTypes.length && !filters.bedTypes.includes(r.bedType)) return false;
      if (filters.availableOnly && !r.available) return false;
      return true;
    });
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (sort === "rating-desc") list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [rooms, filters, sort, search.guests]);

  const visible = filtered.slice(0, visibleCount);
  const resetAll = () => {
    setSearch(INITIAL_SEARCH);
    setFilters(DEFAULT_ROOM_FILTERS);
    setError("");
    setVisibleCount(PAGE_SIZE);
  };

  const sidebar = (
    <RoomFilters
      rooms={rooms}
      filters={filters}
      onChange={(f) => {
        setFilters(f);
        setVisibleCount(PAGE_SIZE);
      }}
      totalCount={filtered.length}
    />
  );

  return (
    <div className="min-h-screen font-sans text-slate-900" style={{ backgroundColor: PAGE_BG }}>
      <Navbar />
      <div className="mx-auto max-w-[1280px] px-4 pt-6 sm:px-6">
        <h1 className="text-xl font-extrabold tracking-tight text-[#1B1D2A] sm:text-2xl">
          Our Rooms
        </h1>
        <p className="mt-1 text-[13px] text-[#6B7089]">
          Choose from our wide range of comfortable rooms and suites. Showing {filtered.length}{" "}
          {filtered.length === 1 ? "room" : "rooms"}
          {usingFallback ? " (sample listings)" : ""}.
        </p>

        {/* Search / filter bar */}
        <div className="mt-4 rounded-2xl border border-[#E3E6EF] bg-white p-2.5 shadow-[0_14px_36px_rgba(30,35,110,0.16)] sm:p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex flex-col gap-2"
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <label className={BOX}>
                <CalendarDays className="h-5 w-5 shrink-0 text-[#9AA0B4]" />
                <span className="flex w-full min-w-0 flex-col">
                  <span className={LABEL}>Check-in date</span>
                  <input type="date" value={search.checkIn} onChange={setS("checkIn")} className={INPUT} />
                </span>
              </label>
              <label className={BOX}>
                <CalendarDays className="h-5 w-5 shrink-0 text-[#9AA0B4]" />
                <span className="flex w-full min-w-0 flex-col">
                  <span className={LABEL}>Check-out date</span>
                  <input type="date" value={search.checkOut} onChange={setS("checkOut")} className={INPUT} />
                </span>
              </label>
              <label className={BOX}>
                <Armchair className="h-5 w-5 shrink-0 text-[#9AA0B4]" />
                <span className="flex w-full min-w-0 flex-col">
                  <span className={LABEL}>Room type</span>
                  <select value={search.type} onChange={setS("type")} className={`${INPUT} cursor-pointer`}>
                    {["All Types", "Single", "Double", "Deluxe", "Suite", "Family"].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </span>
              </label>
              <label className={BOX}>
                <Users className="h-5 w-5 shrink-0 text-[#9AA0B4]" />
                <span className="flex w-full min-w-0 flex-col">
                  <span className={LABEL}>Guests</span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={search.guests}
                    onChange={setS("guests")}
                    className={INPUT}
                  />
                </span>
              </label>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="flex flex-1 gap-2">
                <label className={BOX}>
                  <span className="flex w-full min-w-0 flex-col">
                    <span className={LABEL}>Min price</span>
                    <input
                      type="number"
                      min={0}
                      value={search.minPrice}
                      onChange={setS("minPrice")}
                      placeholder="৳0"
                      className={`${INPUT} placeholder:text-[#B6BBCB]`}
                    />
                  </span>
                </label>
                <label className={BOX}>
                  <span className="flex w-full min-w-0 flex-col">
                    <span className={LABEL}>Max price</span>
                    <input
                      type="number"
                      min={0}
                      value={search.maxPrice}
                      onChange={setS("maxPrice")}
                      placeholder="৳20,000"
                      className={`${INPUT} placeholder:text-[#B6BBCB]`}
                    />
                  </span>
                </label>
              </div>
              <button
                type="submit"
                disabled={searching}
                className="shrink-0 rounded-xl px-8 py-3 text-sm font-bold text-white transition hover:brightness-110 active:scale-95 disabled:opacity-60"
                style={{ backgroundColor: BRAND }}
              >
                {searching ? "Searching…" : "Search"}
              </button>
            </div>
            {error && <p className="text-[12.5px] font-bold text-red-600">{error}</p>}
          </form>
        </div>

        {/* Two-column layout */}
        <main id="room-results" className="grid scroll-mt-20 grid-cols-1 gap-5 py-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-20">{sidebar}</div>
          </aside>
          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex w-full items-center justify-between rounded-2xl border border-[#E3E6EF] bg-white px-4 py-3 text-sm font-bold text-[#1B1D2A] shadow-sm"
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" style={{ color: BRAND }} />
                Filters ({filtered.length})
              </span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>
          </div>

          <section className="min-w-0">
            {bannerVisible && (
              <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-[#E3E6EF] bg-[#EEF0F5] px-4 py-3 text-[13px] shadow-sm">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#5A5F79]" />
                <p className="flex-1 font-medium text-[#3D4159]">
                  Based on your filters, we&apos;re showing available rooms only when that filter is on.
                </p>
                <button
                  type="button"
                  aria-label="Dismiss notice"
                  onClick={() => setBannerVisible(false)}
                  className="rounded p-0.5 text-[#5A5F79] hover:bg-black/5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[13px] text-[#6B7089]">
                <span className="font-extrabold text-[#1B1D2A]">Showing {visible.length} of {filtered.length} rooms</span>
              </p>
              <label className="flex items-center gap-2 rounded-xl border border-[#E3E6EF] bg-white px-3 py-2 text-[12.5px] font-semibold shadow-sm">
                <span className="text-[#9AA0B4]">Sort by:</span>
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setVisibleCount(PAGE_SIZE);
                  }}
                  className="cursor-pointer bg-transparent font-bold text-[#1B1D2A] outline-none"
                >
                  {ROOM_SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="space-y-4">
              {initialLoading || searching ? (
                <>
                  <RoomCardSkeleton />
                  <RoomCardSkeleton />
                  <RoomCardSkeleton />
                </>
              ) : visible.length ? (
                visible.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    isFavorite={favorites.has(room.id)}
                    onToggleFavorite={() => toggleFav(room.id)}
                    checkIn={search.checkIn}
                    checkOut={search.checkOut}
                    guests={search.guests}
                  />
                ))
              ) : (
                <div className="rounded-2xl border border-[#E3E6EF] bg-white p-12 text-center shadow-sm">
                  <h3 className="font-extrabold text-[#1B1D2A]">
                    No rooms found. Try changing your filters.
                  </h3>
                  <p className="mt-1 text-[13px] text-[#6B7089]">
                    Try widening your budget or removing some filters.
                  </p>
                  <button
                    type="button"
                    onClick={resetAll}
                    className="mt-4 rounded-xl px-5 py-2.5 text-[13px] font-bold text-white"
                    style={{ backgroundColor: BRAND }}
                  >
                    Reset all filters
                  </button>
                </div>
              )}
            </div>

            {!initialLoading && !searching && visibleCount < filtered.length && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  className="rounded-xl border-2 px-8 py-3 text-sm font-bold transition hover:text-white active:scale-95"
                  style={{ borderColor: BRAND, color: BRAND }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = BRAND;
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = BRAND;
                  }}
                >
                  Load more rooms ({filtered.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </section>
        </main>
      </div>
      <Footer />

      <RoomFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onClear={() => setF(DEFAULT_ROOM_FILTERS)}
      >
        {sidebar}
      </RoomFilterDrawer>
    </div>
  );
}
