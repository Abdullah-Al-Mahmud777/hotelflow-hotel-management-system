"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, GitCompare, X } from "lucide-react";
import Navbar from "../components/Navbar";
import { LoadingSpinner } from "../components/Loading";
import { apiClient } from "../../lib/apiClient";

const MAX_COMPARE = 3;

export default function RoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [favIds, setFavIds] = useState(new Set());
  const [compareIds, setCompareIds] = useState([]);
  const [favBusy, setFavBusy] = useState(null);

  const authed = () => typeof window !== "undefined" && !!localStorage.getItem("token");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetchRooms();
      if (localStorage.getItem("token")) {
        apiClient.get("/api/favorites", { params: { limit: 100 } })
          .then(({ data }) => setFavIds(new Set((data.data || []).map((f) => String(f.room?._id || f.room)))))
          .catch(() => {});
      }
    }
  }, []);

  useEffect(() => {
    filterRooms();
  }, [selectedType, priceRange, rooms]);

  const fetchRooms = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/rooms', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        setRooms(data.data || []);
        setFilteredRooms(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (roomId) => {
    if (!authed()) {
      router.push("/login");
      return;
    }
    if (favBusy) return;
    setFavBusy(roomId);
    try {
      if (favIds.has(roomId)) {
        await apiClient.delete(`/api/favorites/${roomId}`);
        setFavIds((prev) => new Set([...prev].filter((x) => x !== roomId)));
      } else {
        await apiClient.post("/api/favorites", { roomId });
        setFavIds((prev) => new Set([...prev, roomId]));
      }
    } catch (error) {
      console.error("Wishlist error:", error?.response?.data || error.message);
    } finally {
      setFavBusy(null);
    }
  };

  const toggleCompare = (roomId) => {
    setCompareIds((prev) => {
      if (prev.includes(roomId)) return prev.filter((x) => x !== roomId);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, roomId];
    });
  };

  const compareRooms = rooms.filter((r) => compareIds.includes(String(r._id)));

  const filterRooms = () => {
    let filtered = [...rooms];
    
    if (selectedType !== "all") {
      filtered = filtered.filter(room => room.type === selectedType);
    }
    
    filtered = filtered.filter(room => 
      room.price >= priceRange.min && room.price <= priceRange.max
    );
    
    setFilteredRooms(filtered);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white flex items-center justify-center pt-20">
          <LoadingSpinner />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-4">Our Rooms & Suites</h1>
            <p className="text-xl text-blue-100">Discover comfort and luxury in every stay</p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Room Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="all">All Types</option>
                  <option value="Standard">Standard</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Suite">Suite</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Min Price: ${priceRange.min}</label>
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Max Price: ${priceRange.max}</label>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600 font-medium">
              Showing {filteredRooms.length} of {rooms.length} rooms
            </p>
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRooms.map((room) => (
              <div key={room._id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-300">
                <div className="relative h-64 bg-gray-200">
                  {room.image && (room.image.includes('localhost') || room.image.includes('127.0.0.1')) ? (
                    <img
                      src={room.image}
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      src={room.image || "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=800"}
                      alt={room.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  )}
                  <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {room.type}
                  </div>
                  <div className="absolute top-4 left-4 flex gap-2">
                    <button
                      onClick={() => toggleFavorite(String(room._id))}
                      disabled={favBusy === String(room._id)}
                      aria-label={favIds.has(String(room._id)) ? `Remove ${room.name} from wishlist` : `Save ${room.name} to wishlist`}
                      aria-pressed={favIds.has(String(room._id))}
                      className={`rounded-full p-2 shadow transition disabled:opacity-50 ${favIds.has(String(room._id)) ? "bg-red-600 text-white" : "bg-white/90 text-slate-600 hover:text-red-600"}`}
                    >
                      <Heart className={`w-4 h-4 ${favIds.has(String(room._id)) ? "fill-current" : ""}`} />
                    </button>
                    <button
                      onClick={() => toggleCompare(String(room._id))}
                      aria-pressed={compareIds.includes(String(room._id))}
                      aria-label={`Add ${room.name} to comparison`}
                      className={`rounded-full p-2 shadow transition ${compareIds.includes(String(room._id)) ? "bg-slate-900 text-white" : "bg-white/90 text-slate-600 hover:text-slate-900"}`}
                    >
                      <GitCompare className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{room.name}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{room.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      <span>{room.capacity} Guests</span>
                    </div>
                    <div className="text-3xl font-bold text-blue-600">
                      ${room.price}
                      <span className="text-sm text-gray-500">/night</span>
                    </div>
                  </div>

                  <Link
                    href={`/rooms/${room._id}`}
                    className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    View Details & Book
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {filteredRooms.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🏨</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Rooms Found</h3>
              <p className="text-gray-600">Try adjusting your filters</p>
            </div>
          )}
        </div>

        {/* Compare tray */}
        {compareRooms.length > 0 && (
          <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl" role="region" aria-label="Compare selected rooms">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-bold text-slate-900">
                Compare ({compareRooms.length}/{MAX_COMPARE})
              </p>
              <button onClick={() => setCompareIds([])} className="text-xs font-medium text-slate-500 hover:text-slate-900">
                Clear all
              </button>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {compareRooms.map((r) => (
                <div key={r._id} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm">
                  <span className="truncate font-medium text-slate-900">{r.name} · ${r.price}</span>
                  <button onClick={() => toggleCompare(String(r._id))} aria-label={`Remove ${r.name} from comparison`} className="text-slate-400 hover:text-red-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            {compareRooms.length >= 2 && (
              <p className="mt-2 text-xs text-slate-500">
                Full side-by-side table lives in Dashboard → Wishlist & Compare.
              </p>
            )}
          </div>
        )}
      </main>
    </>
  );
}
