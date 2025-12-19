import React, { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import './Home.css';

const Home = () => {
  const { products } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="home">
      <div className="home-container">
        <div className="home-header">
          <h1 className="home-title">Welcome to ASK BuildEase</h1>
          <p className="home-tagline">Making Construction Seamless</p>
          <p className="home-subtitle">One-stop digital marketplace for construction materials, services, and solutions</p>
          <div className="value-props">
            <div className="value-prop-item">
              <strong>Transparent Pricing</strong> - Clear, competitive pricing with no hidden costs
            </div>
            <div className="value-prop-item">
              <strong>AI-Powered Recommendations</strong> - Smart suggestions for optimal material selection
            </div>
            <div className="value-prop-item">
              <strong>Trusted Supplier Network</strong> - Verified suppliers ensuring quality and reliability
            </div>
            <div className="value-prop-item">
              <strong>Real-Time Tracking</strong> - Monitor orders from placement to delivery
            </div>
          </div>
        </div>

        <div className="filters">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search products..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="category-filters">
            {categories.map(category => (
              <button
                key={category}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="products-section">
          {filteredProducts.length > 0 ? (
            <>
              <div className="products-header">
                <h2 className="section-title">
                  {selectedCategory === 'All' ? 'All Products' : selectedCategory} 
                  <span className="product-count"> ({filteredProducts.length})</span>
                </h2>
              </div>
              <div className="products-grid">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          ) : (
            <div className="no-products">
              <p>No products found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

