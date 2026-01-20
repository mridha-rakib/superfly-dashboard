// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function to validate token
  const isTokenValid = (token) => {
    if (!token || typeof token !== 'string') return false;

    try {
      // For now, we'll accept any non-empty string as a valid token
      // In a real app, you'd validate JWT expiration here
      return token.length > 0;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    // Check if user is logged in on app load
    const token = localStorage.getItem('token');
    const userDataString = localStorage.getItem('userData');

    if (token && userDataString && isTokenValid(token)) {
      try {
        const userData = JSON.parse(userDataString);
        setCurrentUser(userData);
      } catch (error) {
        // Invalid userData, clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        setCurrentUser(null);
      }
    } else {
      // Clear invalid data
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      setCurrentUser(null);
    }

    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    setCurrentUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    logout,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}