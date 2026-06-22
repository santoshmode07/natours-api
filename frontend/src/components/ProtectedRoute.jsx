import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show a loading state while checking the user session from the cookie
  if (loading) {
    return (
      <main className="main">
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      </main>
    );
  }

  // Redirect to login if user is not authenticated, saving the target pathname
  if (!user) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />;
  }

  // Render the protected content if logged in
  return children;
};

export default ProtectedRoute;
