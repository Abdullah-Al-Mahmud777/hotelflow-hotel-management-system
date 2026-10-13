// Route-registration tests — verify routers expose the contracted paths.
// No database required (routers load without connecting).
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function paths(router) {
  return router.stack.filter((l) => l.route).map((l) => `${Object.keys(l.route.methods)[0].toUpperCase()} ${l.route.path}`);
}

describe('dashboard (v1) routes', () => {
  const routes = paths(require('../routes/dashboardRoutes'));
  const has = (m, p) => routes.includes(`${m} ${p}`);
  it('metrics + bookings lifecycle', () => {
    assert.ok(has('GET', '/dashboard/metrics'));
    assert.ok(has('GET', '/bookings'));
    assert.ok(has('GET', '/bookings/calendar'));
    assert.ok(has('GET', '/bookings/:id'));
    assert.ok(has('PUT', '/bookings/:id/modify'));
    assert.ok(has('POST', '/bookings/:id/cancel'));
    assert.ok(has('GET', '/bookings/:id/invoice'));
    assert.ok(has('GET', '/bookings/:id/invoice.pdf'));
  });
  it('discovery + account + engagement', () => {
    assert.ok(has('GET', '/recommendations'));
    assert.ok(has('GET', '/preferences'));
    assert.ok(has('PUT', '/preferences'));
    assert.ok(has('GET', '/payments/history'));
    assert.ok(has('GET', '/notifications'));
    assert.ok(has('PATCH', '/notifications/:id/read'));
    assert.ok(has('POST', '/notifications/read-all'));
  });
});

describe('feature routers', () => {
  it('favorites CRUD', () => {
    const r = paths(require('../routes/favoritesRoutes'));
    assert.ok(r.includes('GET /'));
    assert.ok(r.includes('POST /'));
    assert.ok(r.includes('DELETE /:roomId'));
  });
  it('rewards: coupons + loyalty', () => {
    const r = paths(require('../routes/rewardsRoutes'));
    assert.ok(r.includes('GET /coupons'));
    assert.ok(r.includes('POST /coupons/validate'));
    assert.ok(r.includes('POST /coupons'));
    assert.ok(r.includes('GET /loyalty'));
    assert.ok(r.includes('POST /loyalty/redeem'));
  });
  it('support tickets + messages', () => {
    const r = paths(require('../routes/supportRoutes'));
    assert.ok(r.includes('GET /tickets'));
    assert.ok(r.includes('POST /tickets'));
    assert.ok(r.includes('GET /tickets/:id'));
    assert.ok(r.includes('PATCH /tickets/:id'));
    assert.ok(r.includes('GET /tickets/:id/messages'));
    assert.ok(r.includes('POST /tickets/:id/messages'));
  });
  it('AI chat', () => {
    const r = paths(require('../routes/aiRoutes'));
    assert.ok(r.includes('POST /chat'));
  });
});

describe('auth + reviews extensions', () => {
  it('password update route', () => {
    const r = paths(require('../routes/authRoutes'));
    assert.ok(r.includes('PUT /password'));
  });
  it('review edit route', () => {
    const r = paths(require('../routes/reviewRoutes'));
    assert.ok(r.includes('PUT /:id'));
  });
});

describe('hotels + inventory booking', () => {
  it('hotel directory routes', () => {
    const r = paths(require('../routes/hotelRoutes'));
    assert.ok(r.includes('GET /'));
    assert.ok(r.includes('GET /:id'));
  });
  it('room availability route', () => {
    const r = paths(require('../routes/roomRoutes'));
    assert.ok(r.includes('GET /:id/availability'));
  });
  it('booking owner routes', () => {
    const r = paths(require('../routes/bookingRoutes'));
    assert.ok(r.includes('POST /'));
    assert.ok(r.includes('GET /my'));
    assert.ok(r.includes('GET /:id'));
    assert.ok(r.includes('PATCH /:id/cancel'));
    assert.ok(r.includes('PUT /:id/status'));
  });
});
