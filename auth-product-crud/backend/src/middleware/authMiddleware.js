const { verifyAccessToken } = require('../services/tokenService');
const { findById } = require('../services/userService');

/**
 * Authentication Middleware
 * Validates Bearer Access Token in Authorization header
 * Attaches user profile to req.user
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Access token is required. Format: Authorization: Bearer <token>'
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization format. Format: Authorization: Bearer <token>'
    });
  }

  const token = parts[1];

  try {
    const decoded = verifyAccessToken(token);
    const user = findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists'
      });
    }

    // Attach sanitized user to req.user
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_EXPIRED',
        message: 'Access token has expired'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid access token'
    });
  }
};

module.exports = authMiddleware;
