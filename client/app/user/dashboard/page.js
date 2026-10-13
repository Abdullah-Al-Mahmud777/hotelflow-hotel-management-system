"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, TriangleAlert } from "lucide-react";
import UserSidebar from "../components/UserSidebar";
import Overview, { OverviewSkeleton } from "../components/Overview";
import UserBookings from "../components/UserBookings";
import UserReviews from "../components/UserReviews";
import UserProfile from "../components/UserProfile";
import Payments from "../components/Payments";
import Notifications from "../components/Notifications";
import Wishlist from "../components/Wishlist";
import BookingCalendar from "../components/BookingCalendar";
import Rewards from "../components/Rewards";
import SupportDesk from "../components/SupportDesk";
import Assistant from "../components/Assistant";
import { ToastProvider, useToast } from "../components/ui";
import {
  getDashboardMetrics,
  getRecentBookings,
  getReviewStatusCount,
  getUserProfile,
  getMyBookings,
  getMyReviews,
  getPaymentsHistory,
  getNotifications,
  getFavorites,
  getRecommendations,
  getLoyalty,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../../lib/dashboardApi";

function DashboardShell() {
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [metrics, setMetrics] = useState({ totalBookings: 0, approved: 0, pending: 0, reviews: 0 });
  const [recent, setRecent] = useState([]);
  const [reviewCounts, setReviewCounts] = useState({ approved: 0, pending: 0, rejected: 0 });
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [payments, setPayments] = useState(null);
  const [notifications, setNotifications] = useState(null);
  const [favorites, setFavorites] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loyalty, setLoyalty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const applyResults = useCallback((results) => {
    const [m, r, rc, u, b, rev, pay, notif, fav, rec, loy] = results;
    if (m.status === "fulfilled") {
      setMetrics({
        totalBookings: m.value?.totalBookings ?? 0,
        approved: m.value?.approved ?? 0,
        pending: m.value?.pending ?? 0,
        reviews: m.value?.reviews ?? 0,
      });
    }
    if (r.status === "fulfilled") setRecent(Array.isArray(r.value) ? r.value : []);
    if (rc.status === "fulfilled") {
      setReviewCounts({
        approved: rc.value?.approved ?? 0,
        pending: rc.value?.pending ?? 0,
        rejected: rc.value?.rejected ?? 0,
      });
    }
    if (u.status === "fulfilled") setUser(u.value);
    if (b.status === "fulfilled") setBookings(Array.isArray(b.value) ? b.value : []);
    else setBookings([]);
    if (rev.status === "fulfilled") setReviews(Array.isArray(rev.value) ? rev.value : []);
    else setReviews([]);
    if (pay.status === "fulfilled") setPayments(pay.value);
    if (notif.status === "fulfilled") setNotifications(notif.value);
    if (fav && fav.status === "fulfilled") setFavorites(fav.value);
    if (rec && rec.status === "fulfilled") setRecommendations(Array.isArray(rec.value) ? rec.value : []);
    if (loy && loy.status === "fulfilled") setLoyalty(loy.value);
    return results.filter((x) => x.status === "rejected");
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    const results = await Promise.allSettled([
      getDashboardMetrics(),
      getRecentBookings(),
      getReviewStatusCount(),
      getUserProfile(),
      getMyBookings(),
      getMyReviews(),
      getPaymentsHistory(),
      getNotifications(),
      getFavorites({ limit: 50 }),
      getRecommendations(6),
      getLoyalty({ limit: 10 }),
    ]);
    const first401 = results.find(
      (x) => x.status === "rejected" && (x.reason?.status === 401 || x.reason?.response?.status === 401)
    );
    if (first401) {
      router.push("/login");
      return;
    }
    const failures = applyResults(results);
    if (failures.length > 0) {
      setError(`Loaded with ${failures.length} section(s) failing. Showing available data.`);
    }
    setLoading(false);
  }, [router, applyResults]);

  // Light refresh after mutations (bookings/reviews/payments/notifications/metrics)
  const refreshData = useCallback(async () => {
    setSectionLoading(true);
    try {
      const results = await Promise.allSettled([
        getDashboardMetrics(),
        getRecentBookings(),
        getReviewStatusCount(),
        getMyBookings(),
        getMyReviews(),
        getPaymentsHistory(),
        getNotifications(),
        getFavorites({ limit: 50 }),
        getRecommendations(6),
        getLoyalty({ limit: 10 }),
      ]);
      const [m, r, rc, b, rev, pay, notif, fav, rec, loy] = results;
      const full = [m, r, rc, { status: "fulfilled", value: user }, b, rev, pay, notif, fav, rec, loy];
      applyResults(full);
    } catch (err) {
      console.error("[Dashboard:refresh]", err?.message || err);
    } finally {
      setSectionLoading(false);
    }
  }, [applyResults, user]);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/login");
      return;
    }
    loadDashboard();
  }, [router, loadDashboard]);

  const retry = () => loadDashboard();
  const unread = notifications?.unread ?? 0;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F9FAFB]">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed left-4 top-4 z-50 rounded-xl bg-[#111827] p-2.5 text-white shadow-sm lg:hidden"
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <div
        className={`fixed inset-y-0 left-0 z-40 transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <UserSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
          unreadCount={unread}
          onClose={() => setSidebarOpen(false)}
        />
      </div>
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 overflow-y-auto">
        <div className="p-4 pt-16 sm:p-6 lg:p-8 lg:pt-8">
          {error && !loading && (
            <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              <span className="flex items-center gap-2">
                <TriangleAlert className="h-4 w-4" /> {error}
              </span>
              <button onClick={retry} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700">
                Retry
              </button>
            </div>
          )}

          {activeTab === "overview" &&
            (loading ? (
              <OverviewSkeleton />
            ) : (
              <Overview
                metrics={metrics}
                recent={recent}
                reviewCounts={reviewCounts}
                bookings={bookings}
                recommendations={recommendations}
                loyalty={loyalty}
                loading={false}
                error={sectionLoading ? "Refreshing…" : ""}
                onNavigate={setActiveTab}
              />
            ))}

          {activeTab === "bookings" && (
            <UserBookings bookings={bookings} reviews={reviews} loading={loading || sectionLoading} onChanged={refreshData} />
          )}
          {activeTab === "calendar" && <BookingCalendar />}
          {activeTab === "wishlist" && (
            <Wishlist favorites={favorites} loading={loading || sectionLoading} onChanged={refreshData} />
          )}
          {activeTab === "reviews" && (
            <UserReviews reviews={reviews} bookings={bookings} loading={loading || sectionLoading} onChanged={refreshData} />
          )}
          {activeTab === "rewards" && (
            <Rewards loyalty={loyalty} loading={loading || sectionLoading} onChanged={refreshData} />
          )}
          {activeTab === "payments" && (
            <Payments payments={payments} loading={loading || sectionLoading} onToast={toast} />
          )}
          {activeTab === "support" && <SupportDesk />}
          {activeTab === "assistant" && <Assistant />}
          {activeTab === "notifications" && (
            <Notifications
              notifications={notifications}
              loading={loading || sectionLoading}
              onRead={async (id) => {
                try {
                  await markNotificationRead(id);
                  setNotifications((n) =>
                    n ? { ...n, data: n.data.map((x) => (x.nid === id || x.id === id ? { ...x, read: true } : x)), unread: Math.max(0, (n.unread || 1) - 1) } : n
                  );
                } catch (err) {
                  toast(err?.message || "Update failed", "error");
                }
              }}
              onReadAll={async () => {
                try {
                  await markAllNotificationsRead();
                  refreshData();
                } catch (err) {
                  toast(err?.message || "Update failed", "error");
                }
              }}
            />
          )}
          {activeTab === "profile" && <UserProfile user={user} onUpdate={setUser} />}
        </div>
      </main>
    </div>
  );
}

export default function UserDashboard() {
  return (
    <ToastProvider>
      <DashboardShell />
    </ToastProvider>
  );
}
