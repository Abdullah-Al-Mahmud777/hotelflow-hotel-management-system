"use client";

import { useState, useEffect } from "react";
import { api } from "../../../lib/api";
import { getApiUrl } from "../../../lib/apiUrl";

export default function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.getBookings();
      setBookings(response.data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      const adminEmail = localStorage.getItem("adminEmail");
      
      const response = await fetch(getApiUrl(`/api/bookings/${bookingId}/status`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, adminEmail })
      });

      if (response.ok) {
        fetchBookings();
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
    }
  };

  const handleDelete = async (bookingId) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    
    try {
      const response = await fetch(getApiUrl(`/api/bookings/${bookingId}`), {
        method: "DELETE"
      });

      if (response.ok) {
        fetchBookings();
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800"
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  const filteredBookings = filter === "all" 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  if (loading) {
    return <div className="text-center py-8">Loading bookings...</div>;
  }

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Booking Management</h2>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 sm:px-4 py-2 rounded-lg transition text-sm ${
              filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            All ({bookings.length})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-3 sm:px-4 py-2 rounded-lg transition text-sm ${
              filter === "pending" ? "bg-yellow-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            Pending ({bookings.filter(b => b.status === "pending").length})
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-3 sm:px-4 py-2 rounded-lg transition text-sm ${
              filter === "approved" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            Approved ({bookings.filter(b => b.status === "approved").length})
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Room</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Check-in</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Check-out</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking._id}>
                  <td className="px-3 sm:px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 max-w-[120px] sm:max-w-none truncate">{booking.guestName}</div>
                    <div className="text-xs sm:text-sm text-gray-500 truncate">{booking.guestEmail}</div>
                    <div className="text-xs sm:text-sm text-gray-500">{booking.guestPhone}</div>
                    <div className="md:hidden text-xs text-gray-500 mt-1">
                      {booking.room?.name || "N/A"}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 hidden md:table-cell">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.room?.name || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.room?.type || "N/A"}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                    {new Date(booking.checkIn).toLocaleDateString()}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                    {new Date(booking.checkOut).toLocaleDateString()}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${booking.totalPrice}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex flex-col gap-1">
                      {booking.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(booking._id, "approved")}
                            className="text-green-600 hover:text-green-800 font-medium text-xs sm:text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(booking._id, "rejected")}
                            className="text-red-600 hover:text-red-800 font-medium text-xs sm:text-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(booking._id)}
                        className="text-gray-600 hover:text-gray-800 font-medium text-xs sm:text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredBookings.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No bookings found
          </div>
        )}
      </div>
    </div>
  );
}
