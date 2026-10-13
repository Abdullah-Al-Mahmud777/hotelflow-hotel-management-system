"use client";

// ---------------------------------------------------------------------------
// HotelFlow home page — Tripwise/Booking-style comparison layout:
// sticky purple Navbar / hero + overlapping SearchBar / Popular Destinations /
// two-column results (FilterSidebar + HotelCards with sort + pagination) /
// Featured Hotels / Why Book With HotelFlow / Footer.
// ---------------------------------------------------------------------------

import { useEffect, useMemo, useState } from "react";
import {
  X,
  Info,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  SearchX,
  BadgeDollarSign,
  ShieldCheck,
  Lock,
  Headset,
  MapPin,
  Star,
} from "lucide-react";
import Navbar from "./components/hotelflow/Navbar";
import SearchBar from "./components/hotelflow/SearchBar";
import FilterSidebar, {
  DEFAULT_FILTERS,
} from "./components/hotelflow/FilterSidebar";
import HotelCard, {
  HotelCardSkeleton,
} from "./components/hotelflow/HotelCard";
import Footer from "./components/hotelflow/Footer";
import {
  HOTELS,
  DESTINATIONS,
  SORT_OPTIONS,
  BRAND,
  PAGE_BG,
} from "./components/hotelflow/data";
import { HERO_IMAGES, DESTINATION_IMAGES } from "./components/hotelflow/images";
import SafeImage from "./components/hotelflow/SafeImage";

const PAGE_SIZE = 5;

const INITIAL_SEARCH = {
  currency: "BDT",
  mode: "Standard",
  destination: "Cox's Bazar, Chattogram Division, Bangladesh",
  guests: "1 Room, 2 Adults",
  checkIn: "",
  checkOut: "",
  roomType: "all",
  minPrice: "",
  maxPrice: "",
};

// Guest stories from Bangladeshi travelers (static showcase).
const TESTIMONIALS = [
  {
    name: "Rahim Uddin",
    city: "Dhaka",
    hotel: "Sea Pearl Beach Resort, Cox's Bazar",
    rating: 5,
    text: "Booked in two minutes with bKash and paid the rest at the hotel. The sea-view room was exactly as pictured.",
  },
  {
    name: "Nusrat Jahan",
    city: "Chattogram",
    hotel: "Tea Garden Resort, Srimangal",
    rating: 5,
    text: "Free cancellation saved our trip when our launch got delayed. Rebooked for the next weekend with no charge.",
  },
  {
    name: "Tanvir Ahmed",
    city: "Sylhet",
    hotel: "Hill View Resort, Sajek Valley",
    rating: 4,
    text: "Woke up above the clouds in Sajek. Support helped us arrange a Chander Gari over the phone at night.",
  },
];

function applyFilters(hotels, search, filters) {
  const dest = search.destination.trim().toLowerCase();
  return hotels.filter((h) => {
    // Destination match (city, state or country fragment)
    if (dest && !h.location.toLowerCase().includes(dest.split(",")[0].trim()) &&
        !dest.includes(h.destination) && !h.destination.includes(dest.split(" ")[0])) {
      // Fall back to loose match: any word overlap
      const words = dest.split(/[\s,]+/).filter((w) => w.length > 2);
      const loc = h.location.toLowerCase();
      if (words.length > 0 && !words.some((w) => loc.includes(w))) return false;
    }
    // Price from search panel (advanced) + sidebar budget
    const minP = search.minPrice !== "" ? Number(search.minPrice) : -Infinity;
    const maxP = search.maxPrice !== "" ? Number(search.maxPrice) : Infinity;
    if (h.price < minP || h.price > maxP) return false;
    if (filters.budgetEnabled && (h.price < filters.minBudget || h.price > filters.maxBudget))
      return false;
    if (search.roomType !== "all" && h.roomType !== search.roomType) return false;
    if (filters.healthSafety && !h.healthSafety) return false;
    if (filters.freeCancellation && !h.freeCancellation) return false;
    if (filters.isHotel && !h.isHotel) return false;
    if (filters.noPrepayment && !h.noPrepayment) return false;
    if (filters.breakfast && !h.breakfastIncluded) return false;
    if (filters.wifi && !h.wifi) return false;
    if (filters.parking && !h.parking) return false;
    if (filters.pool && !h.pool) return false;
    if (filters.gym && !h.gym) return false;
    if (filters.stars.length > 0 && !filters.stars.includes(h.starRating)) return false;
    if (filters.guestRating !== "any" && h.rating < Number(filters.guestRating)) return false;
    if (filters.roomTypes.length > 0 && !filters.roomTypes.includes(h.roomType)) return false;
    return true;
  });
}

