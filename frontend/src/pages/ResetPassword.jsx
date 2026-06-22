import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { showAlert } from '../utils/alert';
import { useAuth } from '../context/AuthContext';

const ResetPassword = () => {
  const { loginUser } = useAuth();
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      return showAlert('error', 'Passwords do not match!');
    }
    try {
      setLoading(true);
      const response = await api.patch(`/users/resetPassword/${token}`, {
        password,
        passwordConfirm,
      });

      if (response.data.status === 'success') {
        showAlert('success', 'Password reset successfully! Logging you in...');
        loginUser(response.data.data.user);
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (err) {
      console.error('Reset password error:', err);
      showAlert('error', err.response?.data?.message || 'Token is invalid or has expired. Please request a new link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main">
      <div className="login-form">
        <h2 className="heading-secondary ma-bt-lg">Create a new password</h2>
        
        <form className="form form--reset-password" onSubmit={handleSubmit}>
          <div className="form__group">
            <label className="form__label" htmlFor="password">
              New Password
            </label>
            <input
              id="password"
              className="form__input"
              type="password"
              placeholder="••••••••"
              required
              minLength="8"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form__group ma-bt-lg">
            <label className="form__label" htmlFor="passwordConfirm">
              Confirm Password
            </label>
            <input
              id="passwordConfirm"
              className="form__input"
              type="password"
              placeholder="••••••••"
              required
              minLength="8"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
          </div>

          <div className="form__group">
            <button className="btn btn--green" type="submit" disabled={loading}>
              {loading ? 'Updating password...' : 'Save password'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default ResetPassword;
