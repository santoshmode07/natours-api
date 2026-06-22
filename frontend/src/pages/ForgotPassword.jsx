import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { showAlert } from '../utils/alert';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      return showAlert('error', 'Please provide your email address.');
    }
    try {
      setLoading(true);
      const response = await api.post('/users/forgotPassword', { email });

      if (response.data.status === 'success') {
        showAlert('success', 'Password reset email sent! Check your inbox.');
        setEmail('');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      showAlert('error', err.response?.data?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main">
      <div className="login-form">
        <h2 className="heading-secondary ma-bt-lg">Reset your password</h2>
        <p className="ma-bt-md" style={{ fontSize: '1.4rem', color: '#777' }}>
          Enter your email address below, and we'll send you a link to reset your password.
        </p>

        <form className="form form--forgot-password" onSubmit={handleSubmit}>
          <div className="form__group">
            <label className="form__label" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              className="form__input"
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form__group ma-bt-md auth-switch">
            Remembered your password?{' '}
            <Link to="/login" className="btn-text">
              Login
            </Link>
          </div>

          <div className="form__group">
            <button className="btn btn--green" type="submit" disabled={loading}>
              {loading ? 'Sending link...' : 'Send reset link'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default ForgotPassword;
