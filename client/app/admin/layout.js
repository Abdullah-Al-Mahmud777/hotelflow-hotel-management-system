"use client";

// ---------------------------------------------------------------------------
// HotelFlow admin layout — role guard + shell (Sidebar + Topbar + Toaster).
// - Only admins enter: needs localStorage adminToken, or a logged-in user
//   with role "admin". Everyone else is redirected to /admin/login.
// - /admin/login renders bare (no shell) so the login form stays clean.
// - Owns: sidebar collapse (persisted), mobile drawer, dark/light theme
//   (persisted, toggles .dark on <html>), badge counts, notifications and a
//   global search with a live results dropdown (Ctrl+K focuses it).
// ---------------------------------------------------------------------------

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { BedDouble, CalendarCheck, Users } from "lucide-react";
import Sidebar from "../components/admin/Sidebar";
import Topbar from "../components/admin/Topbar";
import { Toaster, toast } from "../components/admin/Toast";
import { adminFetch, normalizeBooking, DUMMY_BOOKINGS, DUMMY_USERS } from "../components/admin/dummy";
import { formatTimeAgo } from "../lib/format";

const TITLES = {
  "/admin": { title: "Dashboard", crumb: ["Admin", "Dashboard"] },
  "/admin/rooms": { title: "Room Management", crumb: ["Admin", "Rooms"] },
  "/admin/bookings": { title: "Bookings", crumb: ["Admin", "Bookings"] },
  "/admin/users": { title: "User Management", crumb: ["Admin", "Users"] },
  "/admin/reviews": { title: "Reviews", crumb: ["Admin", "Reviews"] },
  "/admin/messages": { title: "Contact Messages", crumb: ["Admin", "Messages"] },
  "/admin/payments": { title: "Payments", crumb: ["Admin", "Payments"] },
  "/admin/reports": { title: "Reports", crumb: ["Admin", "Reports"] },
  "/admin/settings": { title: "Settings", crumb: ["Admin", "Settings"] },
};

