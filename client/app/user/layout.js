"use client";

// All /user/* pages require a valid user session. Admins are redirected to
// the admin dashboard by RequireAuth, and logged-out visitors to /login.
import RequireAuth from "../components/hotelflow/RequireAuth";

export default function UserLayout({ children }) {
  return <RequireAuth roles={["user"]}>{children}</RequireAuth>;
}
