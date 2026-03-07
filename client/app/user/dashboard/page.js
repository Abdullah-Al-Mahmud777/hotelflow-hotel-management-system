"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getApiUrl } from "../../../lib/apiUrl";
import UserSidebar from "../components/UserSidebar";
import Overview from "../components/Overview";
import UserBookings from "../components/UserBookings";
import UserReviews from "../components/UserReviews";
import UserProfile from "../components/UserProfile";

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));
    fetchUserData(token);
  }, [router]);

  const fetchUserData = async (token) => {
    try {
      setLoading(true);
      
      // Fetch all bookings
      const bookingsRes = await fetch(getApiUrl('/api/bookings'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const bookingsData = await bookingsRes.json();
      
      if (bookingsData.success) {
        // Filter user's bookings by user ID or email
        const userData = JSON.parse(localStorage.getItem('user'));
        const userBookings = bookingsData.data.filter(b => {
          // Check if booking is linked to user ID
          if (b.user && userData.id) {
            return b.user === userData.id || b.user._id === userData.id;
          }
          // Fallback to email matching
          return b.guestEmail === userData.email;
        });
        setBookings(userBookings);
      }

      // Fetch reviews
      const reviewsRes = await fetch(getApiUrl('/api/reviews/my-reviews'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const reviewsData = await reviewsRes.json();
      
      if (reviewsData.success) {
        setReviews(reviewsData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-lg shadow-lg"
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
        <UserSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          user={user}
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
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          {activeTab === "overview" && <Overview bookings={bookings} reviews={reviews} />}
          {activeTab === "bookings" && <UserBookings bookings={bookings} reviews={reviews} />}
          {activeTab === "reviews" && <UserReviews reviews={reviews} />}
          {activeTab === "profile" && <UserProfile user={user} onUpdate={handleUserUpdate} />}
        </div>
      </main>
    </div>
  );
}
