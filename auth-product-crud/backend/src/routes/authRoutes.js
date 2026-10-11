const express = require('express');
const router = express.Router();

const {
  register,
  login,
  refreshToken,
  logout,
  getMe
} = require('../controllers/authController');

const {
  registerValidator,
  loginValidator
} = require('../validators/authValidators');

const validate = require('../middleware/validate');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/auth/register
router.post('/register', registerValidator, validate, register);

// POST /api/auth/login
router.post('/login', loginValidator, validate, login);

// POST /api/auth/refresh-token
router.post('/refresh-token', refreshToken);

// POST /api/auth/logout
router.post('/logout', logout);

// GET /api/auth/me (Protected)
router.get('/me', authMiddleware, getMe);

module.exports = router;
