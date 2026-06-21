import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { showAlert } from '../utils/alert';

const Account = () => {
  const { user, loading, setUser } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in (Protected Route logic)
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login?returnTo=/me');
    }
  }, [user, loading, navigate]);

  // Form 1: Settings states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saveSettingsLoading, setSaveSettingsLoading] = useState(false);

  // Form 2: Password change states
  const [passwordCurrent, setPasswordCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [savePasswordLoading, setSavePasswordLoading] = useState(false);

  // Sync state once user data loads from backend Context API
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Handle setting file selection and instant preview
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Submit Settings update (FormData for profile photo upload support)
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSaveSettingsLoading(true);
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      if (photo) {
        formData.append('photo', photo);
      }

      const response = await api.patch('/users/updateMe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status === 'success') {
        showAlert('success', 'Settings updated successfully!');
        const updatedUser = response.data.user || response.data.data?.user;
        setUser(updatedUser); // Update context state
        setPhoto(null); // Clear selected file state
        setPhotoPreview(null);
      }
    } catch (err) {
      console.error('Settings update error:', err);
      showAlert('error', err.response?.data?.message || 'Error updating settings. Please try again.');
    } finally {
      setSaveSettingsLoading(false);
    }
  };

  // Submit Password update
  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      return showAlert('error', 'New passwords do not match!');
    }
    try {
      setSavePasswordLoading(true);
      const response = await api.patch('/users/updateMypassword', {
        passwordCurrent,
        password,
        passwordConfirm,
      });

      if (response.data.status === 'success') {
        showAlert('success', 'Password updated successfully!');
        // Clear fields on success
        setPasswordCurrent('');
        setPassword('');
        setPasswordConfirm('');
      }
    } catch (err) {
      console.error('Password update error:', err);
      showAlert('error', err.response?.data?.message || 'Error updating password. Please try again.');
    } finally {
      setSavePasswordLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <main className="main">
        <div style={{ textAlign: 'center', fontSize: '2rem', padding: '10rem 0' }}>
          Loading your account settings...
        </div>
      </main>
    );
  }

  // Determine user photo source URL
  const photoSrc = photoPreview
    ? photoPreview
    : user.photo && user.photo.startsWith('http')
    ? user.photo
    : `/img/users/${user.photo || 'default.jpg'}`;

  return (
    <main className="main main--dashboard">
      <div className="user-view">
        {/* Left Sidebar Navigation */}
        <nav className="user-view__menu">
          <ul className="side-nav">
            <li className="side-nav--active">
              <a href="#">
                <svg>
                  <use xlinkHref="/img/icons.svg#icon-settings" />
                </svg>
                Settings
              </a>
            </li>
            <li>
              <Link to="/my-tours">
                <svg>
                  <use xlinkHref="/img/icons.svg#icon-briefcase" />
                </svg>
                My bookings
              </Link>
            </li>
            <li>
              <Link to="/my-reviews">
                <svg>
                  <use xlinkHref="/img/icons.svg#icon-star" />
                </svg>
                My reviews
              </Link>
            </li>
            <li>
              <a href="#">
                <svg>
                  <use xlinkHref="/img/icons.svg#icon-credit-card" />
                </svg>
                Billing
              </a>
            </li>
          </ul>

          {/* Conditional Admin Sidebar Section */}
          {user.role === 'admin' && (
            <div className="admin-nav">
              <h5 className="admin-nav__heading">Admin</h5>
              <ul className="side-nav">
                <li>
                  <a href="#">
                    <svg>
                      <use xlinkHref="/img/icons.svg#icon-map" />
                    </svg>
                    Manage tours
                  </a>
                </li>
                <li>
                  <a href="#">
                    <svg>
                      <use xlinkHref="/img/icons.svg#icon-users" />
                    </svg>
                    Manage users
                  </a>
                </li>
                <li>
                  <a href="#">
                    <svg>
                      <use xlinkHref="/img/icons.svg#icon-star" />
                    </svg>
                    Manage reviews
                  </a>
                </li>
                <li>
                  <a href="#">
                    <svg>
                      <use xlinkHref="/img/icons.svg#icon-briefcase" />
                    </svg>
                    Manage bookings
                  </a>
                </li>
              </ul>
            </div>
          )}
        </nav>

        {/* Main Forms Section */}
        <div className="user-view__content">
          {/* Form 1: Your Account Settings */}
          <div className="user-view__form-container">
            <h2 className="heading-secondary ma-bt-md">Your account settings</h2>
            <form className="form form-user-data" onSubmit={handleSaveSettings}>
              <div className="form__group">
                <label className="form__label" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  className="form__input"
                  type="text"
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
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form__group form__photo-upload">
                <img className="form__user-photo" src={photoSrc} alt="User photo" />
                <input
                  className="form__upload"
                  type="file"
                  accept="image/*"
                  id="photo"
                  name="photo"
                  onChange={handlePhotoChange}
                />
                <label htmlFor="photo">Choose new photo</label>
              </div>

              <div className="form__group right">
                <button className="btn btn--small btn--green" type="submit" disabled={saveSettingsLoading}>
                  {saveSettingsLoading ? 'Saving...' : 'Save settings'}
                </button>
              </div>
            </form>
          </div>

          <div className="line">&nbsp;</div>

          {/* Form 2: Password Change */}
          <div className="user-view__form-container">
            <h2 className="heading-secondary ma-bt-md">Password change</h2>
            <form className="form form-user-password" onSubmit={handleSavePassword}>
              <div className="form__group">
                <label className="form__label" htmlFor="password-current">
                  Current password
                </label>
                <input
                  id="password-current"
                  className="form__input"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength="8"
                  value={passwordCurrent}
                  onChange={(e) => setPasswordCurrent(e.target.value)}
                />
              </div>

              <div className="form__group">
                <label className="form__label" htmlFor="password">
                  New password
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
                <label className="form__label" htmlFor="password-confirm">
                  Confirm password
                </label>
                <input
                  id="password-confirm"
                  className="form__input"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength="8"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                />
              </div>

              <div className="form__group right">
                <button className="btn btn--small btn--green" type="submit" disabled={savePasswordLoading}>
                  {savePasswordLoading ? 'Saving...' : 'Save password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Account;
