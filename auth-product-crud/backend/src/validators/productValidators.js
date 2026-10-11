const { body, param, query } = require('express-validator');

const paramIdValidator = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Product ID is required')
];

const createProductValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 120 })
    .withMessage('Product name must be between 2 and 120 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 5, max: 2000 })
    .withMessage('Description must be between 5 and 2000 characters'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ gt: 0 })
    .withMessage('Price must be a positive number'),
  body('stock')
    .notEmpty()
    .withMessage('Stock is required')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('image')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Image must be a valid URL')
];

const updateProductValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty')
    .isLength({ min: 2, max: 120 })
    .withMessage('Product name must be between 2 and 120 characters'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty')
    .isLength({ min: 5, max: 2000 })
    .withMessage('Description must be between 5 and 2000 characters'),
  body('price')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Price must be a positive number'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty'),
  body('image')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Image must be a valid URL')
];

module.exports = {
  paramIdValidator,
  createProductValidator,
  updateProductValidator
};
