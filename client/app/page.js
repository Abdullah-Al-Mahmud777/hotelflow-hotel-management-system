"use client";
import { useState, useEffect } from 'react';

export default function MyComponent() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null; // অথবা কোনো লোডিং স্পিনার দিতে পারেন

  return (
    <div>
       {/* এখানে আপনার window বা date সংক্রান্ত কোড থাকবে */}
       {new Date().toLocaleTimeString()}
    </div>
  );
}