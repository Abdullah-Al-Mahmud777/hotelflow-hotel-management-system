"use client";

// ---------------------------------------------------------------------------
// HotelFlow admin Users (/admin/users) — table with role badges
// (Admin/Staff/Guest), Active/Blocked status toggle, search, pagination,
// delete with confirmation. Toast on every action.
// ---------------------------------------------------------------------------

import { useState, useMemo } from "react";
import { ShieldCheck, Trash2 } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import ConfirmModal from "../../components/admin/ConfirmModal";
import { toast } from "../../components/admin/Toast";
import { adminFetch, useAdminFetch, DUMMY_USERS } from "../../components/admin/dummy";
import { formatDateBD } from "../../lib/format";

const ROLE_STYLE = {
  admin: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
  staff: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  guest: "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
};

const roleLabel = (r) => (r === "admin" ? "Admin" : r === "staff" ? "Staff" : "Guest");

export default function AdminUsers() {
  const { data, loading, isFallback, setData } = useAdminFetch("/api/admin/users", DUMMY_USERS);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toggling, setToggling] = useState(null);

  const users = useMemo(
    () =>
      (data || []).map((u) => ({
        id: String(u._id || u.id),
        name: u.name || "User",
        email: u.email || "",
        phone: u.phone || "—",
        role: u.role || "user",
        status: u.status || "active",
        createdAt: u.createdAt,
        bookings: u.bookings ?? "—",
      })),
    [data]
  );

  const toggleStatus = async (user) => {
    const next = user.status === "active" ? "blocked" : "active";
    setToggling(user.id);
    try {
      await adminFetch(`/api/admin/users/${user.id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: next }),
      });
      setData((prev) => (prev || []).map((u) => (String(u._id || u.id) === user.id ? { ...u, status: next } : u)));
      toast.success(`${user.name} ${next === "active" ? "activated" : "blocked"}.`);
    } catch (err) {
      toast.error(`Could not update user (${err.message}).`);
    } finally {
      setToggling(null);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await adminFetch(`/api/admin/users/${deleting.id}`, { method: "DELETE" });
      setData((prev) => (prev || []).filter((u) => String(u._id || u.id) !== deleting.id));
      toast.success(`"${deleting.name}" deleted.`);
    } catch (err) {
      toast.error(`Could not delete user (${err.message}).`);
    } finally {
      setBusy(false);
      setDeleting(null);
    }
  };

  const columns = [
    { key: "name", label: "User", sortable: true, render: (u) => (
      <span className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#2563EB]/10 text-[12px] font-black text-[#2563EB]">
          {u.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
        </span>
        <span>
          <span className="block font-bold text-slate-900 dark:text-white">{u.name}</span>
          <span className="block text-[11.5px] text-slate-500">{u.email}</span>
        </span>
      </span>
    ) },
    { key: "phone", label: "Phone" },
    { key: "role", label: "Role", sortable: true, render: (u) => (
      <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-black ${ROLE_STYLE[u.role] || ROLE_STYLE.guest}`}>
        {roleLabel(u.role)}
      </span>
    ) },
    { key: "status", label: "Status", render: (u) => (
      <button
        type="button"
        disabled={toggling === u.id}
        onClick={() => toggleStatus(u)}
        title={u.status === "active" ? "Click to block" : "Click to activate"}
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black transition disabled:opacity-50 ${
          u.status === "active"
            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400"
            : "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-500/15 dark:text-red-400"
        }`}
      >
        <ShieldCheck className="h-3 w-3" />
        {toggling === u.id ? "…" : u.status === "active" ? "Active" : "Blocked"}
      </button>
    ) },
    { key: "createdAt", label: "Joined", sortable: true, render: (u) => formatDateBD(u.createdAt) || "—" },
    {
      key: "actions",
      label: "Actions",
      render: (u) => (
        <button type="button" onClick={() => setDeleting(u)} aria-label={`Delete ${u.name}`} className="grid h-8 w-8 place-items-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 dark:border-red-500/30">
          <Trash2 className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {isFallback && (
        <p className="inline-block rounded-full bg-amber-100 px-3 py-1 text-[11px] font-black uppercase text-amber-700">Sample data</p>
      )}
      <DataTable
        columns={columns}
        rows={users}
        loading={loading}
        searchKeys={["name", "email", "phone"]}
        searchPlaceholder="Search name, email or phone…"
        exportName="hotelFlow-users"
        printTitle="HotelFlow Users Report"
        emptyTitle="No users found"
      />
      <ConfirmModal
        open={!!deleting}
        title={`Delete "${deleting?.name}"?`}
        message="The user account will be removed permanently."
        confirmLabel="Delete"
        busy={busy}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
