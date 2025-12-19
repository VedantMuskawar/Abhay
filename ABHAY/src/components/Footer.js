import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-logo">ASK BuildEase</h3>
            <p className="footer-tagline">
              Making Construction Seamless
            </p>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Categories</h4>
            <ul className="footer-links">
              <li><Link to="/">Materials</Link></li>
              <li><Link to="/">Structural</Link></li>
              <li><Link to="/">Wood</Link></li>
              <li><Link to="/">Electrical</Link></li>
              <li><Link to="/">Plumbing</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Contact Info</h4>
            <ul className="footer-contact">
              <li>📧 info@askbuildease.com</li>
              <li>📍 Pune, Maharashtra, India</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} ASK BuildEase. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

