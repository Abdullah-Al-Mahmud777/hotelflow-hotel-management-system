"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "../components/AdminSidebar";
import RoomManagement from "../components/RoomManagement";
import BookingManagement from "../components/BookingManagement";
import UserManagement from "../components/UserManagement";
import ReviewManagement from "../components/ReviewManagement";
import ContactManagement from "../components/ContactManagement";
import Analytics from "../components/Analytics";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("analytics");
  const [adminEmail, setAdminEmail] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const email = localStorage.getItem("adminEmail");
    
    if (!token) {
      router.push("/admin/login");
    } else {
      setAdminEmail(email || "");
    }
  }, [router]);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {sidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out`}>
        <AdminSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          adminEmail={adminEmail}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          {activeTab === "analytics" && <Analytics />}
          {activeTab === "rooms" && <RoomManagement />}
          {activeTab === "bookings" && <BookingManagement />}
          {activeTab === "users" && <UserManagement />}
          {activeTab === "reviews" && <ReviewManagement />}
          {activeTab === "contacts" && <ContactManagement />}
        </div>
      </main>
    </div>
  );
}
