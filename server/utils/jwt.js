// Shared JWT + auth-cookie helpers.
// The bearer token remains the primary auth mechanism (localStorage), while
// an httpOnly cookie is also set as a safer fallback for browser clients.
const jwt = require('jsonwebtoken');

const COOKIE_NAME = 'hf_token';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

function getSecret() {
  const secret = process.env.JWT_SECRET;
  const isPlaceholder =
    !secret || secret === 'your_super_secret_key_here' || secret.trim() === '';

  if (isPlaceholder) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be configured in production');
    }
    return 'hotelflow_dev_only_secret_change_me';
  }
  return secret;
}

function signToken(user) {
  return jwt.sign(
    { id: String(user._id || user.id), role: user.role },
    getSecret(),
    { expiresIn: EXPIRES_IN }
  );
}

function verifyToken(token) {
  return jwt.verify(token, getSecret());
}

function baseCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  };
}

function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    ...baseCookieOptions(),
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, baseCookieOptions());
}

function readAuthCookie(req) {
  const header = req.headers && req.headers.cookie;
  if (!header) return null;
  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === COOKIE_NAME) {
      return decodeURIComponent(rest.join('='));
    }
  }
  return null;
}

function tokenFromRequest(req) {
  const auth = req.headers && req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    return auth.slice(7).trim();
  }
  return readAuthCookie(req);
}

module.exports = {
  COOKIE_NAME,
  signToken,
  verifyToken,
  setAuthCookie,
  clearAuthCookie,
  readAuthCookie,
  tokenFromRequest,
};
