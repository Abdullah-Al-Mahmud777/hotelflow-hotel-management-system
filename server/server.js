const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// CORS configuration - Allowing your live Next.js frontend
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      process.env.FRONTEND_URL,
      'https://hotelflow-hotel-management-system-d.vercel.app' // Your frontend URL
    ].filter(Boolean)
  : [
      'http://localhost:3000',
      'http://localhost:3001'
    ];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// MongoDB Atlas connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas connected ✅ (Database: hotelflow_db)"))
  .catch((err) => console.log("MongoDB Atlas connection error:", err));

// Routes
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);

// Base route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "HotelFlow API is running ",
    version: "1.0.0",
    database: "MongoDB Atlas Connected",
    endpoints: {
      base: "/",
      health: "/health",
      rooms: "/api/rooms",
      featuredRooms: "/api/rooms/featured",
      bookings: "/api/bookings"
    }
  });
});

// Health check route
app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  const environment = process.env.NODE_ENV === 'production' ? 'Production' : 'Development';
  console.log(`🚀 HotelFlow API Server running in ${environment} mode`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 Local: http://localhost:${PORT}`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`🔗 Production URL: Check Vercel Dashboard`);
  }
});