"use client";
import { useState } from "react";

export default function TestAPI() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkBackend = async () => {
    setLoading(true);
    setError(null);
    try {
      // আপনার দেওয়া ব্যাকএন্ড ইউআরএল
      const res = await fetch("https://hotelflow-hotel-management-system.vercel.app/");
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError("Backend connection failed!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "50px", textAlign: "center", fontFamily: "Arial" }}>
      <h1>HotelFlow Connection Test</h1>
      <button 
        onClick={checkBackend}
        style={{ padding: "10px 20px", cursor: "pointer", backgroundColor: "#0070f3", color: "white", border: "none", borderRadius: "5px" }}
      >
        {loading ? "Checking..." : "Click to Test Backend"}
      </button>

      <div style={{ marginTop: "20px", textAlign: "left", display: "inline-block" }}>
        {data && (
          <div style={{ color: "green", border: "1px solid green", padding: "10px" }}>
            <h3>✅ Response Received:</h3>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
        {error && (
          <div style={{ color: "red", border: "1px solid red", padding: "10px" }}>
            <h3>❌ Error:</h3>
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}