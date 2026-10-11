import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit3, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const ProductCard = ({ product, onDeleteClick }) => {
  const { isAuthenticated } = useAuth();

  const fallbackImage = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';

  const stockBadge = () => {
    if (product.stock === 0) {
      return <span className="badge badge-out-of-stock">Out of Stock</span>;
    }
    if (product.stock <= 5) {
      return <span className="badge badge-low-stock">Only {product.stock} left</span>;
    }
    return <span className="badge badge-in-stock">In Stock ({product.stock})</span>;
  };

  return (
    <div className="card product-card">
      <div className="product-card-img-wrapper">
        <img
          src={product.image || fallbackImage}
          alt={product.name}
          className="product-card-img"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackImage;
          }}
        />
        <span className="product-card-badge-category">{product.category}</span>
        <div className="product-card-badge-stock">{stockBadge()}</div>
      </div>

      <div className="product-card-body">
        <h3 className="product-card-title" title={product.name}>
          {product.name}
        </h3>
        <p className="product-card-desc">{product.description}</p>

        <div className="product-card-meta">
          <span className="product-card-price">${Number(product.price).toFixed(2)}</span>
          <span className="product-card-stock-text">Stock: {product.stock}</span>
        </div>

        <div className="product-card-actions">
          <Link
            to={`/products/${product.id}`}
            className="btn btn-primary btn-sm"
            style={{ flex: 1 }}
          >
            <Eye size={15} />
            <span>View Details</span>
          </Link>

          {isAuthenticated && (
            <>
              <Link
                to={`/products/${product.id}/edit`}
                className="btn btn-secondary btn-sm"
                title="Edit Product"
              >
                <Edit3 size={15} />
              </Link>
              <button
                type="button"
                onClick={() => onDeleteClick(product)}
                className="btn btn-danger-outline btn-sm"
                title="Delete Product"
              >
                <Trash2 size={15} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
