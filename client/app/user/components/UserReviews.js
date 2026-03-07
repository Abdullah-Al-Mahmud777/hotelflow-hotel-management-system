"use client";

export default function UserReviews({ reviews }) {
  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">My Reviews</h2>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4">⭐</div>
            <p className="text-gray-500">No reviews yet</p>
            <p className="text-gray-400 text-sm mt-2">
              Write a review after your booking is approved
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Room Image */}
                {review.room?.image && (
                  <div className="sm:w-32 h-24 rounded-lg overflow-hidden bg-gray-200">
                    <img 
                      src={review.room.image} 
                      alt={review.room.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Review Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {review.room?.name}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(review.status)}`}>
                      {review.status}
                    </span>
                  </div>

                  {/* Star Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-xl ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                        ⭐
                      </span>
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-gray-700 mb-3">{review.comment}</p>

                  {/* Date */}
                  <p className="text-gray-500 text-sm mb-2">
                    {new Date(review.createdAt).toLocaleDateString()} at {new Date(review.createdAt).toLocaleTimeString()}
                  </p>

                  {/* Status Messages */}
                  {review.status === 'pending' && (
                    <div className="flex items-center gap-2 text-yellow-600 text-sm bg-yellow-50 px-3 py-2 rounded-lg">
                      <span>⏳</span>
                      <span>Waiting for admin approval</span>
                    </div>
                  )}
                  {review.status === 'approved' && review.approvedBy && (
                    <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg">
                      <span>✅</span>
                      <span>Approved by {review.approvedBy}</span>
                    </div>
                  )}
                  {review.status === 'rejected' && (
                    <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                      <span>❌</span>
                      <span>This review was not approved</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
