"use client";

import { useState, useEffect } from "react";

export default function TestImagePage() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/rooms/featured')
      .then(res => res.json())
      .then(data => {
        console.log('Rooms data:', data);
        setRooms(data.data || []);
      })
      .catch(err => console.error('Error:', err));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Image Display</h1>
      
      <div className="space-y-4">
        {rooms.map((room) => (
          <div key={room._id} className="border p-4 rounded">
            <h2 className="font-bold text-lg">{room.name}</h2>
            <p className="text-sm text-gray-600">ID: {room._id}</p>
            <p className="text-sm text-gray-600">Image URL: {room.image || 'No image'}</p>
            
            {room.image && (
              <div className="mt-2">
                <p className="text-sm font-medium mb-2">Image (img tag):</p>
                <img 
                  src={room.image} 
                  alt={room.name}
                  className="w-64 h-48 object-cover border"
                  onError={(e) => {
                    console.error('Image failed to load:', room.image);
                    e.target.style.border = '2px solid red';
                  }}
                  onLoad={() => console.log('Image loaded:', room.image)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
