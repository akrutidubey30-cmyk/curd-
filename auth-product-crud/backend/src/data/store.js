/**
 * In-Memory Data Store
 * 
 * IMPORTANT NOTE:
 * This data store keeps all users, products, and active refresh tokens in memory.
 * Any data created or modified will be reset when the backend server restarts.
 * 
 * ARCHITECTURE NOTE:
 * This data layer is completely separated from the controllers and business logic,
 * allowing MongoDB or any other persistent database to replace this module
 * in the future without modifying the rest of the application.
 */

const crypto = require('crypto');

// Generate unique ID helper
const generateId = () => crypto.randomUUID();

// In-memory collections
const users = [];

const refreshTokens = new Set(); // Stores active refresh token strings

// Pre-populated sample products
const products = [
  {
    id: 'prod-001',
    name: 'Wireless Noise-Canceling Headphones',
    description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio quality.',
    price: 199.99,
    stock: 25,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-10T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-01-10T10:00:00Z').toISOString()
  },
  {
    id: 'prod-002',
    name: 'Ergonomic Mechanical Keyboard',
    description: 'Compact wireless mechanical keyboard featuring hot-swappable switches, RGB backlighting, and aluminum frame.',
    price: 119.50,
    stock: 40,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-12T11:30:00Z').toISOString(),
    updatedAt: new Date('2026-01-12T11:30:00Z').toISOString()
  },
  {
    id: 'prod-003',
    name: 'Smart Fitness Tracker v2',
    description: 'Water-resistant fitness tracker with heart rate monitor, sleep tracking, AMOLED display, and 14-day battery life.',
    price: 79.99,
    stock: 35,
    category: 'Wearables',
    image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-15T09:15:00Z').toISOString(),
    updatedAt: new Date('2026-01-15T09:15:00Z').toISOString()
  },
  {
    id: 'prod-004',
    name: 'Minimalist Commuter Backpack',
    description: 'Durable, water-repellent backpack with padded laptop sleeve (up to 16 inches), hidden security pockets, and USB pass-through.',
    price: 64.95,
    stock: 18,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-18T14:45:00Z').toISOString(),
    updatedAt: new Date('2026-01-18T14:45:00Z').toISOString()
  },
  {
    id: 'prod-005',
    name: 'Stainless Steel Insulated Bottle',
    description: 'Double-walled vacuum insulated water bottle (32oz) keeping cold drinks chilled for 24h and hot drinks warm for 12h.',
    price: 28.00,
    stock: 50,
    category: 'Lifestyle',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-20T16:20:00Z').toISOString(),
    updatedAt: new Date('2026-01-20T16:20:00Z').toISOString()
  }
];

module.exports = {
  users,
  products,
  refreshTokens,
  generateId
};
