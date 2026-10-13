"use client";

import { useEffect, useState } from "react";
import { User, ShieldCheck, Lock } from "lucide-react";
import { useToast } from "./ui";
import Preferences from "./Preferences";
import { updateProfile, updatePassword } from "../../../lib/dashboardApi";

const inputCls =
  "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15";

export default function UserProfile({ user, onUpdate }) {
  const toast = useToast();
  const [formData, setFormData] = useState({ name: "", phone: "", avatar: "" });
  const [loading, setLoading] = useState(false);
  const [pwd, setPwd] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    setFormData({ name: user?.name || "", phone: user?.phone || "", avatar: user?.avatar || "" });
  }, [user?.name, user?.phone, user?.avatar]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await updateProfile(formData);
      const merged = { ...(user || {}), ...(typeof updated === "object" ? updated : {}), ...formData };
      try {
        localStorage.setItem("user", JSON.stringify({ ...(JSON.parse(localStorage.getItem("user") || "{}")), ...merged }));
      } catch { /* storage optional */ }
      toast("Profile updated successfully", "success");
      onUpdate?.(merged);
    } catch (err) {
      toast(err?.message || "Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwd.newPassword !== pwd.confirm) {
      toast("New passwords do not match", "error");
      return;
    }
    if (pwd.newPassword.length < 6) {
      toast("New password must be at least 6 characters", "error");
      return;
    }
    setPwdLoading(true);
    try {
      await updatePassword({ currentPassword: pwd.currentPassword, newPassword: pwd.newPassword });
      toast("Password updated successfully", "success");
      setPwd({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      toast(err?.message || "Password update failed", "error");
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Profile Settings</h2>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Personal information */}
        <form onSubmit={handleSubmit} className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
            <User className="h-4 w-4" /> Personal Information
          </h3>
          <div className="space-y-5">
            <div>
              <label htmlFor="profile-name" className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
              <input id="profile-name" type="text" name="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email Address</label>
              <input type="email" value={user?.email || ""} disabled className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500" />
              <p className="mt-1 text-xs text-slate-400">Email cannot be changed</p>
            </div>
            <div>
              <label htmlFor="profile-phone" className="mb-1.5 block text-sm font-medium text-slate-700">Phone Number</label>
              <input id="profile-phone" type="tel" name="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required className={inputCls} />
            </div>
            <div>
              <label htmlFor="profile-avatar" className="mb-1.5 block text-sm font-medium text-slate-700">
                Avatar URL <span className="font-normal text-slate-400">(Optional)</span>
              </label>
              <input id="profile-avatar" type="url" name="avatar" value={formData.avatar} onChange={(e) => setFormData({ ...formData, avatar: e.target.value })} placeholder="https://example.com/avatar.jpg" className={inputCls} />
              {formData.avatar && /^https?:\/\//.test(formData.avatar) && (
                <div className="mt-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={formData.avatar} alt="Avatar preview" className="h-20 w-20 rounded-full border border-slate-200 object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                </div>
              )}
            </div>
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:bg-slate-300">
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </form>

        {/* Security */}
        <div className="space-y-5">
          <form onSubmit={handlePassword} className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
              <Lock className="h-4 w-4" /> Change Password
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="pwd-current" className="mb-1.5 block text-sm font-medium text-slate-700">Current Password</label>
                <input id="pwd-current" type="password" value={pwd.currentPassword} onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })} required autoComplete="current-password" className={inputCls} />
              </div>
              <div>
                <label htmlFor="pwd-new" className="mb-1.5 block text-sm font-medium text-slate-700">New Password (min 6 chars)</label>
                <input id="pwd-new" type="password" value={pwd.newPassword} onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })} required minLength={6} autoComplete="new-password" className={inputCls} />
              </div>
              <div>
                <label htmlFor="pwd-confirm" className="mb-1.5 block text-sm font-medium text-slate-700">Confirm New Password</label>
                <input id="pwd-confirm" type="password" value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} required autoComplete="new-password" className={inputCls} />
              </div>
              <button type="submit" disabled={pwdLoading} className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50">
                {pwdLoading ? "Updating…" : "Update Password"}
              </button>
            </div>
          </form>

          <section aria-label="Account security" className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
              <ShieldCheck className="h-4 w-4" /> Security
            </h3>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Role</dt><dd className="font-medium capitalize text-slate-900">{user?.role || "user"}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Email</dt><dd className="font-medium text-slate-900">{user?.email || "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Sessions</dt><dd className="font-medium text-slate-900">JWT (30-day expiry)</dd></div>
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-slate-400">
              Passwords are hashed with bcrypt. Changing your password keeps you signed in on this device.
            </p>
          </section>

          <Preferences />
        </div>
      </div>
    </div>
  );
}
