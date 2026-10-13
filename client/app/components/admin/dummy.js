"use client";

// ---------------------------------------------------------------------------
// HotelFlow admin data layer — one place for API access + fallback data.
// - adminFetch(path, options): calls the Express backend with the admin token
//   (falls back to the user token), throws on HTTP errors.
// - useAdminFetch(path, fallback): hook returning { data, loading,
//   isFallback, refresh }. When the API is unreachable it serves the clearly
//   labeled Bangladeshi dummy data below so every page still renders.
// - normalizeBooking(): maps populated/unpopulated booking docs to one shape.
// - seededSeries(): deterministic chart data (no Math.random in render, so no
//   hydration mismatches between server and client).
// ---------------------------------------------------------------------------

import { useState, useEffect, useCallback } from "react";
import { getApiUrl } from "../../../lib/apiUrl";

export function adminToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("adminToken") || localStorage.getItem("token");
}

export async function adminFetch(path, options = {}) {
  const res = await fetch(getApiUrl(path), {
    cache: "no-store",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(adminToken() ? { Authorization: `Bearer ${adminToken()}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      if (err?.message) msg = err.message;
    } catch {
      /* keep generic message */
    }
    throw new Error(msg);
  }
  return res.json();
}

export function useAdminFetch(path, fallback) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const json = await adminFetch(path);
      setData(json.data ?? json);
      setIsFallback(false);
    } catch {
      setData(fallback);
      setIsFallback(true);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const json = await adminFetch(path);
        if (!cancelled) {
          setData(json.data ?? json);
          setIsFallback(false);
        }
      } catch {
        if (!cancelled) {
          setData(fallback);
          setIsFallback(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return { data, loading, isFallback, refresh, setData };
}

// Booking docs may carry a populated room object or a bare id —
// normalize to { id, guest, email, phone, room, roomId, checkIn, checkOut,
// guests, totalPrice, status, createdAt } for every table/chart/feed.
export function normalizeBooking(b, rooms = []) {
  const roomObj = b.room && typeof b.room === "object" ? b.room : null;
  const roomName =
    roomObj?.name ||
    rooms.find((r) => String(r._id || r.id) === String(b.room || roomObj))?.name ||
    "Room";
  return {
    id: String(b._id || b.id),
    guest: b.guestName || b.user?.name || "Guest",
    email: b.guestEmail || b.user?.email || "",
    phone: b.guestPhone || "",
    room: roomName,
    roomId: String(roomObj?._id || b.room || ""),
    checkIn: b.checkIn,
    checkOut: b.checkOut,
    guests: Number(b.numberOfGuests || b.guests) || 2,
    totalPrice: Number(b.totalPrice) || 0,
    status: b.status || "pending",
    createdAt: b.createdAt || new Date().toISOString(),
    paymentMethod: b.paymentMethod || "Cash at hotel",
  };
}

// Deterministic pseudo-random series for charts (seeded — stable SSR/CSR).
export function seededSeries(seed, n, base, spread) {
  let h = seed;
  const out = [];
  for (let i = 0; i < n; i++) {
    h = (h * 9301 + 49297) % 233280;
    out.push(Math.round(base + (h / 233280) * spread));
  }
  return out;
}

// --- Clearly labeled Bangladeshi fallback data (used only offline) ---

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

export const DUMMY_BOOKINGS = [
  { id: "bk1001", guest: "Rahim Uddin", email: "rahim.u@example.com", phone: "+880 1712-345678", room: "Sea Pearl Deluxe Sea View", roomId: "r1", checkIn: daysAgo(-2), checkOut: daysAgo(-5), guests: 2, totalPrice: 36000, status: "approved", createdAt: daysAgo(6), paymentMethod: "bKash" },
  { id: "bk1002", guest: "Nusrat Jahan", email: "nusrat.j@example.com", phone: "+880 1813-987654", room: "Gulshan Grand Executive Double", roomId: "r2", checkIn: daysAgo(-1), checkOut: daysAgo(-3), guests: 2, totalPrice: 17000, status: "approved", createdAt: daysAgo(4), paymentMethod: "Nagad" },
  { id: "bk1003", guest: "Tanvir Ahmed", email: "tanvir.a@example.com", phone: "+880 1914-223344", room: "Sajek Hill View Cottage", roomId: "r3", checkIn: daysAgo(0), checkOut: daysAgo(-2), guests: 2, totalPrice: 13000, status: "pending", createdAt: daysAgo(1), paymentMethod: "Cash at hotel" },
  { id: "bk1004", guest: "Farhana Akter", email: "farhana.a@example.com", phone: "+880 1611-556677", room: "Tea Garden Family Retreat", roomId: "r4", checkIn: daysAgo(-9), checkOut: daysAgo(-12), guests: 4, totalPrice: 21600, status: "completed", createdAt: daysAgo(14), paymentMethod: "Rocket" },
  { id: "bk1005", guest: "Abdullah-Al-Mahmud", email: "mahmud.a@example.com", phone: "+880 1515-889900", room: "Padma Riverside Suite", roomId: "r5", checkIn: daysAgo(-4), checkOut: daysAgo(-6), guests: 3, totalPrice: 30000, status: "approved", createdAt: daysAgo(8), paymentMethod: "Visa" },
  { id: "bk1006", guest: "Sharmin Sultana", email: "sharmin.s@example.com", phone: "+880 1312-112233", room: "Bay Breeze Standard", roomId: "r6", checkIn: daysAgo(2), checkOut: daysAgo(4), guests: 2, totalPrice: 8400, status: "pending", createdAt: daysAgo(0), paymentMethod: "Cash at hotel" },
  { id: "bk1007", guest: "Imran Hossain", email: "imran.h@example.com", phone: "+880 1414-445566", room: "Kuakata Sunset Family", roomId: "r9", checkIn: daysAgo(-20), checkOut: daysAgo(-22), guests: 5, totalPrice: 11000, status: "cancelled", createdAt: daysAgo(26), paymentMethod: "bKash" },
  { id: "bk1008", guest: "Tasnim Chowdhury", email: "tasnim.c@example.com", phone: "+880 1919-778899", room: "Dhanmondi Lake View Deluxe", roomId: "r8", checkIn: daysAgo(-15), checkOut: daysAgo(-17), guests: 2, totalPrice: 13600, status: "rejected", createdAt: daysAgo(21), paymentMethod: "Nagad" },
];

export const DUMMY_USERS = [
  { id: "u1", name: "Rahim Uddin", email: "rahim.u@example.com", phone: "+880 1712-345678", role: "admin", status: "active", createdAt: daysAgo(120), bookings: 6 },
  { id: "u2", name: "Nusrat Jahan", email: "nusrat.j@example.com", phone: "+880 1813-987654", role: "staff", status: "active", createdAt: daysAgo(90), bookings: 0 },
  { id: "u3", name: "Tanvir Ahmed", email: "tanvir.a@example.com", phone: "+880 1914-223344", role: "guest", status: "active", createdAt: daysAgo(32), bookings: 2 },
  { id: "u4", name: "Farhana Akter", email: "farhana.a@example.com", phone: "+880 1611-556677", role: "guest", status: "active", createdAt: daysAgo(61), bookings: 4 },
  { id: "u5", name: "Abdullah-Al-Mahmud", email: "mahmud.a@example.com", phone: "+880 1515-889900", role: "guest", status: "active", createdAt: daysAgo(15), bookings: 1 },
  { id: "u6", name: "Sharmin Sultana", email: "sharmin.s@example.com", phone: "+880 1312-112233", role: "guest", status: "blocked", createdAt: daysAgo(48), bookings: 0 },
  { id: "u7", name: "Imran Hossain", email: "imran.h@example.com", phone: "+880 1414-445566", role: "staff", status: "active", createdAt: daysAgo(75), bookings: 0 },
  { id: "u8", name: "Tasnim Chowdhury", email: "tasnim.c@example.com", phone: "+880 1919-778899", role: "guest", status: "active", createdAt: daysAgo(9), bookings: 1 },
];

export const DUMMY_REVIEWS = [
  { id: "rv1", guest: "Rahim Uddin", room: "Sea Pearl Deluxe Sea View", rating: 5, comment: "Woke up to the Bay of Bengal right outside our balcony. Best weekend this year.", status: "approved", createdAt: daysAgo(3) },
  { id: "rv2", guest: "Nusrat Jahan", room: "Gulshan Grand Executive Double", rating: 5, comment: "Spotless room, fast Wi-Fi and the halal breakfast spread was excellent.", status: "approved", createdAt: daysAgo(6) },
  { id: "rv3", guest: "Tanvir Ahmed", room: "Sajek Hill View Cottage", rating: 4, comment: "Clouds below the cottage at dawn. Road trip was long but worth it.", status: "pending", createdAt: daysAgo(1) },
  { id: "rv4", guest: "Farhana Akter", room: "Tea Garden Family Retreat", rating: 5, comment: "Kids loved the lake view and the staff arranged a tea garden walk for us.", status: "approved", createdAt: daysAgo(10) },
  { id: "rv5", guest: "Imran Hossain", room: "Kuakata Sunset Family", rating: 3, comment: "Good location near the beach but the generator took a while during load-shedding.", status: "pending", createdAt: daysAgo(2) },
  { id: "rv6", guest: "Sharmin Sultana", room: "Bay Breeze Standard", rating: 4, comment: "Great value in Agrabad. Airport pickup was on time.", status: "rejected", createdAt: daysAgo(12) },
];

export const DUMMY_MESSAGES = [
  { id: "m1", name: "Kamal Hossain", email: "kamal.h@example.com", phone: "+880 1711-000111", subject: "Honeymoon package", message: "Do you offer a honeymoon package in Cox's Bazar for December?", status: "unread", createdAt: daysAgo(0) },
  { id: "m2", name: "Salma Begum", email: "salma.b@example.com", phone: "+880 1822-000222", subject: "Airport pickup", message: "Is airport pickup available from Shahjalal airport for late-night arrival?", status: "unread", createdAt: daysAgo(1) },
  { id: "m3", name: "Arif Chowdhury", email: "arif.c@example.com", phone: "+880 1933-000333", subject: "Corporate booking", message: "We need 10 rooms in Dhaka for a 3-day training program next month.", status: "read", createdAt: daysAgo(4) },
  { id: "m4", name: "Mitu Rahman", email: "mitu.r@example.com", phone: "+880 1644-000444", subject: "Refund query", message: "My cancelled booking refund has not arrived after 7 days. Please help.", status: "unread", createdAt: daysAgo(2) },
  { id: "m5", name: "Hasan Ali", email: "hasan.a@example.com", phone: "+880 1555-000555", subject: "Sajek transport", message: "Can you arrange a Chander Gari from Khagrachari to Sajek for 6 people?", status: "read", createdAt: daysAgo(7) },
];
