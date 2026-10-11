import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  authService,
  setAccessToken as setApiAccessToken,
  setSessionExpiredCallback
} from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Synchronize token state with api service
  const updateToken = useCallback((newToken) => {
    setAccessToken(newToken);
    setApiAccessToken(newToken);
  }, []);

  // Perform logout
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout request failed or server unreachable', err);
    } finally {
      updateToken(null);
      setUser(null);
    }
  }, [updateToken]);

  // Handle session expiration triggered by Axios response interceptor
  useEffect(() => {
    setSessionExpiredCallback(() => {
      updateToken(null);
      setUser(null);
    });
  }, [updateToken]);

  // Silent session restoration on initial page load
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Attempt silent refresh token exchange
        const refreshRes = await authService.refreshToken();
        if (refreshRes.success && refreshRes.accessToken) {
          updateToken(refreshRes.accessToken);
          // Fetch authenticated user profile
          const meRes = await authService.getMe();
          if (meRes.success && meRes.user) {
            setUser(meRes.user);
          }
        }
      } catch (err) {
        // No active or valid refresh cookie, which is normal for logged-out visitors
        updateToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [updateToken]);

  // Login handler
  const login = async ({ email, password }) => {
    const data = await authService.login({ email, password });
    if (data.success && data.accessToken) {
      updateToken(data.accessToken);
      setUser(data.user);
    }
    return data;
  };

  // Register handler (does not set token according to requirements)
  const register = async (userData) => {
    return await authService.register(userData);
  };

  // Refresh user profile helper
  const reloadUser = async () => {
    try {
      const meRes = await authService.getMe();
      if (meRes.success && meRes.user) {
        setUser(meRes.user);
      }
    } catch (err) {
      console.error('Failed to reload user profile', err);
    }
  };

  const value = {
    user,
    accessToken,
    isAuthenticated: !!user && !!accessToken,
    loading,
    login,
    register,
    logout,
    reloadUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
