const bcrypt = require('bcryptjs');
const { users, generateId } = require('../data/store');

/**
 * Remove sensitive fields like password before sending user data
 */
const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...sanitized } = user;
  return sanitized;
};

/**
 * Find user by email (case-insensitive)
 */
const findByEmail = (email) => {
  if (!email) return null;
  const normalizedEmail = email.trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === normalizedEmail) || null;
};

/**
 * Find user by ID
 */
const findById = (id) => {
  if (!id) return null;
  return users.find((u) => u.id === id) || null;
};

/**
 * Create a new user with hashed password
 */
const createUser = async ({ name, email, password }) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = {
    id: generateId(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: hashedPassword,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  users.push(newUser);
  return sanitizeUser(newUser);
};

/**
 * Verify user's plain text password against stored bcrypt hash
 */
const verifyPassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = {
  findByEmail,
  findById,
  createUser,
  verifyPassword,
  sanitizeUser
};
