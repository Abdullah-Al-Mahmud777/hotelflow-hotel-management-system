const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  images: [{ type: String }],
  amenities: [{ type: String }]
});

// avoid overwrite in watch mode
const RoomView = mongoose.models.RoomView || mongoose.model("RoomView", roomSchema);

module.exports = RoomView;