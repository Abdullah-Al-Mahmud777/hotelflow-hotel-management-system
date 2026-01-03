const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    roomType: {
      type: String,
      enum: ["single", "double", "suite"],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    capacity: {  
      type: Number,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    description: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
