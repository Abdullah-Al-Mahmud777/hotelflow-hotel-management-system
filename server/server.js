const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());




// MongoDB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.log("MongoDB connection error:", err));

// 🔹 Base route
app.get("/", (req, res) => {
  res.send("HotelFlow API is running ");
});

// 🔹 Room routes (IMPORTANT)
const roomRoutes = require("./routes/roomRoutes");
app.use("/api/rooms", roomRoutes);
// roomview   routes

const roomviewRoutes = require("./routes/roomviewRoutes");
app.use("/api/roomviews", roomviewRoutes);

// bookroutes
const bookRoute= require("./routes/bookroute");
app.use("/api/book", bookRoute);




// error handling middleware
const errorHandler = require("./middlewares/error.middleware");


// use error handling middleware
app.use(errorHandler);



// start server

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
