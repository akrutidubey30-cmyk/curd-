import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import ConfirmModal from '../components/ConfirmModal';
import { ArrowLeft, Edit3, Trash2, Calendar, Tag, Package, Check, AlertCircle } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fallbackImage = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await productService.getById(id);
        if (data.success && data.product) {
          setProduct(data.product);
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        console.error('Failed to load product', err);
        setError(err.response?.data?.message || 'Product not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await productService.delete(id);
      if (res.success) {
        navigate('/products');
      }
    } catch (err) {
      console.error('Failed to delete product', err);
      setError(err.response?.data?.message || 'Failed to delete product.');
      setDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Fetching product information..." />;
  }

  if (error || !product) {
    return (
      <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <AlertMessage type="danger" message={error || 'Product not found.'} />
        <Link to="/products" className="btn btn-outline" style={{ marginTop: '1rem' }}>
          <ArrowLeft size={16} />
          <span>Return to Product List</span>
        </Link>
      </div>
    );
  }

  const stockBadge = () => {
    if (product.stock === 0) {
      return <span className="badge badge-out-of-stock">Out of Stock</span>;
    }
    if (product.stock <= 5) {
      return <span className="badge badge-low-stock">Low Stock ({product.stock} available)</span>;
    }
    return <span className="badge badge-in-stock">In Stock ({product.stock} available)</span>;
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/products" className="btn btn-outline btn-sm">
          <ArrowLeft size={16} />
          <span>Back to Products</span>
        </Link>
      </div>

      <div className="product-detail-layout">
        <div className="product-detail-img-wrapper">
          <img
            src={product.image || fallbackImage}
            alt={product.name}
            className="product-detail-img"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = fallbackImage;
            }}
          />
        </div>

        <div className="product-detail-info">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="product-detail-category">{product.category}</span>
            {stockBadge()}
          </div>

          <h1 className="product-detail-name">{product.name}</h1>
          <div className="product-detail-price">${Number(product.price).toFixed(2)}</div>

          <p className="product-detail-desc">{product.description}</p>

          <div className="product-detail-meta-grid">
            <div className="product-detail-meta-item">
              <span className="meta-item-label">Product ID</span>
              <span className="meta-item-value" style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
                {product.id}
              </span>
            </div>

            <div className="product-detail-meta-item">
              <span className="meta-item-label">Available Stock</span>
              <span className="meta-item-value">{product.stock} units</span>
            </div>

            <div className="product-detail-meta-item">
              <span className="meta-item-label">Added Date</span>
              <span className="meta-item-value">
                {new Date(product.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="product-detail-meta-item">
              <span className="meta-item-label">Last Updated</span>
              <span className="meta-item-value">
                {new Date(product.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {isAuthenticated ? (
            <div className="product-detail-actions">
              <Link to={`/products/${product.id}/edit`} className="btn btn-secondary" style={{ flex: 1 }}>
                <Edit3 size={16} />
                <span>Edit Product</span>
              </Link>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setDeleteModalOpen(true)}
                style={{ flex: 1 }}
              >
                <Trash2 size={16} />
                <span>Delete Product</span>
              </button>
            </div>
          ) : (
            <div className="alert alert-info" style={{ marginTop: 'auto', marginBottom: 0 }}>
              <div style={{ fontSize: '0.875rem' }}>
                <Link to="/login" style={{ fontWeight: 600, textDecoration: 'underline' }}>
                  Log in
                </Link>{' '}
                to edit or delete this product.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Product"
        message={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
        confirmText="Confirm Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ProductDetails;
