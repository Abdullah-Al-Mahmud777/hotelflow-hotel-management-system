"use client";

import { useRouter } from "next/navigation";

export default function UserBookings({ bookings, reviews }) {
  const router = useRouter();

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">My Bookings</h2>

      <div className="space-y-4">
        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4">📅</div>
            <p className="text-gray-500 mb-4">No bookings yet</p>
            <button
              onClick={() => router.push('/rooms')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Browse Rooms
            </button>
          </div>
        ) : (
          bookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Room Image */}
                {booking.room?.image && (
                  <div className="lg:w-48 h-32 lg:h-auto rounded-lg overflow-hidden bg-gray-200">
                    <img 
                      src={booking.room.image} 
                      alt={booking.room.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Booking Details */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {booking.room?.name || 'Room'}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {booking.room?.type || 'N/A'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium h-fit ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-600 text-sm">Check-in</p>
                      <p className="text-gray-900 font-medium">
                        {new Date(booking.checkIn).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Check-out</p>
                      <p className="text-gray-900 font-medium">
                        {new Date(booking.checkOut).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Guests</p>
                      <p className="text-gray-900 font-medium">{booking.numberOfGuests}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Total Price</p>
                      <p className="text-gray-900 font-medium text-lg">${booking.totalPrice}</p>
                    </div>
                  </div>

                  {booking.specialRequests && (
                    <div className="mb-4">
                      <p className="text-gray-600 text-sm">Special Requests</p>
                      <p className="text-gray-700">{booking.specialRequests}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {booking.status === 'approved' && !reviews.find(r => r.booking === booking._id) && (
                      <button
                        onClick={() => router.push(`/user/review/${booking._id}`)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                      >
                        ⭐ Write Review
                      </button>
                    )}
                    {booking.status === 'approved' && reviews.find(r => r.booking === booking._id) && (
                      <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                        ✅ Review submitted
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
