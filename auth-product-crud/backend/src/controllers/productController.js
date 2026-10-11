const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../services/productService');

/**
 * Get all products (Public route)
 * Supports pagination: ?page=1&limit=10
 * Optional query: ?category=...&search=...
 * GET /api/products
 */
const getProducts = (req, res, next) => {
  try {
    const { page, limit, category, search } = req.query;
    const result = getAllProducts({ page, limit, category, search });

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get product by ID (Public route)
 * GET /api/products/:id
 */
const getSingleProduct = (req, res, next) => {
  try {
    const { id } = req.params;
    const product = getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID '${id}' not found`
      });
    }

    return res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new product (Protected route)
 * POST /api/products
 */
const createNewProduct = (req, res, next) => {
  try {
    const { name, description, price, stock, category, image } = req.body;

    const newProduct = createProduct({
      name,
      description,
      price,
      stock,
      category,
      image
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: newProduct
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update product by ID (Protected route)
 * PUT /api/products/:id
 */
const updateExistingProduct = (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category, image } = req.body;

    const existingProduct = getProductById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: `Product with ID '${id}' not found`
      });
    }

    const updated = updateProduct(id, {
      name,
      description,
      price,
      stock,
      category,
      image
    });

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete product by ID (Protected route)
 * DELETE /api/products/:id
 */
const deleteExistingProduct = (req, res, next) => {
  try {
    const { id } = req.params;

    const existingProduct = getProductById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: `Product with ID '${id}' not found`
      });
    }

    deleteProduct(id);

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      deletedId: id
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getSingleProduct,
  createNewProduct,
  updateExistingProduct,
  deleteExistingProduct
};
