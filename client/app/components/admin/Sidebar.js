"use client";

// ---------------------------------------------------------------------------
// HotelFlow admin Sidebar — dark navy (#0F172A), fixed 260px, collapsible to
// an icons-only rail with tooltips; slide-in drawer on mobile.
// Bottom footer has pb-16 so the dev badge never covers the Logout button.
// ---------------------------------------------------------------------------

import Link from "next/link";
import {
  Building2,
  LayoutDashboard,
  BedDouble,
  CalendarCheck,
  Users,
  Star,
  Mail,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, match: ["/admin"] },
  { label: "Rooms", href: "/admin/rooms", icon: BedDouble, match: ["/admin/rooms"] },
  { label: "Bookings", href: "/admin/bookings", icon: CalendarCheck, match: ["/admin/bookings"], badgeKey: "pendingBookings" },
  { label: "Users", href: "/admin/users", icon: Users, match: ["/admin/users"] },
  { label: "Reviews", href: "/admin/reviews", icon: Star, match: ["/admin/reviews"] },
  { label: "Messages", href: "/admin/messages", icon: Mail, match: ["/admin/messages"], badgeKey: "unreadMessages" },
  { label: "Payments", href: "/admin/payments", icon: CreditCard, match: ["/admin/payments"] },
  { label: "Reports", href: "/admin/reports", icon: BarChart3, match: ["/admin/reports"] },
  { label: "Settings", href: "/admin/settings", icon: Settings, match: ["/admin/settings"] },
];

function initials(name) {
  return String(name || "A")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function SidebarBody({ pathname, collapsed, counts, admin, onLogout, onToggleCollapse, onNavigate }) {
  const isActive = (item) =>
    item.match.some((p) => (p === "/admin" ? pathname === "/admin" : pathname === p || pathname.startsWith(p + "/")));
  return (
    <div className="flex h-full flex-col bg-[#0F172A] text-slate-300">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 pt-5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#2563EB]">
          <Building2 className="h-5 w-5 text-white" />
        </span>
        {!collapsed && (
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-extrabold tracking-wide text-white">
              HotelFlow
            </span>
            <span className="block text-[11px] font-medium text-slate-400">Admin Panel</span>
          </span>
        )}
      </div>

      {/* Profile block */}
      <div className="mx-3 mt-5 flex items-center gap-2.5 rounded-xl bg-white/5 p-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#2563EB] text-[13px] font-black text-white">
          {initials(admin?.name)}
        </span>
        {!collapsed && (
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-bold text-white">
              {admin?.name || "Administrator"}
            </span>
            <span className="block truncate text-[11px] text-slate-400">
              {admin?.email || ""}
            </span>
            <span className="mt-1 inline-block rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-400">
              Administrator
            </span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="mt-4 flex-1 space-y-1 overflow-y-auto px-3" aria-label="Admin navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          const badge = item.badgeKey ? counts?.[item.badgeKey] : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              aria-current={active ? "page" : undefined}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold transition ${
                collapsed ? "justify-center" : ""
              } ${
                active
                  ? "bg-[#2563EB] text-white shadow-[0_4px_14px_rgba(37,99,235,0.4)]"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              {/* Left accent bar for the active item */}
              {active && (
                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-white" />
              )}
              <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
              {!collapsed && <span className="flex-1">{item.label}</span>}
              {!collapsed && badge > 0 && (
                <span className="grid min-h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1.5 text-[11px] font-black text-white">
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
              {collapsed && badge > 0 && (
                <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white">
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
              {/* Tooltip in rail mode */}
              {collapsed && (
                <span className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-white shadow-xl group-hover:block">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle (desktop) */}
      <div className="hidden px-3 pb-2 lg:block">
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 px-3 py-2.5 text-[12.5px] font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <>
              <PanelLeftClose className="h-5 w-5" /> Collapse
            </>
          )}
        </button>
      </div>

      {/* Footer: Logout with pb-16 so floating dev tools never cover it */}
      <div className="border-t border-white/10 px-3 pb-16 pt-3">
        <button
          type="button"
          onClick={onLogout}
          className={`flex w-full items-center gap-3 rounded-xl bg-red-500/10 px-3 py-2.5 text-[13.5px] font-bold text-red-400 transition hover:bg-red-500/20 hover:text-red-300 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.75} />
          {!collapsed && "Logout"}
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({
  pathname,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  counts,
  admin,
  onLogout,
}) {
  return (
    <>
      {/* Desktop: fixed rail */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden transition-all duration-300 lg:block ${
          collapsed ? "w-[76px]" : "w-[260px]"
        }`}
      >
        <SidebarBody
          pathname={pathname}
          collapsed={collapsed}
          counts={counts}
          admin={admin}
          onLogout={onLogout}
          onToggleCollapse={onToggleCollapse}
        />
      </aside>

      {/* Mobile: slide-in drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <div className="absolute inset-0 bg-black/55" onClick={onCloseMobile} />
          <aside className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] shadow-2xl">
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close menu"
              className="absolute right-3 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarBody
              pathname={pathname}
              collapsed={false}
              counts={counts}
              admin={admin}
              onLogout={onLogout}
              onNavigate={onCloseMobile}
            />
          </aside>
        </div>
      )}
    </>
  );
}
