// Auth unit tests — no database required.
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');

const {
  signToken,
  verifyToken,
  readAuthCookie,
  tokenFromRequest,
} = require('../utils/jwt');
const {
  getDemoAccounts,
  getPublicDemoCredentials,
  demoLoginEnabled,
} = require('../config/seedDemoUsers');
const { restrictTo } = require('../middlewares/auth');

function mockRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

describe('JWT helpers', () => {
  it('signs and verifies a token with the user role', () => {
    const token = signToken({ _id: '507f1f77bcf86cd799439011', role: 'admin' });
    const decoded = verifyToken(token);
    assert.equal(decoded.id, '507f1f77bcf86cd799439011');
    assert.equal(decoded.role, 'admin');
  });

  it('reads a bearer token from the authorization header', () => {
    assert.equal(
      tokenFromRequest({ headers: { authorization: 'Bearer abc.def.ghi' } }),
      'abc.def.ghi'
    );
  });

  it('reads the httpOnly auth cookie as a fallback', () => {
    const cookie = 'theme=dark; hf_token=cookie.token.value; other=1';
    assert.equal(readAuthCookie({ headers: { cookie } }), 'cookie.token.value');
    assert.equal(tokenFromRequest({ headers: { cookie } }), 'cookie.token.value');
  });
});

describe('demo accounts', () => {
  const saved = { ...process.env };

  before(() => {
    process.env.DEMO_LOGIN_ENABLED = 'true';
    process.env.DEMO_ADMIN_EMAIL = 'Demo-Admin@Example.com';
    process.env.DEMO_ADMIN_PASSWORD = 'admin-test-pass';
    process.env.DEMO_USER_EMAIL = 'demo-user@example.com';
    process.env.DEMO_USER_PASSWORD = 'user-test-pass';
  });

  after(() => {
    for (const key of Object.keys(process.env)) {
      if (!(key in saved)) delete process.env[key];
    }
    Object.assign(process.env, saved);
  });

  it('builds exactly one admin and one user account', () => {
    const accounts = getDemoAccounts();
    assert.equal(accounts.length, 2);
    assert.deepEqual(
      accounts.map((a) => a.role),
      ['admin', 'user']
    );
    assert.equal(accounts[0].email, 'demo-admin@example.com');
    assert.equal(accounts[1].email, 'demo-user@example.com');
  });

  it('only exposes public demo fields (never role internals)', () => {
    const [admin] = getPublicDemoCredentials();
    assert.deepEqual(Object.keys(admin).sort(), [
      'email',
      'label',
      'password',
      'role',
    ]);
    assert.equal(admin.role, 'admin');
  });

  it('can be disabled with DEMO_LOGIN_ENABLED=false', () => {
    process.env.DEMO_LOGIN_ENABLED = 'false';
    assert.equal(demoLoginEnabled(), false);
    process.env.DEMO_LOGIN_ENABLED = 'true';
  });
});

describe('restrictTo role guard', () => {
  it('allows a matching role', () => {
    const req = { user: { role: 'admin' } };
    const res = mockRes();
    let called = false;
    restrictTo('admin')(req, res, () => {
      called = true;
    });
    assert.equal(called, true);
    assert.equal(res.statusCode, 200);
  });

  it('rejects a non-matching role with 403', () => {
    const req = { user: { role: 'user' } };
    const res = mockRes();
    let called = false;
    restrictTo('admin')(req, res, () => {
      called = true;
    });
    assert.equal(called, false);
    assert.equal(res.statusCode, 403);
    assert.match(res.body.message, /permission/i);
  });

  it('rejects a missing user with 403', () => {
    const req = {};
    const res = mockRes();
    restrictTo('admin')(req, res, () => {});
    assert.equal(res.statusCode, 403);
  });
});

describe('auth route registration', () => {
  const routes = require('../routes/authRoutes')
    .stack.filter((l) => l.route)
    .map((l) => `${Object.keys(l.route.methods)[0].toUpperCase()} ${l.route.path}`);

  it('exposes login, logout and demo credentials', () => {
    assert.ok(routes.includes('POST /login'));
    assert.ok(routes.includes('POST /logout'));
    assert.ok(routes.includes('GET /demo-credentials'));
    assert.ok(routes.includes('GET /me'));
  });

  it('protects admin inventory writes', () => {
    const roomRoutes = require('../routes/roomRoutes');
    const layers = roomRoutes.stack.filter((l) => l.route);
    const write = layers.find((l) =>
      ['post', 'put', 'delete'].some((m) => l.route.methods[m])
    );
    assert.ok(write);
    // protect + restrictTo are registered on the write route.
    assert.ok(write.route.stack.length >= 3);
  });
});
