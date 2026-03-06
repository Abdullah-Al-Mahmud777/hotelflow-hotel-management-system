const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Deluxe', 'Suite'],
    default: 'Deluxe'
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  amenities: [{
    type: String
  }],
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  image: {
    type: String,
    default: ""
  },
  images: [{
    type: String
  }],
  availability: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

roomSchema.index({ type: 1, price: 1, availability: 1 });

module.exports = mongoose.model('Room', roomSchema);
