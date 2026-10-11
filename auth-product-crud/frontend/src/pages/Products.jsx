import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import ConfirmModal from '../components/ConfirmModal';
import { PlusCircle, Search, Filter, PackageOpen, ChevronLeft, ChevronRight } from 'lucide-react';

const Products = () => {
  const { isAuthenticated } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const limit = 6;

  // Deletion modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await productService.getAll({
        page,
        limit,
        category: categoryFilter,
        search: searchTerm
      });

      if (data.success) {
        setProducts(data.products || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalProducts(data.pagination.total || 0);
        }
      }
    } catch (err) {
      console.error('Failed to load products', err);
      setError('Unable to fetch products from backend server. Please verify the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [page, categoryFilter, searchTerm]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  // Open delete confirmation modal
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  // Confirm delete product
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      const res = await productService.delete(productToDelete.id);
      if (res.success) {
        setSuccessMsg(`Product "${productToDelete.name}" deleted successfully.`);
        setDeleteModalOpen(false);
        setProductToDelete(null);
        // Refresh product list
        fetchProducts();
      }
    } catch (err) {
      console.error('Failed to delete product', err);
      setError(err.response?.data?.message || 'Failed to delete product. Please try again.');
      setDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* Top Header Banner */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '2rem'
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Product Catalog
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Browse through available products, track inventory, and manage listings
          </p>
        </div>

        {isAuthenticated && (
          <Link to="/products/new" className="btn btn-primary">
            <PlusCircle size={18} />
            <span>Add New Product</span>
          </Link>
        )}
      </div>

      {successMsg && (
        <AlertMessage type="success" message={successMsg} />
      )}
      {error && <AlertMessage type="danger" message={error} />}

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <form
          onSubmit={handleSearchSubmit}
          style={{ display: 'flex', gap: '0.75rem', flex: '1', minWidth: '260px' }}
        >
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm" title="Search">
            <Search size={16} />
            <span>Search</span>
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="var(--text-muted)" />
          <select
            className="form-control"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            style={{ width: 'auto', minWidth: '160px' }}
          >
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Accessories">Accessories</option>
            <option value="Wearables">Wearables</option>
            <option value="Fashion">Fashion</option>
            <option value="Lifestyle">Lifestyle</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <LoadingSpinner text="Fetching products from store..." />
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <PackageOpen size={36} />
          </div>
          <h3 className="empty-title">No products found</h3>
          <p className="empty-desc">
            {searchTerm || categoryFilter
              ? 'No products matched your search or category filter. Try resetting your filters.'
              : 'The product catalog is currently empty. Get started by adding a new product!'}
          </p>
          {isAuthenticated && (
            <Link to="/products/new" className="btn btn-primary">
              <PlusCircle size={18} />
              <span>Add First Product</span>
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onDeleteClick={handleDeleteClick}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>

              <span className="pagination-info">
                Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalProducts} items)
              </span>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages}
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
        confirmText="Confirm Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setProductToDelete(null);
        }}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Products;
