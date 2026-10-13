const Notification = require('../models/Notification');

// Fire-and-forget persistent notification. Never throws into the caller flow.
async function notify(userId, kind, title) {
  try {
    if (!userId || !title) return null;
    return await Notification.create({ user: userId, kind, title });
  } catch (err) {
    console.error('[notify]', err.message);
    return null;
  }
}

module.exports = { notify };
