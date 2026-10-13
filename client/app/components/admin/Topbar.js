"use client";

// ---------------------------------------------------------------------------
// HotelFlow admin Topbar — page title + breadcrumb, global search (Ctrl+K),
// notifications bell with unread dot + dropdown (latest 5), dark/light toggle
// (Sun/Moon), and a profile dropdown (Profile, Settings, Logout).
// ---------------------------------------------------------------------------

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";

export default function Topbar({
  title,
  breadcrumb = [],
  onMenu,
  search,
  onSearch,
  searchPlaceholder = "Search bookings, rooms, guests…",
  notifications = [],
  onMarkNotificationsRead,
  theme,
  onToggleTheme,
  admin,
  onLogout,
}) {
  const [bellOpen, setBellOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const searchRef = useRef(null);
  const bellRef = useRef(null);
  const profileRef = useRef(null);

  // Ctrl+K focuses the global search from anywhere on the page.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close dropdowns on outside click / Escape.
  useEffect(() => {
    const onClick = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    const onEsc = (e) => {
      if (e.key === "Escape") {
        setBellOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const unread = notifications.filter((n) => n.unread).length;

  return (
    <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-700 dark:bg-slate-900/85">
      <div className="flex h-16 items-center gap-2 px-4 sm:gap-3 sm:px-6">
        <button
          type="button"
          onClick={onMenu}
          aria-label="Open admin menu"
          className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Title + breadcrumb */}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold text-slate-900 sm:text-[20px] dark:text-white">
            {title}
          </h1>
          {breadcrumb.length > 0 && (
            <p className="hidden truncate text-[12px] text-slate-500 sm:block dark:text-slate-400">
              {breadcrumb.join("  /  ")}
            </p>
          )}
        </div>

        {/* Global search */}
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Global search"
            className="w-56 rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-14 text-[13px] font-medium outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 lg:w-72 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-400 dark:border-slate-600 dark:bg-slate-700">
            Ctrl+K
          </kbd>
        </div>

        {/* Theme toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 focus:ring-2 focus:ring-[#2563EB]/30 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={bellRef}>
          <button
            type="button"
            onClick={() => {
              setBellOpen(!bellOpen);
              setProfileOpen(false);
            }}
            aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
            aria-expanded={bellOpen}
            className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 focus:ring-2 focus:ring-[#2563EB]/30 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>
          {bellOpen && (
            <div className="absolute right-0 top-12 w-[320px] max-w-[calc(100vw-2rem)] animate-fade-in overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-700">
                <p className="text-[13.5px] font-bold text-slate-900 dark:text-white">Notifications</p>
                {unread > 0 && (
                  <button
                    type="button"
                    onClick={() => onMarkNotificationsRead?.()}
                    className="text-[12px] font-bold text-[#2563EB] hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              {notifications.length === 0 && (
                <p className="px-4 py-8 text-center text-[13px] text-slate-500">No notifications yet.</p>
              )}
              {notifications.slice(0, 5).map((n) => (
                <div key={n.id} className="flex items-start gap-2.5 border-b border-slate-50 px-4 py-3 last:border-0 dark:border-slate-700">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.unread ? "bg-[#2563EB]" : "bg-slate-300"}`} />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-bold text-slate-800 dark:text-slate-100">{n.title}</p>
                    <p className="line-clamp-2 text-[12px] text-slate-500 dark:text-slate-400">{n.text}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400" title={n.exact || ""}>
                      {n.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => {
              setProfileOpen(!profileOpen);
              setBellOpen(false);
            }}
            aria-label="Profile menu"
            aria-expanded={profileOpen}
            className="flex items-center gap-1.5 rounded-xl p-1 transition hover:bg-slate-100 focus:ring-2 focus:ring-[#2563EB]/30 dark:hover:bg-slate-800"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#2563EB] text-[13px] font-black text-white">
              {String(admin?.name || "A").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
            </span>
            <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-12 w-52 animate-fade-in overflow-hidden rounded-2xl border border-slate-200 bg-white py-1.5 shadow-2xl dark:border-slate-700 dark:bg-slate-800">
              <p className="truncate px-4 py-2 text-[13px] font-bold text-slate-900 dark:text-white">
                {admin?.name || "Administrator"}
              </p>
              <p className="truncate px-4 pb-2 text-[12px] text-slate-500">{admin?.email || ""}</p>
              <div className="border-t border-slate-100 dark:border-slate-700">
                {[
                  { label: "Profile", icon: User, href: "/admin/settings" },
                  { label: "Settings", icon: Settings, href: "/admin/settings" },
                ].map(({ label, icon: Icon, href }) => (
                  <Link
                    key={label}
                    href={href}
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    <Icon className="h-4 w-4 text-slate-400" /> {label}
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    onLogout();
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
