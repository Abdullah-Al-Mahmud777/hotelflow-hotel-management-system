const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      process.env.FRONTEND_URL,
      'https://your-frontend-name.vercel.app'
    ].filter(Boolean)
  : [
      'http://localhost:3000',
      'http://localhost:3001'
    ];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
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

// Base route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "HotelFlow API is running 🚀",
    version: "1.0.0",
    database: "MongoDB Atlas Connected"
  });
});

// Start server
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
