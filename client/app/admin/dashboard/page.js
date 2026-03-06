"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "../components/AdminSidebar";
import RoomManagement from "../components/RoomManagement";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("rooms");
  const [adminEmail, setAdminEmail] = useState("");

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
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} adminEmail={adminEmail} />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {activeTab === "rooms" && <RoomManagement />}
          {activeTab === "bookings" && <div className="text-gray-600">Bookings management coming soon...</div>}
          {activeTab === "analytics" && <div className="text-gray-600">Analytics coming soon...</div>}
        </div>
      </main>
    </div>
  );
}
