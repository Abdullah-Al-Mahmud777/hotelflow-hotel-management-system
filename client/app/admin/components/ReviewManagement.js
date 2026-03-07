"use client";

import { useState, useEffect } from "react";
import { getApiUrl } from "../../../lib/apiUrl";

export default function ReviewManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      
      const response = await fetch(getApiUrl('/api/admin/reviews'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setReviews(data.data);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReview = async (reviewId) => {
    try {
      const token = localStorage.getItem("adminToken");
      
      const response = await fetch(getApiUrl(`/api/admin/reviews/${reviewId}/status`), {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'approved' })
      });

      if (response.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error("Error approving review:", error);
    }
  };

  const handleRejectReview = async (reviewId) => {
    if (!confirm("Are you sure you want to reject this review?")) return;
    
    try {
      const token = localStorage.getItem("adminToken");
      
      const response = await fetch(getApiUrl(`/api/admin/reviews/${reviewId}/status`), {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'rejected' })
      });

      if (response.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error("Error rejecting review:", error);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    
    try {
      const token = localStorage.getItem("adminToken");
      
      const response = await fetch(getApiUrl(`/api/reviews/${reviewId}`), {
        method: "DELETE",
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredReviews = reviews.filter(review => {
    if (filter === "all") return true;
    if (filter === "pending") return review.status === 'pending';
    if (filter === "approved") return review.status === 'approved';
    if (filter === "rejected") return review.status === 'rejected';
    return review.rating === parseInt(filter);
  });

  if (loading) {
    return <div className="text-center py-8">Loading reviews...</div>;
  }

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Review Management</h2>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg transition text-sm ${
              filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            All ({reviews.length})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-lg transition text-sm ${
              filter === "pending" ? "bg-yellow-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            Pending ({reviews.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-4 py-2 rounded-lg transition text-sm ${
              filter === "approved" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            Approved ({reviews.filter(r => r.status === 'approved').length})
          </button>
          <button
            onClick={() => setFilter("rejected")}
            className={`px-4 py-2 rounded-lg transition text-sm ${
              filter === "rejected" ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            Rejected ({reviews.filter(r => r.status === 'rejected').length})
          </button>
          {[5, 4, 3, 2, 1].map(rating => (
            <button
              key={rating}
              onClick={() => setFilter(rating.toString())}
              className={`px-4 py-2 rounded-lg transition text-sm ${
                filter === rating.toString() ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              {rating}⭐ ({reviews.filter(r => r.rating === rating).length})
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No reviews found
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    {review.user?.avatar ? (
                      <img 
                        src={review.user.avatar} 
                        alt={review.user.name} 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-lg">
                        {review.user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {review.user?.name || 'Unknown User'}
                        </h3>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-lg ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                              ⭐
                            </span>
                          ))}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(review.status)}`}>
                          {review.status}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        Room: <span className="font-medium">{review.room?.name || 'N/A'}</span>
                      </p>
                      
                      <p className="text-gray-700 mb-3">{review.comment}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{new Date(review.createdAt).toLocaleTimeString()}</span>
                        {review.approvedBy && (
                          <>
                            <span>•</span>
                            <span>Approved by: {review.approvedBy}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex sm:flex-col gap-2">
                  {review.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApproveReview(review._id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectReview(review._id)}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm font-medium"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDeleteReview(review._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
