const jwt = require('jsonwebtoken');
const { refreshTokens } = require('../data/store');

/**
 * Generate Access Token (short-lived, 15 minutes default)
 */
const generateAccessToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name
  };

  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m'
  });
};

/**
 * Generate Refresh Token (long-lived, 7 days default)
 */
const generateRefreshToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email
  };

  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
  });
};

/**
 * Save refresh token in server-side in-memory store
 */
const saveRefreshToken = (token) => {
  refreshTokens.add(token);
};

/**
 * Check if refresh token is in server-side store
 */
const isRefreshTokenInStore = (token) => {
  return refreshTokens.has(token);
};

/**
 * Revoke/delete refresh token from server-side store
 */
const revokeRefreshToken = (token) => {
  return refreshTokens.delete(token);
};

/**
 * Verify Access Token
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
};

/**
 * Verify Refresh Token
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  saveRefreshToken,
  isRefreshTokenInStore,
  revokeRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
