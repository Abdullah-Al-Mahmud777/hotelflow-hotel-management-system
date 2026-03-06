const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    const Booking = mongoose.model('Booking', new mongoose.Schema({}, { strict: false }));
    const result = await Booking.deleteMany({});
    console.log(`Cleared ${result.deletedCount} bookings`);
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
