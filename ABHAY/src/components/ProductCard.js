import React from 'react';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  const getProductIcon = (category, name) => {
    const icons = {
      'Materials': '🏗️',
      'Structural': '🔩',
      'Wood': '🪵',
      'Insulation': '🧱',
      'Roofing': '🏠',
      'Electrical': '⚡',
      'Plumbing': '🔧',
      'Hardware': '🔨'
    };
    return icons[category] || '📦';
  };

  return (
    <div className="product-card">
      <div className="product-image-container">
        <div className="product-image-fallback">
          <span className="product-icon">{getProductIcon(product.category, product.name)}</span>
          <span className="product-icon-text">{product.name}</span>
        </div>
        {product.stock < 10 && product.stock > 0 && (
          <span className="stock-badge low-stock">Low Stock</span>
        )}
        {product.stock === 0 && (
          <span className="stock-badge out-of-stock">Out of Stock</span>
        )}
      </div>
      
      <div className="product-info">
        <div className="product-category">{product.category}</div>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        
        <div className="product-footer">
          <div className="product-price">₹{product.price.toLocaleString('en-IN')}</div>
          <button
            className="add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

