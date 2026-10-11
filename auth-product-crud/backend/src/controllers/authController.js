const {
  findByEmail,
  findById,
  createUser,
  verifyPassword
} = require('../services/userService');
const {
  generateAccessToken,
  generateRefreshToken,
  saveRefreshToken,
  isRefreshTokenInStore,
  revokeRefreshToken,
  verifyRefreshToken
} = require('../services/tokenService');

// Cookie options for HttpOnly refresh token
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
});

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered. Please login or use a different email.'
      });
    }

    // Create user (password is hashed in service)
    const newUser = await createUser({ name, email, password });

    // Do NOT generate tokens during registration
    return res.status(201).json({
      success: true,
      message: 'User registered successfully. You can now log in.',
      user: newUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Log in an existing user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token server-side in in-memory store
    saveRefreshToken(refreshToken);

    // Send refresh token as HttpOnly cookie
    res.cookie('refreshToken', refreshToken, getCookieOptions());

    // Return access token in JSON response
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh Access Token
 * POST /api/auth/refresh-token
 */
const refreshToken = (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not provided in cookies'
      });
    }

    // Check if refresh token is in server-side store (not revoked)
    if (!isRefreshTokenInStore(token)) {
      return res.status(403).json({
        success: false,
        message: 'Refresh token is invalid or has been revoked. Please log in again.'
      });
    }

    // Verify JWT signature & expiration
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (err) {
      // Clean up revoked/expired token from store
      revokeRefreshToken(token);
      res.clearCookie('refreshToken', getCookieOptions());
      return res.status(403).json({
        success: false,
        message: 'Refresh token expired or invalid. Please log in again.'
      });
    }

    const user = findById(decoded.id);
    if (!user) {
      revokeRefreshToken(token);
      res.clearCookie('refreshToken', getCookieOptions());
      return res.status(403).json({
        success: false,
        message: 'User associated with refresh token no longer exists'
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user);

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Log out user
 * POST /api/auth/logout
 */
const logout = (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    // Revoke refresh token if present
    if (token) {
      revokeRefreshToken(token);
    }

    // Clear the cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get authenticated user profile
 * GET /api/auth/me
 */
const getMe = (req, res) => {
  // req.user was attached by authMiddleware
  return res.status(200).json({
    success: true,
    user: req.user
  });
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe
};
