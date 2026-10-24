// Cached MongoDB connection — safe for both a long-running local server and
// Vercel's serverless runtime (a warm lambda reuses the same connection).
const mongoose = require('mongoose');

const cache = global.__hotelflowMongo || (global.__hotelflowMongo = {
  conn: null,
  promise: null,
});

async function connectDB() {
  if (cache.conn) return cache.conn;

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not configured');
  }

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 })
      .then((conn) => {
        console.log(
          `MongoDB connected ✅ (Database: ${conn.connection.name})`
        );
        return conn;
      })
      .catch((err) => {
        // Reset so a later request (or cold start) can retry.
        cache.promise = null;
        throw err;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}

module.exports = connectDB;
