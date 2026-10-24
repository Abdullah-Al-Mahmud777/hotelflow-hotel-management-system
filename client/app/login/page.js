"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "../components/Loading";
import { getApiUrl } from "../../lib/apiUrl";
import { safeRedirect, setSession, setAdminSession, clearAdminSession } from "../lib/auth";

const MODES = {
  user: {
    label: "User Login",
    heading: "Welcome Back",
    subheading: "Login to your HotelFlow account",
    submit: "Login",
    fallback: "/user/dashboard",
  },
  admin: {
    label: "Admin Login",
    heading: "Admin Login",
    subheading: "Access the HotelFlow admin panel",
    submit: "Login to Admin Panel",
    fallback: "/admin",
  },
};

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("user");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [demoAccounts, setDemoAccounts] = useState([]);
  const [demoEnabled, setDemoEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Post-login destination (?redirect=...), read client-side to avoid a
  // Suspense boundary. Validated same-origin on use (see lib/auth).
  const [redirect, setRedirect] = useState("");

  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search).get("redirect");
      if (q) setRedirect(q);
    } catch {
      /* keep default */
    }
  }, []);

  // Fetch the demo account details from the backend instead of hardcoding
  // credentials in the client bundle. The endpoint only exposes demo users.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(getApiUrl("/api/auth/demo-credentials"), {
          cache: "no-store",
        });
        const data = await res.json();
        if (cancelled || !data?.enabled) return;
        const accounts = Array.isArray(data.accounts) ? data.accounts : [];
        setDemoAccounts(accounts);
        setDemoEnabled(true);
        const current = accounts.find((a) => a.role === "user");
        if (current) {
          setFormData({ email: current.email, password: current.password });
        }
      } catch {
        /* demo card stays hidden when the API is unreachable */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const switchMode = (next) => {
    if (next === mode) return;
    setMode(next);
    setError("");
    const account = demoAccounts.find((a) => a.role === next);
    setFormData(
      account
        ? { email: account.email, password: account.password }
        : { email: "", password: "" }
    );
  };

  const applyDemo = (account) => {
    setMode(account.role);
    setError("");
    setFormData({ email: account.email, password: account.password });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch(getApiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...formData, role: mode }),
      });

      const data = await response.json();

      if (response.ok) {
        // Shared session powers every page; admin keys power the admin shell.
        setSession(data.token, data.user);
        if (mode === "admin") {
          setAdminSession(data.token, data.user);
        } else {
          clearAdminSession();
        }

        router.push(safeRedirect(redirect, MODES[mode].fallback));
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const copy = MODES[mode];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-black mb-2">{copy.heading}</h1>
          <p className="text-black">{copy.subheading}</p>
        </div>

        {/* Separate Admin / User login options */}
        <div className="grid grid-cols-2 gap-2 mb-6 rounded-xl bg-gray-100 p-1">
          {Object.entries(MODES).map(([key, value]) => (
            <button
              key={key}
              type="button"
              onClick={() => switchMode(key)}
              aria-pressed={mode === key}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                mode === key
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-700 hover:bg-white"
              }`}
            >
              {value.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-semibold flex items-center justify-center"
          >
            {loading ? <LoadingSpinner size="sm" text="" /> : copy.submit}
          </button>
        </form>

        {demoEnabled && demoAccounts.length > 0 && (
          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-900 mb-3">
              Demo Login Credentials
            </p>
            <div className="space-y-3">
              {demoAccounts.map((account) => (
                <div
                  key={account.role}
                  className="rounded-lg border border-blue-200 bg-white p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                      {account.label}
                    </p>
                    <button
                      type="button"
                      onClick={() => applyDemo(account)}
                      className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      Use
                    </button>
                  </div>
                  <p className="mt-1 break-all text-sm text-gray-800">
                    <span className="font-medium">Email:</span> {account.email}
                  </p>
                  <p className="break-all text-sm text-gray-800">
                    <span className="font-medium">Password:</span> {account.password}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-blue-800">
              Passwords are hashed in the database. These accounts are for testing only.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
