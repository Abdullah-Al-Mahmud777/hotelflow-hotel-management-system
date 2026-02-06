const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },

  room: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Room", 
    required: true 
  },

  startDate: { 
    type: Date, 
    required: true 
  },

  endDate: { 
    type: Date, 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model("Book", bookSchema);
