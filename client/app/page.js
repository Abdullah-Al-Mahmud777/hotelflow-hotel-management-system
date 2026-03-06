"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { api } from "@/lib/api";
import Navbar from "./components/Navbar";
import { LoadingSpinner, LoadingCard } from "./components/Loading";
import Carousel, { TestimonialsCarousel } from "./components/Carousel";

export default function Home() {
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [filters, setFilters] = useState({
    checkIn: "",
    checkOut: "",
    type: "all",
    minPrice: "",
    maxPrice: ""
  });

  useEffect(() => {
    setMounted(true);
    setInitialLoading(true);
    // Only load rooms on client side
    if (typeof window !== 'undefined') {
      loadFeaturedRooms();
    }
    const handleScroll = () => setIsSticky(window.scrollY > 450);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadFeaturedRooms = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/rooms/featured', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Featured rooms loaded:", data.data?.length);
        setFeaturedRooms(data.data || []);
      } else {
        console.error('Failed to fetch rooms');
        setFeaturedRooms([]);
      }
    } catch (error) { 
      console.error('Error loading rooms:', error);
      setFeaturedRooms([]);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.type && filters.type !== 'all') params.append('type', filters.type);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.checkIn) params.append('checkIn', filters.checkIn);
      if (filters.checkOut) params.append('checkOut', filters.checkOut);
      
      const response = await fetch(`http://localhost:5000/api/rooms?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.data || []);
      } else {
        setSearchResults([]);
      }
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) { 
      console.error('Search Error:', error);
      setSearchResults([]);
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <main className="min-h-screen bg-white text-slate-900" suppressHydrationWarning>
      <Navbar />
      
      {/* HERO CAROUSEL SECTION */}
      <section className="relative h-[70vh] md:h-[85vh] mt-16 overflow-hidden bg-slate-900" suppressHydrationWarning>
        {mounted ? (
          <Carousel
            images={[
              {
                src: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1600",
                alt: "Luxury Hotel Lobby",
                caption: "Welcome to HotelFlow",
                description: "Experience luxury and comfort in our premium rooms"
              },
              {
                src: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1600",
                alt: "Modern Hotel Interior",
                caption: "Elegance Redefined",
                description: "Where sophistication meets modern comfort"
              },
              {
                src: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1600",
                alt: "Hotel Pool View",
                caption: "Unwind in Paradise",
                description: "Relax by our stunning infinity pool"
              }
            ]}
            interval={6000}
          />
        ) : (
          // Placeholder for SSR
          <div className="absolute inset-0">
            <Image 
              src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1600"
              alt="Luxury Hotel Lobby"
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
        
        {/* Hero Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/20">
          <div className="text-center px-4">
            <h1 className="text-5xl md:text-8xl font-black text-white mb-6 tracking-tighter drop-shadow-2xl">
              HOTEL<span className="text-blue-400">FLOW</span>
            </h1>
            <p className="text-lg md:text-2xl text-white mb-10 max-w-2xl mx-auto font-medium drop-shadow-lg">
              Seamless booking for the modern traveler. 
              Experience luxury without the complexity.
            </p>
            <button 
              onClick={() => document.getElementById('search-bar')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white hover:bg-blue-600 hover:text-white text-slate-900 px-12 py-5 rounded-2xl text-lg font-bold transition-all transform hover:scale-105 shadow-2xl"
            >
              Find Your Suite
            </button>
          </div>
        </div>
      </section>

      {/* SEARCH BAR - Professional Design */}
      <div 
        id="search-bar"
        suppressHydrationWarning
        className={`${
          mounted && isSticky 
          ? 'fixed top-20 left-0 right-0 z-40 shadow-lg' 
          : 'relative -mt-20'
        } bg-white transition-all duration-300`}
      >
        <div className="container mx-auto px-6 py-8">
          <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Check In */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Check In
                </label>
                <input
                  type="date"
                  name="checkIn"
                  value={filters.checkIn}
                  onChange={(e) => setFilters({...filters, checkIn: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Check Out */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Check Out
                </label>
                <input
                  type="date"
                  name="checkOut"
                  value={filters.checkOut}
                  onChange={(e) => setFilters({...filters, checkOut: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              
              {/* Room Type */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Room Type
                </label>
                <select
                  name="type"
                  value={filters.type}
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1.25rem'
                  }}
                >
                  <option value="all">All Types</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Suite">Suite</option>
                </select>
              </div>

              {/* Min Price */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Min Price
                </label>
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                  placeholder="$0"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                />
              </div>

              {/* Max Price */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Max Price
                </label>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                  placeholder="$1000"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                />
              </div>
              
              {/* Search Button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? <LoadingSpinner size="sm" /> : "SEARCH"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* DYNAMIC CONTENT AREA */}
      <section id="results" className="container mx-auto px-4 py-20" suppressHydrationWarning>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase">
              {searchResults.length > 0 ? "Your Search" : "Featured Stays"}
            </h2>
            <p className="text-slate-500 font-medium mt-2">Handpicked selection of premium accommodation.</p>
          </div>
          <div className="h-[2px] flex-grow mx-8 bg-slate-100 hidden lg:block mb-4" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10" suppressHydrationWarning>
          {mounted && initialLoading ? (
            // Show loading cards while fetching data
            <>
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
            </>
          ) : (
            <>
              {(searchResults.length > 0 ? searchResults : featuredRooms).map((room) => (
                <RoomCard key={room._id} room={room} />
              ))}
              
              {/* Fallback if no rooms available */}
              {!initialLoading && searchResults.length === 0 && featuredRooms.length === 0 && (
                 <div className="col-span-full text-center py-20">
                   <div className="text-6xl mb-4">🏨</div>
                   <h3 className="text-2xl font-bold text-gray-800 mb-2">No Rooms Available</h3>
                   <p className="text-gray-600">Check back soon for our latest offerings!</p>
                 </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CAROUSEL 1: Hotel Highlights */}
      <section className="bg-gradient-to-br from-slate-50 to-blue-50 py-20" suppressHydrationWarning>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase mb-4">
              Experience Luxury
            </h2>
            <p className="text-slate-600 font-medium">Discover our world-class facilities and amenities</p>
          </div>
          <div className="max-w-6xl mx-auto h-[500px]">
            {mounted && (
              <Carousel
                images={[
                  {
                    src: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1600",
                    alt: "Luxury Hotel Lobby",
                    caption: "Grand Lobby",
                    description: "Welcome to elegance and sophistication"
                  },
                  {
                    src: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1600",
                    alt: "Infinity Pool",
                    caption: "Infinity Pool",
                    description: "Relax with breathtaking city views"
                  },
                  {
                    src: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=1600",
                    alt: "Fine Dining",
                    caption: "Fine Dining",
                    description: "Michelin-starred culinary experiences"
                  },
                  {
                    src: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=1600",
                    alt: "Spa & Wellness",
                    caption: "Spa & Wellness",
                    description: "Rejuvenate your mind and body"
                  }
                ]}
              />
            )}
          </div>
        </div>
      </section>

      {/* CAROUSEL 2: Room Types Showcase */}
      <section className="py-20" suppressHydrationWarning>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase mb-4">
              Our Suites
            </h2>
            <p className="text-slate-600 font-medium">From deluxe rooms to presidential suites</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="h-[400px]">
              {mounted && (
                <Carousel
                  images={[
                    {
                      src: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1600",
                      alt: "Deluxe Room",
                      caption: "Deluxe Room",
                      description: "Modern comfort with city views"
                    },
                    {
                      src: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80&w=1600",
                      alt: "Executive Suite",
                      caption: "Executive Suite",
                      description: "Perfect for business travelers"
                    },
                    {
                      src: "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&q=80&w=1600",
                      alt: "Family Suite",
                      caption: "Family Suite",
                      description: "Spacious rooms for the whole family"
                    }
                  ]}
                  interval={4000}
                />
              )}
            </div>
            <div className="h-[400px]">
              {mounted && (
                <Carousel
                  images={[
                    {
                      src: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=1600",
                      alt: "Presidential Suite",
                      caption: "Presidential Suite",
                      description: "Ultimate luxury and privacy"
                    },
                    {
                      src: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=1600",
                      alt: "Honeymoon Suite",
                      caption: "Honeymoon Suite",
                      description: "Romance and elegance combined"
                    },
                    {
                      src: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=1600",
                      alt: "Penthouse",
                      caption: "Penthouse",
                      description: "Panoramic views from the top floor"
                    }
                  ]}
                  interval={4500}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CAROUSEL 3: Testimonials */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-20" suppressHydrationWarning>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase mb-4">
              Guest Reviews
            </h2>
            <p className="text-slate-600 font-medium">What our guests say about their experience</p>
          </div>
          <div className="max-w-3xl mx-auto h-[280px] relative">
            {mounted && <TestimonialsCarousel />}
          </div>
        </div>
      </section>
    </main>
  );
}

function RoomCard({ room }) {
  return (
    <div className="group bg-white rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100">
      <div className="relative h-72 overflow-hidden">
        <Image 
          src={room.image || "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=800"} 
          alt={room.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-2xl font-black text-slate-900 text-xs shadow-sm uppercase tracking-wider">
          {room.type}
        </div>
      </div>

      <div className="p-8">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-black text-slate-900 leading-tight">
            {room.name}
          </h3>
        </div>
        
        <p className="text-slate-500 text-sm line-clamp-2 mb-8 font-medium">
          {room.description || "Indulge in a space where modern design meets absolute comfort."}
        </p>
        
        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Rate</p>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">
              ${room.price}<span className="text-sm font-bold text-slate-400">/nt</span>
            </p>
          </div>
          <a 
            href={`/rooms/${room._id}`}
            className="bg-slate-900 text-white px-7 py-4 rounded-2xl font-black hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-slate-200"
          >
            BOOK NOW
          </a>
        </div>
      </div>
    </div>
  );
}