function readAdmin() {
  try {
    if (localStorage.getItem("adminToken")) {
      const raw = localStorage.getItem("adminUser");
      const u = raw ? JSON.parse(raw) : {};
      return { name: u.name || "Administrator", email: u.email || localStorage.getItem("adminEmail") || "" };
    }
    const raw = localStorage.getItem("user");
    if (raw) {
      const u = JSON.parse(raw);
      if (u.role === "admin") return { name: u.name, email: u.email };
    }
  } catch {
    /* ignore corrupt storage */
  }
  return null;
}

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [counts, setCounts] = useState({ pendingBookings: 0, unreadMessages: 0 });
  const [notifications, setNotifications] = useState([]);
  const [query, setQuery] = useState("");

  // Search index for global search (rooms + bookings + users, best-effort).
  const [index, setIndex] = useState({ rooms: [], bookings: [], users: [] });

  // Role guard — runs once on mount (same HTML server/client, no mismatch).
  // Syncing auth state from localStorage is the valid use case for setState
  // inside an effect, so the lint rule is silenced here on purpose.
  useEffect(() => {
    const a = readAdmin();
    if (!a) router.replace("/admin/login");
    else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAdmin(a);
      setAllowed(true);
    }
  }, [router]);

  // Theme: restore + apply .dark on <html> (external store sync — see above).
  useEffect(() => {
    const t = localStorage.getItem("hf-theme") || "light";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
    setCollapsed(localStorage.getItem("hf-sidebar") === "collapsed");
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("hf-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };
  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("hf-sidebar", next ? "collapsed" : "open");
  };

  // Badge counts + notifications (latest bookings & messages).
  useEffect(() => {
    if (!allowed) return;
    void (async () => {
      try {
        const [b, m] = await Promise.all([
          adminFetch("/api/bookings").catch(() => ({ data: DUMMY_BOOKINGS })),
          adminFetch("/api/admin/contacts").catch(() => ({ data: null })),
        ]);
        const bookings = (b.data || []).map((x) => normalizeBooking(x));
        const msgs = m.data || [];
        const pending = bookings.filter((x) => x.status === "pending").length;
        const unread = msgs.filter((x) => x.status !== "read").length;
        setCounts({ pendingBookings: pending, unreadMessages: unread });
        setNotifications(
          [
            ...bookings.slice(0, 3).map((x) => ({
              id: `n-${x.id}`,
              title: `${x.guest} booked ${x.room}`,
              text: `${x.status} • ${x.guests} guest${x.guests > 1 ? "s" : ""}`,
              time: formatTimeAgo(x.createdAt),
              exact: new Date(x.createdAt).toLocaleString("en-GB"),
              unread: x.status === "pending",
            })),
            ...msgs.slice(0, 2).map((x) => ({
              id: `m-${x._id || x.id}`,
              title: `Message from ${x.name || "a guest"}`,
              text: x.subject || x.message || "",
              time: formatTimeAgo(x.createdAt),
              exact: x.createdAt ? new Date(x.createdAt).toLocaleString("en-GB") : "",
              unread: x.status !== "read",
            })),
          ].slice(0, 5)
        );
      } catch {
        /* badges stay zero */
      }
    });
  }, [allowed, pathname]);

  // Global search index (rooms, bookings, users).
  useEffect(() => {
    if (!allowed) return;
    void (async () => {
      try {
        const [r, b, u] = await Promise.all([
          adminFetch("/api/rooms").catch(() => ({ data: [] })),
          adminFetch("/api/bookings").catch(() => ({ data: DUMMY_BOOKINGS })),
          adminFetch("/api/admin/users").catch(() => ({ data: DUMMY_USERS })),
        ]);
        setIndex({
          rooms: r.data || [],
          bookings: (b.data || []).map((x) => normalizeBooking(x)),
          users: u.data || u.users || [],
        });
      } catch {
        /* search stays empty */
      }
    });
  }, [allowed]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const out = [];
    index.rooms.forEach((r) =>
      String(r.name || "").toLowerCase().includes(q) &&
      out.push({ id: `r-${r._id || r.id}`, icon: BedDouble, label: r.name, sub: `${r.type || "Room"}`, href: "/admin/rooms" })
    );
    index.bookings.forEach((b) =>
      `${b.guest} ${b.room} ${b.id}`.toLowerCase().includes(q) &&
      out.push({ id: `b-${b.id}`, icon: CalendarCheck, label: `${b.guest} — ${b.room}`, sub: b.status, href: "/admin/bookings" })
    );
    index.users.forEach((u) =>
      `${u.name || ""} ${u.email || ""}`.toLowerCase().includes(q) &&
      out.push({ id: `u-${u._id || u.id}`, icon: Users, label: u.name, sub: u.email, href: "/admin/users" })
    );
    return out.slice(0, 7);
  }, [query, index]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminUser");
    toast.info("Logged out of the admin panel.");
    router.replace("/admin/login");
  };

  // Login page renders without the shell.
  if (pathname === "/admin/login") return <>{children}</>;

  // Guard pending: deterministic skeleton (same HTML server + client).
  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F1F5F9]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-[#2563EB]" />
      </div>
    );
  }

  const meta = TITLES[pathname] || { title: "Admin", crumb: ["Admin"] };

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar
        pathname={pathname}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        counts={counts}
        admin={admin}
        onLogout={handleLogout}
      />
      <div className={`transition-all duration-300 ${collapsed ? "lg:pl-[76px]" : "lg:pl-[260px]"}`}>
        <Topbar
          title={meta.title}
          breadcrumb={meta.crumb}
          onMenu={() => setMobileOpen(true)}
          search={query}
          onSearch={setQuery}
          notifications={notifications}
          onMarkNotificationsRead={() =>
            setNotifications((ns) => ns.map((n) => ({ ...n, unread: false })))
          }
          theme={theme}
          onToggleTheme={toggleTheme}
          admin={admin}
          onLogout={handleLogout}
        />
        {/* Global search results dropdown */}
        {query.trim().length >= 2 && (
          <div className="sticky top-16 z-20 mx-4 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:mx-6 dark:border-slate-700 dark:bg-slate-800">
            {results.length === 0 && (
              <p className="px-4 py-5 text-center text-[13px] text-slate-500">
                No matches for &ldquo;{query.trim()}&rdquo;.
              </p>
            )}
            {results.map((r) => {
              const Icon = r.icon;
              return (
                <Link
                  key={r.id}
                  href={r.href}
                  onClick={() => setQuery("")}
                  className="flex items-center gap-3 border-b border-slate-50 px-4 py-2.5 transition last:border-0 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 dark:bg-blue-500/10">
                    <Icon className="h-4 w-4 text-[#2563EB]" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-bold text-slate-800 dark:text-slate-100">
                      {r.label}
                    </span>
                    <span className="block truncate text-[12px] text-slate-500">{r.sub}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        )}
        <main className="p-4 sm:p-6">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
