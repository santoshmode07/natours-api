import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { showAlert } from '../utils/alert';

const Login = () => {
  // Local state for form inputs (Controlled Components)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Read target redirect route (defaults to home '/')
  const returnTo = searchParams.get('returnTo') || '/';

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Send credentials to backend POST /api/v1/users/login
      const response = await api.post('/users/login', {
        email,
        password,
      });

      if (response.data.status === 'success') {
        showAlert('success', 'Logged in successfully!');
        // Save user details to localStorage so other pages can detect authenticated state
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        // Delay redirect slightly so the user sees the slide-down alert banner
        setTimeout(() => {
          navigate(returnTo);
          // Force a page refresh to update auth state in App navbar
          window.location.reload();
        }, 1500);
      }
    } catch (err) {
      console.error('Login error:', err);
      // Trigger the slide-down error alert banner
      const errMsg = err.response?.data?.message || 'Invalid email or password. Please try again.';
      showAlert('error', errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main">
      <div className="login-form">
        <h2 className="heading-secondary ma-bt-lg">Log into your account</h2>
        
        <form className="form form--login" onSubmit={handleSubmit}>

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

          <div className="form__group ma-bt-md">
            <label className="form__label" htmlFor="password">
              Password
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

          <div className="form__group ma-bt-md">
            <Link to="/forgot-password" className="btn-text">
              Forgot password?
            </Link>
          </div>

          <div className="form__group ma-bt-md auth-switch">
            Not have an account?{' '}
            <Link to={`/signup?returnTo=${encodeURIComponent(returnTo)}`} className="btn-text">
              Signup
            </Link>
          </div>

          <div className="form__group">
            <button className="btn btn--green" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Login;
