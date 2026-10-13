// Backward-compat shim: v1 routes now live in routes/dashboardRoutes.js
// (single source of truth, mounted as app.use('/api/v1', mainRouter)).
// Keeping this file avoids breaking any stale `require('./routes/v1Routes')`.
module.exports = require('./dashboardRoutes');
