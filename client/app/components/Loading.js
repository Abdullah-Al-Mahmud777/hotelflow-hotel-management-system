"use client";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Animated Hotel Icon */}
        <div className="mb-8 animate-bounce">
          <span className="text-8xl">🏨</span>
        </div>

        {/* Brand Name */}
        <h2 className="text-4xl font-bold text-gray-800 mb-6">
          Hotel<span className="text-blue-600">Flow</span>
        </h2>

        {/* Spinner */}
        <div className="flex justify-center mb-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
        </div>

        {/* Loading Text */}
        <p className="text-gray-600 text-lg animate-pulse">Loading your experience...</p>
      </div>
    </div>
  );
}

export function LoadingSpinner({ size = "md", text = "" }) {
  const sizes = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-3",
    lg: "w-16 h-16 border-4"
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`relative ${sizes[size]}`}>
        <div className="absolute inset-0 border-blue-200 rounded-full" style={{ borderWidth: 'inherit' }}></div>
        <div className="absolute inset-0 border-blue-600 rounded-full border-t-transparent animate-spin" style={{ borderWidth: 'inherit' }}></div>
      </div>
      {text && <p className="text-gray-600 animate-pulse">{text}</p>}
    </div>
  );
}

export function LoadingDots() {
  return (
    <div className="flex space-x-2">
      <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  );
}

export function LoadingBar() {
  return (
    <div className="w-full bg-blue-100 rounded-full h-2 overflow-hidden">
      <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse"></div>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
      <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-blue-100 rounded w-3/4"></div>
        <div className="h-4 bg-blue-100 rounded w-1/2"></div>
        <div className="h-4 bg-blue-100 rounded w-5/6"></div>
      </div>
    </div>
  );
}
