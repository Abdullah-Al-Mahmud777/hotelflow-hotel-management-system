"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  Star,
  User,
  CreditCard,
  Bell,
  Heart,
  Award,
  LifeBuoy,
  Bot,
  House,
  LogOut,
  X,
} from "lucide-react";
import { logoutUser } from "../../../lib/dashboardApi";

const MENU = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "bookings", label: "My Bookings", icon: Calendar },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "reviews", label: "My Reviews", icon: Star },
  { id: "rewards", label: "Rewards", icon: Award },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "support", label: "Support", icon: LifeBuoy },
  { id: "assistant", label: "AI Assistant", icon: Bot },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "profile", label: "Profile", icon: User },
];

export default function UserSidebar({ activeTab, setActiveTab, user, unreadCount = 0, onClose }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      // POST /api/v1/auth/logout — Bearer token attached by Axios interceptor
      await logoutUser();
    } catch (err) {
      // Log clearly but still clear session locally
      console.error("[Sidebar logout] API failed, clearing session anyway:", err?.response?.data || err.message);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminEmail");
      localStorage.removeItem("adminUser");
      setLoggingOut(false);
      router.push("/login");
    }
  };

  const handleMenuClick = (tabId) => {
    setActiveTab(tabId);
    if (onClose) onClose();
  };

  // user.avatar may be "A" (initial) or a URL — render URL only if it looks like one
  const avatarUrl =
    user?.avatar && /^https?:\/\//.test(user.avatar) ? user.avatar : null;
  const initial = (user?.name?.charAt(0)?.toUpperCase() || user?.avatar || "G").slice(0, 1);

  return (
    <aside className="flex h-full w-64 flex-col bg-[#111827] text-white">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
        <button onClick={() => router.push("/")} className="text-left" aria-label="HotelFlow home">
          <span className="block text-xl font-bold tracking-tight text-white">
            Hotel<span className="text-blue-400">Flow</span>
          </span>
          <span className="mt-0.5 block text-xs font-medium text-slate-400">User Dashboard</span>
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Profile snapshot — GET /api/v1/user/profile */}
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={user?.name || "User"} className="h-10 w-10 rounded-full border border-white/20 object-cover" />
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
              {initial}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{user?.name || "Guest"}</p>
            <p className="truncate text-xs text-slate-400">{user?.email || "—"}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4" aria-label="Dashboard navigation">
        <ul className="space-y-1.5">
          {MENU.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleMenuClick(item.id)}
                  aria-current={active ? "page" : undefined}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    active ? "bg-blue-600 text-white shadow-sm" : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
                  {item.label}
                  {item.id === "notifications" && unreadCount > 0 && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500 px-1.5 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="space-y-1.5 border-t border-white/10 p-4">
        <button
          onClick={() => router.push("/")}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <House className="h-[18px] w-[18px]" strokeWidth={2} />
          Back to Home
        </button>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-red-600 hover:text-white disabled:opacity-50"
        >
          <LogOut className="h-[18px] w-[18px]" strokeWidth={2} />
          {loggingOut ? "Logging out…" : "Logout"}
        </button>
      </div>
    </aside>
  );
}
