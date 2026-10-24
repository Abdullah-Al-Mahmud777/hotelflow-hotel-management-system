"use client";

// ---------------------------------------------------------------------------
// HotelFlow Navbar — full-width purple bar, sticky on scroll.
// Hotels-only: single Hotels tab (active with underline).
// Keeps: HotelFlow brand, logged-in username display, Logout button.
// ---------------------------------------------------------------------------

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { logout } from "../../lib/auth";
import {
  Building2,
  BedDouble,
  Search,
  ChevronDown,
  Menu,
  X,
  LogOut,
  UserCircle,
} from "lucide-react";
import { BRAND } from "./data";

const NAV_LINKS = [
  { label: "Hotels", icon: Building2, href: "/", match: ["/"] },
  { label: "Rooms", icon: BedDouble, href: "/rooms", match: ["/rooms"] },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  // Read login state in an effect (not in the useState initializer) so the
  // server and the first client render both output logged-out HTML — this
  // avoids a React hydration mismatch. The lint rule below is intentionally
  // silenced: syncing an external store (localStorage) is its valid use case.
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  // Mounted flag: the auth area renders only after mount so logged-in HTML
  // never flashes the logged-out state (and SSR stays mismatch-free).
  const [mounted, setMounted] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);
  // Active when the path matches exactly, or sits under it (e.g. /rooms/123
  // keeps Rooms highlighted). "/" itself stays exact so it never hijacks.
  const isActive = (link) =>
    link.match.some((p) => pathname === p || (p !== "/" && pathname.startsWith(p + "/")));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch {
      setUser(null);
    }
  }, []);

  // Close the profile dropdown on outside click / Escape.
  useEffect(() => {
    if (!dropOpen) return;
    const onClick = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    const onEsc = (e) => {
      if (e.key === "Escape") setDropOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [dropOpen]);

  const handleLogout = () => {
    logout();
    setUser(null);
    router.push("/");
  };

  // Only real uploaded URLs render as photos; otherwise show initials
  // (no stock people photos anywhere on the site).
  const avatarUrl =
    user?.avatar && /^https?:\/\//.test(user.avatar) ? user.avatar : null;
  const initial = ((user?.name || "?").trim().charAt(0) || "?").toUpperCase();

  return (
    <header
      className="sticky top-0 z-50 text-white shadow-[0_2px_12px_rgba(30,35,110,0.25)]"
      style={{ backgroundColor: BRAND }}
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Left: logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-lg font-black" style={{ color: BRAND }}>
              H
            </span>
            <span className="text-lg font-extrabold tracking-wide">
              HotelFlow
            </span>
          </Link>

          {/* Center: links */}
          <nav className="hidden items-center gap-7 text-sm font-medium text-white/85 lg:flex">
            {NAV_LINKS.map(({ label, icon: Icon, href, match }) => {
              const active = isActive({ match });
              return (
                <Link
                  key={label}
                  href={href}
                  className={`relative flex items-center gap-1.5 py-1 transition hover:text-white ${
                    active ? "font-semibold text-white" : ""
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={2.2} />
                  {label}
                  {active && (
                    <span className="absolute -bottom-1 left-0 right-0 h-[2.5px] rounded-full bg-white" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: search + user + logout */}
          <div className="hidden items-center gap-2.5 sm:flex">
            <a
              href="#results"
              aria-label="Search"
              className="grid h-9 w-9 place-items-center rounded-full bg-white/15 transition hover:bg-white/25"
            >
              <Search className="h-[17px] w-[17px]" />
            </a>
            {!mounted ? (
              /* Fixed-size placeholder: no layout shift, no login flicker */
              <span className="hidden h-9 w-24 sm:block" aria-hidden />
            ) : user ? (
              <div className="relative" ref={dropRef}>
                <button
                  type="button"
                  onClick={() => setDropOpen(!dropOpen)}
                  aria-label="Account menu"
                  aria-expanded={dropOpen}
                  className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition hover:bg-white/10"
                >
                  {avatarUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={avatarUrl}
                      alt={user.name}
                      className="h-9 w-9 rounded-full object-cover ring-2 ring-white/70"
                    />
                  ) : (
                    <span
                      aria-label={user.name}
                      className="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-sm font-black text-white ring-2 ring-white/70"
                    >
                      {initial}
                    </span>
                  )}
                  <span className="max-w-[110px] truncate text-sm font-semibold">{user.name}</span>
                  <ChevronDown className={`h-4 w-4 opacity-80 transition-transform ${dropOpen ? "rotate-180" : ""}`} />
                </button>
                {dropOpen && (
                  <div className="absolute right-0 top-12 w-52 animate-fade-in overflow-hidden rounded-2xl bg-white py-1.5 text-slate-800 shadow-2xl">
                    <Link
                      href="/user/dashboard"
                      onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold transition hover:bg-slate-50"
                    >
                      <UserCircle className="h-4 w-4 text-slate-400" /> My Account
                    </Link>
                    <div className="my-1.5 border-t border-slate-100" />
                    <button
                      type="button"
                      onClick={() => {
                        setDropOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-2 py-2 text-sm font-semibold hover:underline"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-white px-4 py-2 text-sm font-bold transition hover:bg-white/90 active:scale-95"
                  style={{ color: BRAND }}
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="grid h-10 w-10 place-items-center rounded-lg bg-white/15 sm:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile secondary nav */}
        <nav className="no-scrollbar flex gap-5 overflow-x-auto pb-3 text-[13px] font-medium text-white/85 lg:hidden">
          {NAV_LINKS.map(({ label, icon: Icon, href, match }) => {
            const active = isActive({ match });
            return (
              <Link
                key={label}
                href={href}
                className={`flex shrink-0 items-center gap-1.5 ${active ? "font-semibold text-white" : ""}`}
              >
                <Icon className="h-4 w-4" /> {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile dropdown: user + logout */}
      {menuOpen && (
        <div className="border-t border-white/20 px-4 py-3 sm:hidden">
          {user ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  {avatarUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={avatarUrl} alt={user.name} className="h-8 w-8 rounded-full object-cover ring-2 ring-white/70" />
                  ) : (
                    <span aria-label={user.name} className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-xs font-black text-white ring-2 ring-white/70">
                      {initial}
                    </span>
                  )}
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-2 text-[13px] font-bold"
                >
                  <LogOut className="h-3.5 w-3.5" /> Logout
                </button>
              </div>
              <div className="flex gap-2 pt-1">
                <Link href="/user/dashboard" className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/15 py-2 text-[13px] font-bold" onClick={() => setMenuOpen(false)}>
                  <UserCircle className="h-4 w-4" /> My Account
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link href="/login" className="flex-1 rounded-lg bg-white/15 py-2 text-center text-sm font-bold" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link href="/register" className="flex-1 rounded-lg bg-white py-2 text-center text-sm font-bold" style={{ color: BRAND }} onClick={() => setMenuOpen(false)}>
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
