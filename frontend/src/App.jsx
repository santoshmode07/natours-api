import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Overview from './pages/Overview';

import TourDetail from './pages/TourDetail';

import Login from './pages/Login';

import Header from './components/Header';
import Footer from './components/Footer';

import Signup from './pages/Signup';
import Account from './pages/Account';
import Bookings from './pages/Bookings';
import MyReviews from './pages/MyReviews';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

// Shared layout placeholders (Navbar and Footer will live here)
const App = () => {
  return (
    <AuthProvider>
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
          
          <Route 
            path="/me" 
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/my-tours" 
            element={
              <ProtectedRoute>
                <Bookings />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/my-reviews" 
            element={
              <ProtectedRoute>
                <MyReviews />
              </ProtectedRoute>
            } 
          />

          {/* Catch-all Not Found Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Real Footer component */}
        <Footer />
      </div>
    </Router>
  </AuthProvider>
  );
};

export default App;
