// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { login as loginApi } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Decode JWT token to get user data
  const decodeToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;

      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Failed to decode token:", e);
      return null;
    }
  };

  // Initialize auth state on mount
  useEffect(() => {
    // Check if token is expired (defined inside to avoid ESLint warning)
    const isTokenExpired = (token) => {
      if (!token) return true;
      const decoded = decodeToken(token);
      if (!decoded || !decoded.exp) return true;
      return decoded.exp * 1000 < Date.now();
    };

    const token = localStorage.getItem("token");

    if (token && !isTokenExpired(token)) {
      const decoded = decodeToken(token);
      const userFromToken = {
        id: decoded.id,
        username: decoded.username || decoded.email?.split('@')[0] || 'User',
        email: decoded.email || '',
        role: decoded.role || 'user',
        status: decoded.status || 'active'
      };
      setUser(userFromToken);
    }

    setLoading(false);

    // Auto-logout interval
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem("token");
      if (currentToken && isTokenExpired(currentToken)) {
        logout();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []); // ✅ no dependency warning now

  const login = async (credentials) => {
    try {
      const response = await loginApi(credentials);
      const { token, user: userData } = response.data;

      if (!token) throw new Error("No token received");

      const decoded = decodeToken(token);
      if (!decoded) throw new Error("Invalid token");

      const finalUser = {
        id: userData?.id || decoded.id,
        username: userData?.username || decoded.username || decoded.email?.split('@')[0] || 'User',
        email: userData?.email || decoded.email || '',
        role: userData?.role || decoded.role || 'user',
        status: userData?.status || decoded.status || 'active'
      };

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(finalUser));
      setUser(finalUser);

      return response;
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isPharmacist: ['pharmacist', 'admin'].includes(user?.role),
    isCashier: ['cashier', 'admin'].includes(user?.role),
    isDoctor: ['doctor', 'admin'].includes(user?.role)
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div>Loading authentication...</div>}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
