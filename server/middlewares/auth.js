const User = require('../models/User');
const { verifyToken, tokenFromRequest } = require('../utils/jwt');

function unauthorized(res) {
  return res.status(401).json({
    success: false,
    message: 'Not authorized to access this route',
  });
}

// Protect routes - verify JWT token (Authorization header or httpOnly cookie)
exports.protect = async (req, res, next) => {
  try {
    const token = tokenFromRequest(req);

    if (!token) {
      return unauthorized(res);
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return unauthorized(res);
    }

    // Get user from token
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated',
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Optional authentication - attach user if token is present
exports.optionalAuth = async (req, res, next) => {
  try {
    const token = tokenFromRequest(req);

    if (token) {
      try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.id);
        if (user && user.isActive) req.user = user;
      } catch (error) {
        // Token invalid, but continue without user
        console.log('Invalid token, continuing without auth');
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};

// Restrict to specific roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
      });
    }
    next();
  };
};
