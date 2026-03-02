const mongoose = require('mongoose');
const Room = require('../models/Room');
require('dotenv').config();

const sampleRooms = [
  {
    name: "Ocean View Deluxe",
    type: "Deluxe",
    price: 150,
    description: "Spacious deluxe room with stunning ocean views and modern amenities",
    amenities: ["WiFi", "TV", "Mini Bar", "Ocean View", "Air Conditioning"],
    capacity: 2,
    images: [],
    availability: true,
    featured: true
  },
  {
    name: "Presidential Suite",
    type: "Suite",
    price: 450,
    description: "Luxurious presidential suite with separate living area and premium services",
    amenities: ["WiFi", "TV", "Mini Bar", "Jacuzzi", "Butler Service", "City View"],
    capacity: 4,
    images: [],
    availability: true,
    featured: true
  },
  {
    name: "Garden Deluxe",
    type: "Deluxe",
    price: 120,
    description: "Comfortable deluxe room overlooking beautiful garden landscapes",
    amenities: ["WiFi", "TV", "Mini Bar", "Garden View", "Balcony"],
    capacity: 2,
    images: [],
    availability: true,
    featured: true
  },
  {
    name: "Executive Suite",
    type: "Suite",
    price: 350,
    description: "Perfect for business travelers with workspace and meeting facilities",
    amenities: ["WiFi", "TV", "Work Desk", "Meeting Room", "Coffee Machine"],
    capacity: 3,
    images: [],
    availability: true,
    featured: true
  },
  {
    name: "Honeymoon Suite",
    type: "Suite",
    price: 400,
    description: "Romantic suite with king-size bed and private terrace",
    amenities: ["WiFi", "TV", "King Bed", "Private Terrace", "Champagne", "Rose Petals"],
    capacity: 2,
    images: [],
    availability: true,
    featured: true
  },
  {
    name: "City View Deluxe",
    type: "Deluxe",
    price: 180,
    description: "Modern deluxe room with panoramic city skyline views",
    amenities: ["WiFi", "TV", "Mini Bar", "City View", "Floor-to-Ceiling Windows"],
    capacity: 2,
    images: [],
    availability: true,
    featured: true
  }
];

async function seedRooms() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    await Room.deleteMany({});
    console.log('Cleared existing rooms');
    
    await Room.insertMany(sampleRooms);
    console.log('Sample rooms added successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding rooms:', error);
    process.exit(1);
  }
}

seedRooms();
