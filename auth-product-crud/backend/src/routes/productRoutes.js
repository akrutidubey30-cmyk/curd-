const express = require('express');
const router = express.Router();

const {
  getProducts,
  getSingleProduct,
  createNewProduct,
  updateExistingProduct,
  deleteExistingProduct
} = require('../controllers/productController');

const {
  paramIdValidator,
  createProductValidator,
  updateProductValidator
} = require('../validators/productValidators');

const validate = require('../middleware/validate');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/products (Public) - supports ?page=1&limit=10
router.get('/', getProducts);

// GET /api/products/:id (Public)
router.get('/:id', paramIdValidator, validate, getSingleProduct);

// POST /api/products (Protected)
router.post('/', authMiddleware, createProductValidator, validate, createNewProduct);

// PUT /api/products/:id (Protected)
router.put('/:id', authMiddleware, paramIdValidator, updateProductValidator, validate, updateExistingProduct);

// DELETE /api/products/:id (Protected)
router.delete('/:id', authMiddleware, paramIdValidator, validate, deleteExistingProduct);

module.exports = router;
