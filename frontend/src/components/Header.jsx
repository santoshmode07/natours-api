import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Header = () => {
  const navigate = useNavigate();
  // Retrieve user data from localStorage
  const user = JSON.parse(localStorage.getItem('user'));

  // Logout handler to call API and clear localStorage
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const response = await api.get('/users/logout');
      if (response.data.status === 'success') {
        localStorage.removeItem('user');
        // Force redirect to homepage and refresh auth state
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Logout failed:', err);
      alert('Error logging out. Please try again.');
    }
  };

  return (
    <header className="header">
      {/* Left side: Navigation links */}
      <nav className="nav nav--tours">
        <Link to="/" className="nav__el nav__el--primary">
          All tours
        </Link>
      </nav>

      {/* Middle: Brand logo */}
      <div className="header__logo">
        <img src="/img/logo-white.png" alt="Natours logo" />
      </div>

      {/* Right side: User navigation */}
      <nav className="nav nav--user">
        {user ? (
          <>
            <a href="#" onClick={handleLogout} className="nav__el nav__el--logout">
              Log out
            </a>
            <Link to="/me" className="nav__el">
              <img
                className="nav__user-img"
                src={
                  user.photo && user.photo.startsWith('http')
                    ? user.photo
                    : `/img/users/${user.photo || 'default.jpg'}`
                }
                alt={`Photo of ${user.name}`}
              />
              <span>{user.name?.split(' ')[0]}</span>
            </Link>
          </>
        ) : (
          <>
            <Link to="/login" className="nav__el">
              Log in
            </Link>
            <Link to="/signup" className="nav__el nav__el--cta">
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
