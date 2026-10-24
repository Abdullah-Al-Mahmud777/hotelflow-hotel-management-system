// One-time-per-process database initialisation: connect + provision demo
// accounts. Retries on the next request if the first attempt fails, which
// matters for serverless cold starts and transient Atlas hiccups.
const connectDB = require('./db');
const { ensureDemoUsers } = require('./seedDemoUsers');

let initPromise = null;

function initializeDatabase() {
  if (!initPromise) {
    initPromise = (async () => {
      await connectDB();
      await ensureDemoUsers();
      return true;
    })().catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

module.exports = initializeDatabase;
