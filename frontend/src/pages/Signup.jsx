import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { showAlert } from '../utils/alert';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const { loginUser } = useAuth();
  // Controlled component states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  
  // Workflow states
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/';

  // Step 1: Send OTP to email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      return showAlert('error', 'Please provide name and email first.');
    }
    try {
      setLoading(true);
      const response = await api.post('/users/send-otp', {
        name,
        email,
      });

      if (response.data.status === 'success') {
        if (response.data.devOtp) {
          showAlert('info', `Mail server timed out. Using dev backup code: ${response.data.devOtp}`);
          setOtp(response.data.devOtp);
        } else {
          showAlert('success', 'Verification OTP sent to your email!');
        }
        setOtpSent(true);
      }
    } catch (err) {
      console.error('OTP send error:', err);
      showAlert('error', err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Complete signup with OTP and passwords
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      return showAlert('error', 'Passwords do not match!');
    }
    try {
      setLoading(true);
      const response = await api.post('/users/signup', {
        name,
        email,
        otp,
        password,
        passwordConfirm,
      });

      if (response.data.status === 'success') {
        showAlert('success', 'Welcome to Natours! Account created successfully.');
        // Store user metadata inside AuthContext
        loginUser(response.data.data.user);
        
        // Wait for user to read welcome alert banner before redirecting
        setTimeout(() => {
          navigate(returnTo);
        }, 1500);
      }
    } catch (err) {
      console.error('Signup error:', err);
      showAlert('error', err.response?.data?.message || 'Signup failed. Please check your OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main">
      <div className="login-form">
        <h2 className="heading-secondary ma-bt-lg">Create your account</h2>

        {/* 
          Conditional Rendering: 
          If OTP has not been sent yet, show Name and Email fields only.
          If OTP has been sent, render the OTP, Password, and PasswordConfirm fields.
        */}
        {!otpSent ? (
          <form className="form form--signup" onSubmit={handleSendOtp}>
            <div className="form__group">
              <label className="form__label" htmlFor="name">
                Your name
              </label>
              <input
                id="name"
                className="form__input"
                type="text"
                placeholder="John Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form__group ma-bt-md">
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
              Already have an account?{' '}
              <Link to={`/login?returnTo=${encodeURIComponent(returnTo)}`} className="btn-text">
                Login
              </Link>
            </div>

            <div className="form__group">
              <button className="btn btn--green" type="submit" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send Verification OTP'}
              </button>
            </div>
          </form>
        ) : (
          <form className="form form--signup" onSubmit={handleSignupSubmit}>
            <div className="form__group">
              <label className="form__label" htmlFor="name">
                Your name
              </label>
              <input
                id="name"
                className="form__input"
                type="text"
                disabled
                value={name}
              />
            </div>

            <div className="form__group ma-bt-sm">
              <label className="form__label" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                className="form__input"
                type="email"
                disabled
                value={email}
              />
            </div>

            <div className="form__group ma-bt-sm">
              <label className="form__label" htmlFor="otp">
                Verification OTP (check your email)
              </label>
              <input
                id="otp"
                className="form__input"
                type="text"
                placeholder="123456"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <div className="form__group ma-bt-sm">
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
                {loading ? 'Registering...' : 'Complete Signup'}
              </button>
              <button
                className="btn-text"
                type="button"
                style={{ marginLeft: '2rem', fontSize: '1.4rem' }}
                onClick={() => setOtpSent(false)}
              >
                Go Back
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
};

export default Signup;
