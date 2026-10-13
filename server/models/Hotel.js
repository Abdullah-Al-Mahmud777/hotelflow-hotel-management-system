const mongoose = require('mongoose');

// Hotel property (parent of rooms). Sample/seeded rows carry demo: true so
// demo listings are clearly distinguished from verified live inventory.
const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  stars: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  rating: {
    type: Number,
    min: 0,
    max: 10,
    default: 8.0
  },
  reviewsCount: {
    type: Number,
    default: 0
  },
  amenities: [{
    type: String
  }],
  checkInTime: {
    type: String,
    default: '2:00 PM'
  },
  checkOutTime: {
    type: String,
    default: '12:00 PM'
  },
  contact: {
    phone: { type: String, default: '' },
    email: { type: String, default: '' }
  },
  demo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

hotelSchema.index({ city: 1, stars: 1 });

module.exports = mongoose.model('Hotel', hotelSchema);
