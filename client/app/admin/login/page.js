"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LoadingSpinner } from "../../components/Loading";
import { getApiUrl } from "../../../lib/apiUrl";
import { setSession, setAdminSession } from "../../lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [demo, setDemo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load demo admin credentials from the backend (never hardcoded here).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(getApiUrl("/api/auth/demo-credentials"), {
          cache: "no-store",
        });
        const data = await res.json();
        if (cancelled || !data?.enabled) return;
        const account = (data.accounts || []).find((a) => a.role === "admin");
        if (account) {
          setDemo(account);
          setFormData({ email: account.email, password: account.password });
        }
      } catch {
        /* credentials card stays hidden when the API is unreachable */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // extra guard against duplicate submissions
    setLoading(true);
    setError("");

    // fetch() throws ONLY on network-level failures (server down, wrong
    // port/host, offline, or a blocked CORS preflight) — never on HTTP
    // 4xx/5xx. So this try/catch isolates "cannot reach the server".
    let response;
    try {
      response = await fetch(getApiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...formData, role: "admin" }),
      });
    } catch (err) {
      setError(
        "Cannot reach the server. Please check your connection and try again."
      );
      console.error("Admin login network error:", err);
      setLoading(false);
      return;
    }

    // The body may be empty or non-JSON on some failures — parse defensively.
    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (response.ok && data?.token) {
      // Backend already enforces role: "admin"; double-check defensively.
      if (data.user?.role !== "admin") {
        setError("Access denied. Admin credentials required.");
        setLoading(false);
        return;
      }

      setSession(data.token, data.user);
      setAdminSession(data.token, data.user);
      router.push("/admin");
    } else if (response.status === 401) {
      setError("Invalid email or password.");
    } else if (response.status === 403) {
      setError(data?.message || "Access denied. Admin credentials required.");
    } else if (response.status >= 500) {
      setError("Server error. Please try again in a moment.");
    } else {
      // Generic, safe fallback — never surfaces raw backend internals.
      setError(data?.message || "Login failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
          <p className="text-gray-600">Access HotelFlow Admin Panel</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Admin Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="admin@hotelflow.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-semibold flex items-center justify-center"
          >
            {loading ? <LoadingSpinner size="sm" text="" /> : "Login to Admin Panel"}
          </button>
        </form>

        {demo && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-semibold text-blue-900 mb-2">Demo Admin Credentials:</p>
            <div className="space-y-1 text-sm text-blue-800">
              <p><span className="font-medium">Email:</span> {demo.email}</p>
              <p><span className="font-medium">Password:</span> {demo.password}</p>
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          Not an admin?{" "}
          <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
            Go to User Login
          </Link>
        </p>
      </div>
    </main>
  );
}
