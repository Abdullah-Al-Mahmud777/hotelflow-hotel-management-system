"use client";

import { useState } from "react";

export default function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const testBackend = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      console.log('Testing backend:', backendUrl);
      
      const res = await fetch(backendUrl);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err.message || "Backend connection failed!");
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
          🏨 HotelFlow
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Hotel Management System
        </p>

        <div className="space-y-4">
          <button
            onClick={testBackend}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
          >
            {loading ? "Testing Connection..." : "🔌 Test Backend Connection"}
          </button>

          {data && (
            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 animate-fade-in">
              <h3 className="text-xl font-semibold text-green-800 mb-3 flex items-center">
                <span className="mr-2">✅</span> Backend Connected!
              </h3>
              <div className="bg-white rounded p-4 overflow-auto">
                <pre className="text-sm text-gray-700">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6 animate-fade-in">
              <h3 className="text-xl font-semibold text-red-800 mb-3 flex items-center">
                <span className="mr-2">❌</span> Connection Failed
              </h3>
              <p className="text-red-700">{error}</p>
              <div className="mt-4 text-sm text-gray-600">
                <p className="font-semibold">Troubleshooting:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Check if backend is deployed</li>
                  <li>Verify NEXT_PUBLIC_API_URL environment variable</li>
                  <li>Check CORS settings on backend</li>
                  <li>Open browser console for more details</li>
                </ul>
              </div>
            </div>
          )}

          {!data && !error && !loading && (
            <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                📋 Instructions
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>Click the button above to test backend connection</li>
                <li>Make sure your backend is deployed on Vercel</li>
                <li>Verify environment variables are set correctly</li>
                <li>Check that CORS is configured properly</li>
              </ol>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Environment Info:
          </h3>
          <div className="bg-gray-50 rounded p-3 text-xs font-mono text-gray-600">
            <p>Backend URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}</p>
            <p>Environment: {process.env.NODE_ENV || 'development'}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
