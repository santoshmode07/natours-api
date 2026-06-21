import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

// Create the broadcast context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Background validation: verify if the JWT cookie is still valid
  useEffect(() => {
    const verifyUserSession = async () => {
      try {
        const response = await api.get('/users/me');
        if (response.data.status === 'success') {
          const freshUser = response.data.data.data || response.data.data.user;
          setUser(freshUser);
        }
      } catch (err) {
        console.warn('Session check failed: User is not authenticated via cookies.');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyUserSession();
  }, []);

  // Login handler
  const loginUser = (userData) => {
    setUser(userData);
  };

  // Logout handler
  const logoutUser = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to consume the auth context easily
export const useAuth = () => useContext(AuthContext);
