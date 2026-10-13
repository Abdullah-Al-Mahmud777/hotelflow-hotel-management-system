// Runs fn inside a MongoDB transaction when the deployment supports it
// (replica set / Atlas). Standalone servers reject transactions — in that
// case fall back to plain sequential writes so single-node dev still works.
async function runTransaction(session, fn) {
  try {
    await session.withTransaction(fn);
  } catch (err) {
    const msg = String(err?.message || '');
    const Basta = /replica set|transaction numbers|No transaction started/i.test(msg)
      && !/already used|limit reached|expired|available/i.test(msg);
    if (Basta && !session.inTransaction()) {
      await fn();
      return;
    }
    throw err;
  }
}

module.exports = { runTransaction };
