const User = require('../models/User');

/**
 * Authentication middleware
 * Works with external auth service
 * Expects user ID from external auth header (x-user-id) or creates/links user
 */
const authenticate = async (req, res, next) => {
  try {
    // Get user ID from external auth service header
    const externalUserId = req.headers['x-user-id'];
    const userEmail = req.headers['x-user-email'];
    const userName = req.headers['x-user-name'];

    if (!externalUserId) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please provide valid authentication'
      });
    }

    // Find or create user by external ID
    let user = await User.findByExternalId(externalUserId);

    if (!user && userEmail) {
      // Create new user from external auth
      user = await User.createFromExternalAuth({
        externalId: externalUserId,
        email: userEmail,
        name: userName || 'User'
      });
    }

    if (!user) {
      return res.status(401).json({
        error: 'User not found',
        message: 'Could not find or create user account'
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      error: 'Authentication error',
      message: 'An error occurred during authentication'
    });
  }
};

/**
 * Optional authentication
 * Attaches user if auth headers exist, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const externalUserId = req.headers['x-user-id'];

    if (externalUserId) {
      const user = await User.findByExternalId(externalUserId);

      if (user) {
        req.user = user;
        req.userId = user._id;
      }
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth
};
