const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const initializeDatabase = require("./config/initDb");

const app = express();

// Start connecting immediately; requests also await this below so serverless
// cold starts never run a query before MongoDB is ready.
initializeDatabase().catch((err) =>
  console.error("Database initialisation failed:", err.message)
);

// ===== 1. CORS — MUST come before all routes =====
// Dev: Next.js Turbopack on :3000/:3001. Prod: FRONTEND_URL + Vercel previews.
const configuredOrigins = [
  process.env.FRONTEND_URL,
  process.env.CLIENT_URLS,
  'https://hotelflow-hotel-management-system-d.vercel.app',
  'https://hotelflow-hotel-management-system.vercel.app',
]
  .filter(Boolean)
  .flatMap((value) => String(value).split(','))
  .map((value) => value.trim())
  .filter(Boolean);

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? configuredOrigins
  : [
      ...configuredOrigins,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // curl / server-to-server
    if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
      return callback(null, true);
    }
    const allowVercelPreviews =
      String(process.env.ALLOW_VERCEL_PREVIEWS || 'false').toLowerCase() === 'true';
    if (allowVercelPreviews && origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error(`CORS blocked origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// ===== 2. Body parsers — MUST come before routes =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== 3. Request logger (proves Express actually received the call) =====
app.use((req, res, next) => {
  if (req.path.startsWith('/api/v1')) {
    console.log(`[Express] ${req.method} ${req.path} origin=${req.headers.origin || 'none'}`);
  }
  next();
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===== 4. Database readiness — await connection + demo seeding per request =====
// (Serverless functions can receive a request before the module-level connect
// resolves; this guarantees models never run against a disconnected client.)
app.use('/api', async (req, res, next) => {
  try {
    await initializeDatabase();
    next();
  } catch (err) {
    console.error('Database unavailable:', err.message);
    res.status(503).json({
      success: false,
      message: 'Database temporarily unavailable. Please try again.',
    });
  }
});

// Routes
const roomRoutes = require('./routes/roomRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const authRoutes = require('./routes/authRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const contactRoutes = require('./routes/contactRoutes');
const mainRouter = require('./routes/dashboardRoutes');
const favoritesRoutes = require('./routes/favoritesRoutes');
const rewardsRoutes = require('./routes/rewardsRoutes');
const supportRoutes = require('./routes/supportRoutes');
const aiRoutes = require('./routes/aiRoutes');

app.use('/api/rooms', roomRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/support', supportRoutes);
// Versioned API — single source of truth for /api/v1/*
app.use('/api/v1', mainRouter);
app.use('/api/v1/ai', aiRoutes);

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

// Start the server for local/long-running environments. On Vercel the app is
// exported as a serverless handler, so listening is unnecessary (and can
// interfere with the platform runtime).
const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    const environment = process.env.NODE_ENV === 'production' ? 'Production' : 'Development';
    console.log(`🚀 HotelFlow API Server running in ${environment} mode`);
    console.log(`📡 Port: ${PORT}`);
    console.log(`🌐 Local: http://localhost:${PORT}`);
    if (process.env.NODE_ENV === 'production') {
      console.log(`🔗 Production URL: Check Vercel Dashboard`);
    }
  });
}

// Export for Vercel
module.exports = app;