function sortHotels(hotels, sort) {
  const list = [...hotels];
  if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
  else if (sort === "rating-desc") list.sort((a, b) => b.rating - a.rating);
  return list;
}

export default function Home() {
  const [search, setSearch] = useState(INITIAL_SEARCH);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort, setSort] = useState("recommended");
  const [loading, setLoading] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [favorites, setFavorites] = useState(new Set(["h2"]));
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [mobileFilters, setMobileFilters] = useState(false);

  // Hero slider: 3 Bangladesh scenes, auto-play every 5s.
  const [heroSlide, setHeroSlide] = useState(0);
  const nextSlide = () => setHeroSlide((i) => (i + 1) % HERO_IMAGES.length);
  const prevSlide = () => setHeroSlide((i) => (i - 1 + HERO_IMAGES.length) % HERO_IMAGES.length);
  useEffect(() => {
    const t = setInterval(nextSlide, 5000);
    return () => clearInterval(t);
  }, []);

  const toggleFavorite = (id) =>
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // Simulate fetch so skeletons are visible on every search.
  const handleSearch = () => {
    setLoading(true);
    setVisibleCount(PAGE_SIZE);
    setTimeout(() => setLoading(false), 650);
    document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
  };

  const filtered = useMemo(
    () => sortHotels(applyFilters(HOTELS, search, filters), sort),
    [search, filters, sort]
  );
  const visible = filtered.slice(0, visibleCount);
  const featured = useMemo(() => sortHotels(HOTELS, "rating-desc").slice(0, 3), []);

  const sidebar = (
    <FilterSidebar filters={filters} onChange={(f) => { setFilters(f); setVisibleCount(PAGE_SIZE); }} totalCount={filtered.length} />
  );

  return (
    <div className="min-h-screen font-sans text-slate-900" style={{ backgroundColor: PAGE_BG }}>
      <Navbar />

      {/* ================= HERO SLIDER (Bangladesh scenes, 5s autoplay) ================= */}
      <section className="relative overflow-hidden bg-slate-900" aria-roledescription="carousel" aria-label="Bangladesh destinations">
        {HERO_IMAGES.map((img, i) => (
          <div
            key={img.src}
            aria-hidden={i !== heroSlide}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === heroSlide ? "opacity-100" : "opacity-0"}`}
          >
            <SafeImage
              src={img.src}
              alt={img.alt}
              fill
              priority={i === 0}
              sizes="100vw"
              className="h-full w-full object-cover"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2b2d6e]/70 via-[#2b2d6e]/55 to-black/60" />
        {/* Arrows */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white transition hover:bg-black/55"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white transition hover:bg-black/55"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <div className="relative mx-auto max-w-[1280px] px-4 pb-28 pt-14 text-center sm:px-6 sm:pb-32 sm:pt-20">
          <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-lg sm:text-5xl md:text-6xl">
            Find Your Perfect Stay in Bangladesh
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm font-medium text-white/90 sm:text-lg">
            Book hotels, resorts and rooms across Bangladesh, from
            Cox&apos;s Bazar beaches to Sylhet tea gardens.
          </p>
          {/* Dots */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {HERO_IMAGES.map((img, i) => (
              <button
                key={img.src}
                type="button"
                onClick={() => setHeroSlide(i)}
                aria-label={`Go to slide ${i + 1}: ${img.alt}`}
                className={`h-2 rounded-full transition-all ${
                  i === heroSlide ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Search panel overlapping hero */}
      <div className="relative z-20 mx-auto -mt-20 max-w-[1280px] px-4 sm:-mt-24 sm:px-6">
        <SearchBar value={search} onChange={setSearch} onSearch={handleSearch} loading={loading} />
      </div>

      {/* ================= POPULAR DESTINATIONS ================= */}
      <section className="mx-auto max-w-[1280px] px-4 pt-10 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-[#1B1D2A] sm:text-2xl">
              Popular Destinations
            </h2>
            <p className="mt-1 text-[13px] text-[#6B7089]">
              Trending places travelers love right now.
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {DESTINATIONS.map((d) => (
            <button
              key={d.name}
              type="button"
              onClick={() => {
                setSearch((s) => ({ ...s, destination: `${d.name}, ${d.country}` }));
                handleSearch();
              }}
              className="group relative h-40 overflow-hidden rounded-2xl text-left shadow-[0_2px_12px_rgba(18,24,60,0.10)] sm:h-52"
            >
              <SafeImage
                src={d.image}
                alt={DESTINATION_IMAGES[d.name]?.alt || `${d.name}, Bangladesh`}
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <span className="absolute bottom-3 left-3 right-3">
                <span className="block text-[15px] font-extrabold text-white">{d.name}</span>
                <span className="mt-0.5 flex items-center gap-1 text-[12px] font-medium text-white/80">
                  <MapPin className="h-3.5 w-3.5" />
                  {d.properties.toLocaleString()} properties
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ================= RESULTS (two columns) ================= */}
      <main
        id="results"
        className="mx-auto grid max-w-[1280px] scroll-mt-20 grid-cols-1 gap-5 px-4 pt-10 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)]"
      >
        {/* Sidebar desktop */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">{sidebar}</div>
        </aside>

        {/* Sidebar mobile */}
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setMobileFilters(!mobileFilters)}
            className="flex w-full items-center justify-between rounded-2xl border border-[#E3E6EF] bg-white px-4 py-3 text-sm font-bold text-[#1B1D2A] shadow-sm"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" style={{ color: BRAND }} />
              Filter your results ({filtered.length})
            </span>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${mobileFilters ? "rotate-180" : ""}`} />
          </button>
          {mobileFilters && <div className="mt-3">{sidebar}</div>}
        </div>

        {/* Right content */}
        <section className="min-w-0">
          {bannerVisible && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-[#E3E6EF] bg-[#EEF0F5] px-4 py-3 text-[13px] shadow-sm">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#5A5F79]" />
              <p className="flex-1 font-medium leading-snug text-[#3D4159]">
                Based on your filters, we&apos;re showing available properties only.
              </p>
              <button
                type="button"
                aria-label="Dismiss notice"
                onClick={() => setBannerVisible(false)}
                className="rounded p-0.5 text-[#5A5F79] transition hover:bg-black/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Sort row */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[13px] text-[#6B7089]">
              <span className="font-extrabold text-[#1B1D2A]">{filtered.length} properties</span> found
              {search.destination ? ` • ${search.destination}` : ""}
            </p>
            <label className="flex items-center gap-2 rounded-xl border border-[#E3E6EF] bg-white px-3 py-2 text-[12.5px] font-semibold shadow-sm">
              <span className="text-[#9AA0B4]">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="cursor-pointer bg-transparent font-bold text-[#1B1D2A] outline-none"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Cards */}
          <div className="space-y-4">
            {loading ? (
              <>
                <HotelCardSkeleton />
                <HotelCardSkeleton />
                <HotelCardSkeleton />
              </>
            ) : visible.length > 0 ? (
              visible.map((hotel) => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  isFavorite={favorites.has(hotel.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-[#E3E6EF] bg-white p-12 text-center shadow-sm">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#F1F2F7]">
                  <SearchX className="h-6 w-6 text-[#9AA0B4]" />
                </span>
                <h3 className="mt-4 font-extrabold text-[#1B1D2A]">No properties found. Try changing your filters.</h3>
                <p className="mt-1 text-[13px] text-[#6B7089]">
                  Try widening your budget or removing some filters.
                </p>
                <button
                  type="button"
                  onClick={() => { setFilters(DEFAULT_FILTERS); setSearch(INITIAL_SEARCH); }}
                  className="mt-4 rounded-xl px-5 py-2.5 text-[13px] font-bold text-white"
                  style={{ backgroundColor: BRAND }}
                >
                  Reset all filters
                </button>
              </div>
            )}
          </div>

          {/* Pagination / Load more */}
          {!loading && visibleCount < filtered.length && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="rounded-xl border-2 px-8 py-3 text-sm font-bold transition hover:bg-[#5B5BE6] hover:text-white active:scale-95"
                style={{ borderColor: BRAND, color: BRAND }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = BRAND; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = BRAND; }}
              >
                Load more properties ({filtered.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </section>
      </main>

      {/* ================= FEATURED HOTELS ================= */}
      <section className="mx-auto max-w-[1280px] px-4 pt-12 sm:px-6">
        <h2 className="text-xl font-extrabold tracking-tight text-[#1B1D2A] sm:text-2xl">
          Featured Hotels
        </h2>
        <p className="mt-1 text-[13px] text-[#6B7089]">
          Top-rated stays picked by our travel experts.
        </p>
        <div className="mt-4 space-y-4">
          {featured.map((hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              isFavorite={favorites.has(hotel.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      </section>

      {/* ================= GUEST STORIES ================= */}
      <section className="mx-auto max-w-[1280px] px-4 pt-12 sm:px-6">
        <h2 className="text-xl font-extrabold tracking-tight text-[#1B1D2A] sm:text-2xl">
          Guest Stories
        </h2>
        <p className="mt-1 text-[13px] text-[#6B7089]">
          What travelers across Bangladesh say about HotelFlow.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-[#E3E6EF] bg-white p-6 shadow-[0_2px_12px_rgba(18,24,60,0.06)] transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(45,50,140,0.16)]"
            >
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < t.rating ? "fill-amber-400 text-amber-400" : "text-[#CBD2DC]"}`}
                  />
                ))}
              </div>
              <p className="mt-3 text-[13.5px] leading-relaxed text-[#3D4159]">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-3 border-t border-[#EEF0F5] pt-4">
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-black text-white"
                  style={{ backgroundColor: BRAND }}
                >
                  {t.name.charAt(0)}
                </span>
                <div>
                  <p className="text-[13.5px] font-extrabold text-[#1B1D2A]">{t.name}</p>
                  <p className="text-[12px] text-[#6B7089]">
                    {t.city} • stayed at {t.hotel}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= WHY BOOK ================= */}
      <section className="mx-auto max-w-[1280px] px-4 pt-12 sm:px-6">
        <div className="rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(18,24,60,0.06)] sm:p-10">
          <h2 className="text-center text-xl font-extrabold tracking-tight text-[#1B1D2A] sm:text-2xl">
            Why Book With HotelFlow
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: BadgeDollarSign, title: "Best price in Taka", text: "Transparent BDT prices with 15% VAT included. Find it cheaper within 24 hours and we refund the difference." },
              { icon: ShieldCheck, title: "Free cancellation", text: "Most stays let you cancel free of charge up to 24 hours before check-in." },
              { icon: Lock, title: "Pay your way", text: "Pay at hotel, or use bKash, Nagad, Rocket, Visa/Mastercard. No prepayment needed on most rooms." },
              { icon: Headset, title: "24/7 human support", text: "Real travel experts on call day and night, wherever you are." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#5B5BE6]/10">
                  <Icon className="h-6 w-6" style={{ color: BRAND }} />
                </span>
                <h3 className="mt-3 text-[15px] font-extrabold text-[#1B1D2A]">{title}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-[#6B7089]">{text}</p>
              </div>
            ))}
          <p className="mt-8 border-t border-[#EEF0F5] pt-5 text-center text-[12.5px] font-semibold text-[#6B7089]">
            We accept bKash • Nagad • Rocket • Visa/Mastercard • Cash at hotel
          </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
