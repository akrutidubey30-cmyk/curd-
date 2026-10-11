const { products, generateId } = require('../data/store');

/**
 * Get paginated list of products
 */
const getAllProducts = ({ page = 1, limit = 10, category = '', search = '' } = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));

  let filtered = [...products];

  // Optional category filter
  if (category && category.trim()) {
    const cat = category.trim().toLowerCase();
    filtered = filtered.filter((p) => p.category.toLowerCase() === cat);
  }

  // Optional search filter (name or description)
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  // Sort descending by createdAt
  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const total = filtered.length;
  const totalPages = Math.ceil(total / limitNum) || 1;
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedItems = filtered.slice(startIndex, startIndex + limitNum);

  return {
    products: paginatedItems,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1
    }
  };
};

/**
 * Find product by ID
 */
const getProductById = (id) => {
  if (!id) return null;
  return products.find((p) => p.id === id) || null;
};

/**
 * Create a new product
 */
const createProduct = ({ name, description, price, stock, category, image }) => {
  const now = new Date().toISOString();
  const defaultImage = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';

  const newProduct = {
    id: generateId(),
    name: name.trim(),
    description: description.trim(),
    price: Number(parseFloat(price).toFixed(2)),
    stock: parseInt(stock, 10),
    category: category.trim(),
    image: image && image.trim() ? image.trim() : defaultImage,
    createdAt: now,
    updatedAt: now
  };

  products.unshift(newProduct);
  return newProduct;
};

/**
 * Update an existing product
 */
const updateProduct = (id, updateData) => {
  const productIndex = products.findIndex((p) => p.id === id);
  if (productIndex === -1) return null;

  const current = products[productIndex];
  const updatedProduct = {
    ...current,
    ...(updateData.name !== undefined && { name: updateData.name.trim() }),
    ...(updateData.description !== undefined && { description: updateData.description.trim() }),
    ...(updateData.price !== undefined && { price: Number(parseFloat(updateData.price).toFixed(2)) }),
    ...(updateData.stock !== undefined && { stock: parseInt(updateData.stock, 10) }),
    ...(updateData.category !== undefined && { category: updateData.category.trim() }),
    ...(updateData.image !== undefined && { image: updateData.image.trim() }),
    updatedAt: new Date().toISOString()
  };

  products[productIndex] = updatedProduct;
  return updatedProduct;
};

/**
 * Delete a product by ID
 */
const deleteProduct = (id) => {
  const productIndex = products.findIndex((p) => p.id === id);
  if (productIndex === -1) return false;

  products.splice(productIndex, 1);
  return true;
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
