// Idempotent demo-account provisioning.
//
// Creates one admin and one regular user so anyone can test the deployed app.
// Passwords are hashed by the User model's pre-save hook — never stored or
// logged in plain text. Credentials are configurable through environment
// variables, so production deployments are not stuck with the local defaults.
const User = require('../models/User');

const DEFAULTS = {
  admin: {
    name: 'HotelFlow Admin',
    email: 'admin@hotelflow.com',
    password: 'admin123',
    phone: '+10000000001',
  },
  user: {
    name: 'Demo Guest',
    email: 'user@hotelflow.com',
    password: 'user123',
    phone: '+10000000002',
  },
};

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function demoLoginEnabled() {
  return String(process.env.DEMO_LOGIN_ENABLED || 'true').toLowerCase() !== 'false';
}

function getDemoAccounts() {
  const build = (role) => {
    const fallback = DEFAULTS[role];
    const prefix = role === 'admin' ? 'DEMO_ADMIN' : 'DEMO_USER';
    return {
      role,
      label: role === 'admin' ? 'Admin' : 'User',
      name: process.env[`${prefix}_NAME`] || fallback.name,
      email: normalizeEmail(process.env[`${prefix}_EMAIL`] || fallback.email),
      password: process.env[`${prefix}_PASSWORD`] || fallback.password,
      phone: process.env[`${prefix}_PHONE`] || fallback.phone,
    };
  };

  return [build('admin'), build('user')];
}

// Public payload for the login page. Only demo accounts are ever returned,
// and only while DEMO_LOGIN_ENABLED is not "false".
function getPublicDemoCredentials() {
  return getDemoAccounts().map(({ role, label, email, password }) => ({
    role,
    label,
    email,
    password,
  }));
}

async function ensureDemoUsers({ log = true } = {}) {
  if (!demoLoginEnabled()) {
    if (log) console.log('Demo login disabled (DEMO_LOGIN_ENABLED=false)');
    return [];
  }

  const results = [];

  for (const account of getDemoAccounts()) {
    let user = await User.findOne({ email: account.email }).select('+password');
    let action = 'unchanged';

    if (!user) {
      user = await User.create({
        name: account.name,
        email: account.email,
        phone: account.phone,
        password: account.password,
        role: account.role,
        isActive: true,
      });
      action = 'created';
    } else {
      let changed = false;

      // Keep demo accounts usable after redeploys without touching any
      // non-demo user. Only the configured demo emails are ever modified.
      if (user.role !== account.role) {
        user.role = account.role;
        changed = true;
      }
      if (user.isActive === false) {
        user.isActive = true;
        changed = true;
      }
      if (!user.name && account.name) {
        user.name = account.name;
        changed = true;
      }

      const passwordMatches = await user.comparePassword(account.password);
      if (!passwordMatches) {
        user.password = account.password;
        changed = true;
      }

      if (changed) {
        await user.save();
        action = 'updated';
      }
    }

    results.push({
      role: account.role,
      email: account.email,
      action,
    });
  }

  if (log) {
    for (const r of results) {
      console.log(`Demo ${r.role} account ready (${r.action}): ${r.email}`);
    }
  }

  return results;
}

module.exports = {
  ensureDemoUsers,
  getDemoAccounts,
  getPublicDemoCredentials,
  demoLoginEnabled,
};
