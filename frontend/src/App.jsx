import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Overview from './pages/Overview';

import TourDetail from './pages/TourDetail';

import Login from './pages/Login';

import Header from './components/Header';
import Footer from './components/Footer';

// Simple placeholder page components for our router skeleton
const Signup = () => <main className="main"><h2>Signup Page Placeholder</h2></main>;
const Account = () => <main className="main"><h2>My Account Page Placeholder</h2></main>;
const Bookings = () => <main className="main"><h2>My Bookings Page Placeholder</h2></main>;

// Shared layout placeholders (Navbar and Footer will live here)
const App = () => {
  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Real Header component */}
        <Header />

        {/* Dynamic Route Switching Container */}
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/tour/:slug" element={<TourDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/me" element={<Account />} />
          <Route path="/my-tours" element={<Bookings />} />
        </Routes>

        {/* Real Footer component */}
        <Footer />
      </div>
    </Router>
  );
};

export default App;
