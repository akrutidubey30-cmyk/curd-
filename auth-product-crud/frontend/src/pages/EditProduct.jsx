import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService } from '../services/api';
import AlertMessage from '../components/AlertMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import { Edit3, ArrowLeft, Save } from 'lucide-react';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    image: ''
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [serverValidationErrors, setServerValidationErrors] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productService.getById(id);
        if (data.success && data.product) {
          const p = data.product;
          setFormData({
            name: p.name || '',
            description: p.description || '',
            price: p.price !== undefined ? p.price.toString() : '',
            stock: p.stock !== undefined ? p.stock.toString() : '',
            category: p.category || '',
            image: p.image || ''
          });
        }
      } catch (err) {
        console.error('Failed to load product', err);
        setServerError('Product not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }

    if (
      formData.stock === '' ||
      isNaN(formData.stock) ||
      parseInt(formData.stock, 10) < 0 ||
      !Number.isInteger(Number(formData.stock))
    ) {
      newErrors.stock = 'Stock must be a non-negative integer (e.g. 0, 10, 50)';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Please select a category';
    }

    if (formData.image.trim() && !/^https?:\/\/.+/i.test(formData.image.trim())) {
      newErrors.image = 'Image must be a valid URL (starting with http:// or https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setServerValidationErrors([]);

    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
        category: formData.category.trim(),
        image: formData.image.trim()
      };

      const res = await productService.update(id, payload);
      if (res.success) {
        navigate(`/products/${id}`);
      }
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.errors && Array.isArray(resp.errors)) {
        setServerValidationErrors(resp.errors);
      } else if (resp?.message) {
        setServerError(resp.message);
      } else {
        setServerError('Failed to update product. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading product details..." />;
  }

  return (
    <div className="form-wrapper">
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to={`/products/${id}`} className="btn btn-outline btn-sm">
          <ArrowLeft size={16} />
          <span>Back to Product Details</span>
        </Link>
      </div>

      <div className="card" style={{ padding: '2.5rem' }}>
        <div className="form-header" style={{ textAlign: 'left', marginBottom: '1.75rem' }}>
          <h1 className="form-title">Edit Product</h1>
          <p className="form-subtitle">Update product information and inventory stock levels</p>
        </div>

        {serverError && <AlertMessage type="danger" message={serverError} />}
        {serverValidationErrors.length > 0 && (
          <AlertMessage
            type="danger"
            message="Server validation errors:"
            errors={serverValidationErrors}
          />
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Product Name *
            </label>
            <input
              id="name"
              type="text"
              name="name"
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              value={formData.name}
              onChange={handleChange}
              disabled={submitting}
            />
            {errors.name && <p className="form-error-msg">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="category">
              Category *
            </label>
            <select
              id="category"
              name="category"
              className={`form-control ${errors.category ? 'is-invalid' : ''}`}
              value={formData.category}
              onChange={handleChange}
              disabled={submitting}
            >
              <option value="">Select a category</option>
              <option value="Electronics">Electronics</option>
              <option value="Accessories">Accessories</option>
              <option value="Wearables">Wearables</option>
              <option value="Fashion">Fashion</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Home & Office">Home & Office</option>
            </select>
            {errors.category && <p className="form-error-msg">{errors.category}</p>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="price">
                Price (USD) *
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                name="price"
                className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                value={formData.price}
                onChange={handleChange}
                disabled={submitting}
              />
              {errors.price && <p className="form-error-msg">{errors.price}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="stock">
                Stock Quantity *
              </label>
              <input
                id="stock"
                type="number"
                step="1"
                min="0"
                name="stock"
                className={`form-control ${errors.stock ? 'is-invalid' : ''}`}
                value={formData.stock}
                onChange={handleChange}
                disabled={submitting}
              />
              {errors.stock && <p className="form-error-msg">{errors.stock}</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className={`form-control ${errors.description ? 'is-invalid' : ''}`}
              value={formData.description}
              onChange={handleChange}
              disabled={submitting}
            />
            {errors.description && <p className="form-error-msg">{errors.description}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="image">
              Image URL
            </label>
            <input
              id="image"
              type="url"
              name="image"
              className={`form-control ${errors.image ? 'is-invalid' : ''}`}
              value={formData.image}
              onChange={handleChange}
              disabled={submitting}
            />
            {errors.image && <p className="form-error-msg">{errors.image}</p>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <Link to={`/products/${id}`} className="btn btn-outline">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="spinner spinner-sm"></span> Saving Changes...
                </span>
              ) : (
                <>
                  <Save size={18} />
                  <span>Update Product</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
