import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="contact">
      <div className="contact-container">
        <div className="contact-header">
          <h1 className="page-title">Contact Us</h1>
          <p className="tagline">Making Construction Seamless</p>
          <p className="contact-subtitle">
            Have questions or need assistance? We're here to help. Get in touch with our team.
          </p>
        </div>

        <div className="contact-content">
          <div className="contact-info">
            <div className="info-card">
              <h3>Office Address</h3>
              <p>
                ASK BuildEase<br />
                NICMAR University Campus<br />
                NIBM Road, Kondhwa<br />
                Pune, Maharashtra - 411048<br />
                India
              </p>
            </div>

            <div className="info-card">
              <h3>Contact Information</h3>
              <p>
                <strong>Mobile:</strong> +91-98765-43210<br />
                <strong>Email:</strong> info@askbuildease.com<br />
                <strong>Support:</strong> support@askbuildease.com<br />
                <strong>Business Inquiries:</strong> business@askbuildease.com
              </p>
            </div>

            <div className="info-card">
              <h3>Team Members</h3>
              <p>
                <strong>Krushna Gadewar</strong><br />
                <strong>Abhay Malpani</strong><br />
                <strong>Sanskar Baheti</strong>
              </p>
            </div>

            <div className="info-card">
              <h3>Business Hours</h3>
              <p>
                <strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM<br />
                <strong>Saturday:</strong> 10:00 AM - 4:00 PM<br />
                <strong>Sunday:</strong> Closed
              </p>
            </div>

            <div className="info-card">
              <h3>Emergency Support</h3>
              <p>
                For urgent construction material requirements,<br />
                call our 24/7 emergency helpline:<br />
                <strong>+91-98765-43211</strong><br />
                <strong>WhatsApp:</strong> +91-98765-43210
              </p>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <h2 className="form-title">Send us a Message</h2>
            
            {submitted && (
              <div className="success-message">
                Thank you! Your message has been sent successfully. We'll get back to you soon.
              </div>
            )}

            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject *</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={errors.subject ? 'error' : ''}
              />
              {errors.subject && <span className="error-message">{errors.subject}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="6"
                className={errors.message ? 'error' : ''}
              />
              {errors.message && <span className="error-message">{errors.message}</span>}
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting || submitted}
            >
              {isSubmitting ? 'Sending...' : submitted ? 'Message Sent!' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;

