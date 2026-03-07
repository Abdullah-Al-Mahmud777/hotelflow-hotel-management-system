"use client";

import { useRouter } from "next/navigation";

export default function AdminSidebar({ activeTab, setActiveTab, adminEmail, onClose }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    router.push("/admin/login");
  };

  const handleMenuClick = (tabId) => {
    setActiveTab(tabId);
    if (onClose) onClose();
  };

  const menuItems = [
    { id: "analytics", label: "Analytics", icon: "📊" },
    { id: "rooms", label: "Room Management", icon: "🏨" },
    { id: "bookings", label: "Bookings", icon: "📅" },
    { id: "users", label: "User Management", icon: "👥" },
    { id: "reviews", label: "Reviews", icon: "⭐" },
    { id: "contacts", label: "Contact Messages", icon: "📧" }
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-full">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-blue-400">HotelFlow</h1>
        <p className="text-sm text-gray-400 mt-1">Admin Panel</p>
      </div>

      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-lg">👤</span>
          </div>
          <div>
            <p className="text-sm font-medium">{adminEmail}</p>
            <p className="text-xs text-gray-400">Administrator</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  activeTab === item.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition"
        >
          <span className="text-xl">🚪</span>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
