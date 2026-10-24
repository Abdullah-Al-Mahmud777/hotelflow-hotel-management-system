const User = require('../models/User');
const {
  signToken,
  setAuthCookie,
  clearAuthCookie,
} = require('../utils/jwt');
const {
  getPublicDemoCredentials,
  demoLoginEnabled,
} = require('../config/seedDemoUsers');

// Generate JWT Token
const generateToken = (user) => signToken(user);

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  avatar: user.avatar,
});

// Register User
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone and password are required',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Public registration can only create regular users, never admins.
    const user = await User.create({
      name,
      email: normalizedEmail,
      phone,
      password,
      role: 'user',
    });

    const token = generateToken(user);
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
};

// Login User — optional `role` scopes the login to the user or admin portal.
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const requestedRole =
      typeof req.body.role === 'string' ? req.body.role.trim().toLowerCase() : '';

    // Check if email and password provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    if (requestedRole && !['user', 'admin'].includes(requestedRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid login role',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Find user and include password
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if password matches
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated',
      });
    }

    // Enforce the portal the visitor chose (separate Admin / User login).
    if (requestedRole && user.role !== requestedRole) {
      return res.status(403).json({
        success: false,
        message:
          requestedRole === 'admin'
            ? 'This account does not have admin access. Use the User login.'
            : 'This is an admin account. Use the Admin login.',
      });
    }

    const token = generateToken(user);
    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
};

// Logout — clear the httpOnly cookie. The client also clears localStorage.
exports.logout = async (req, res) => {
  clearAuthCookie(res);
  return res.status(200).json({ success: true, message: 'Logged out' });
};

// Public demo credentials for the login page (demo accounts only).
exports.getDemoCredentials = async (req, res) => {
  const enabled = demoLoginEnabled();
  return res.status(200).json({
    success: true,
    enabled,
    accounts: enabled ? getPublicDemoCredentials() : [],
  });
};

// Update Password (verify current password first)
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current and new passwords are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const isCorrect = await user.comparePassword(currentPassword);

    if (!isCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = newPassword;
    await user.save(); // pre-save hook hashes

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update password',
      error: error.message,
    });
  }
};

// Get Current User
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        ...publicUser(user),
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error.message,
    });
  }
};

// Update User Profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, avatar },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: publicUser(user),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
};
