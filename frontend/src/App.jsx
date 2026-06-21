import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Overview from './pages/Overview';

// Simple placeholder page components for our router skeleton
const TourDetail = () => <main className="main"><h2>Tour Detail Page Placeholder</h2></main>;
const Login = () => <main className="main"><h2>Login Page Placeholder</h2></main>;
const Signup = () => <main className="main"><h2>Signup Page Placeholder</h2></main>;
const Account = () => <main className="main"><h2>My Account Page Placeholder</h2></main>;
const Bookings = () => <main className="main"><h2>My Bookings Page Placeholder</h2></main>;

// Shared layout placeholders (Navbar and Footer will live here)
const App = () => {
  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Placeholder for Header Navbar */}
        <header className="header">
          <div className="header__logo">
            <img src="/img/logo-white.png" alt="Natours logo" />
          </div>
          <nav className="nav nav--tours">
            <a href="/" className="nav__el">All tours</a>
          </nav>
        </header>

        {/* Dynamic Route Switching Container */}
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/tour/:slug" element={<TourDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/me" element={<Account />} />
          <Route path="/my-tours" element={<Bookings />} />
        </Routes>

        {/* Placeholder for Footer */}
        <footer className="footer">
          <div className="footer__logo">
            <img src="/img/logo-green-small.png" alt="Natours logo" />
          </div>
          <p className="footer__copyright">
            &copy; by Jonas Schmedtmann. Feel free to use this project for your own purposes.
          </p>
        </footer>
      </div>
    </Router>
  );
};

export default App;
