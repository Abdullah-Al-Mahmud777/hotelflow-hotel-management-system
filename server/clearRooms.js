const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    const Room = mongoose.model('Room', new mongoose.Schema({}, { strict: false }));
    const result = await Room.deleteMany({});
    console.log(`Cleared ${result.deletedCount} rooms`);
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
