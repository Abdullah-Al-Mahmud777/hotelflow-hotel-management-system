const mongoose = require('mongoose');
const connectDB = require('./db');
const { ensureDemoUsers } = require('./seedDemoUsers');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    await connectDB();
    const results = await ensureDemoUsers();
    console.log('✅ Demo accounts seeded successfully');
    for (const r of results) {
      console.log(`- ${r.role}: ${r.email} (${r.action})`);
    }
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding demo accounts:', error);
    process.exit(1);
  }
};

seedAdmin();
