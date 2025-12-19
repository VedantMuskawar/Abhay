import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="cart">
        <div className="cart-container">
          <div className="empty-cart">
            <h2>Your cart is empty</h2>
            <p>Add some products to get started!</p>
            <Link to="/" className="continue-shopping-btn">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart">
      <div className="cart-container">
        <h1 className="cart-title">Shopping Cart</h1>
        
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">
                  <div className="cart-item-icon">
                    {item.category === 'Materials' && '🏗️'}
                    {item.category === 'Structural' && '🔩'}
                    {item.category === 'Wood' && '🪵'}
                    {item.category === 'Insulation' && '🧱'}
                    {item.category === 'Roofing' && '🏠'}
                    {item.category === 'Electrical' && '⚡'}
                    {item.category === 'Plumbing' && '🔧'}
                    {item.category === 'Hardware' && '🔨'}
                    {!['Materials', 'Structural', 'Wood', 'Insulation', 'Roofing', 'Electrical', 'Plumbing', 'Hardware'].includes(item.category) && '📦'}
                  </div>
                </div>
                
                <div className="cart-item-details">
                  <h3 className="cart-item-name">{item.name}</h3>
                  <p className="cart-item-category">{item.category}</p>
                  <div className="cart-item-price">₹{item.price.toLocaleString('en-IN')}</div>
                </div>

                <div className="cart-item-controls">
                  <div className="quantity-controls">
                    <button
                      className="quantity-btn"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="quantity-value">{item.quantity}</span>
                    <button
                      className="quantity-btn"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="cart-item-total">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                  
                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.id)}
                    aria-label="Remove item"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-card">
              <h2 className="summary-title">Order Summary</h2>
              
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{getCartTotal().toLocaleString('en-IN')}</span>
              </div>
              
              <div className="summary-row">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              
              <div className="summary-row">
                <span>Tax</span>
                <span>₹{(getCartTotal() * 0.1).toLocaleString('en-IN')}</span>
              </div>
              
              <div className="summary-divider"></div>
              
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{(getCartTotal() * 1.1).toLocaleString('en-IN')}</span>
              </div>

              <Link to="/checkout" className="checkout-btn">
                Proceed to Checkout
              </Link>
              
              <Link to="/" className="continue-shopping-link">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

