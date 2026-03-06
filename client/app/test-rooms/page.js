"use client";

import { useState, useEffect } from "react";

export default function TestRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      console.log("Fetching from: http://localhost:5000/api/rooms/featured");
      const response = await fetch('http://localhost:5000/api/rooms/featured', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });
      
      console.log("Response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Rooms data:", data);
        setRooms(data.data || []);
      } else {
        setError("Failed to fetch rooms");
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Rooms Page</h1>
      <p className="mb-4">Total rooms: {rooms.length}</p>
      
      <div className="space-y-4">
        {rooms.map((room) => (
          <div key={room._id} className="border p-4 rounded">
            <h2 className="font-bold">{room.name}</h2>
            <p>ID: {room._id}</p>
            <p>Type: {room.type}</p>
            <p>Price: ${room.price}</p>
            <a 
              href={`/rooms/${room._id}`}
              className="text-blue-600 hover:underline"
            >
              View Details
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
