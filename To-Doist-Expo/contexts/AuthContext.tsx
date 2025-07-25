import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api, { tokenStorage, API_ENDPOINTS } from '../config/api';

// User interface
interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_email_verified: boolean;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, confirmPassword: string, firstName: string, lastName: string) => Promise<{success: boolean, message: string} | void>;
  googleLogin: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const token = await tokenStorage.getToken('accessToken');
      
      if (token) {
        // Verify token and get user info
        const response = await api.get(API_ENDPOINTS.USER_PROFILE);
        setUser(response.data);
      }
    } catch (error) {
      // Token invalid or expired, clear storage
      await tokenStorage.removeToken('accessToken');
      await tokenStorage.removeToken('refreshToken');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post(API_ENDPOINTS.LOGIN, {
        email,
        password,
      });

      const { access, refresh, user: userData } = response.data;

      // Store tokens
      await tokenStorage.setToken('accessToken', access);
      await tokenStorage.setToken('refreshToken', refresh);

      setUser(userData);
    } catch (error: any) {
      let errorMessage = 'Login failed';
      
      if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Service may be unavailable. Please try again later.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message === 'Network Error') {
        errorMessage = 'Network error. Please check your connection.';
      }

      throw new Error(errorMessage);
    }
  };

  const register = async (username: string, email: string, password: string, confirmPassword: string, firstName: string, lastName: string): Promise<{success: boolean, message: string} | void> => {
    try {
      const response = await api.post(API_ENDPOINTS.REGISTER, {
        username,
        email,
        password,
        password_confirm: confirmPassword,
        first_name: firstName,
        last_name: lastName,
      });

      // Check if response contains tokens (immediate login) or just success message
      if (response.data.access && response.data.refresh) {
        // Immediate login after registration
        const { access, refresh, user: userData } = response.data;
        
        // Store tokens
        await tokenStorage.setToken('accessToken', access);
        await tokenStorage.setToken('refreshToken', refresh);
        
        setUser(userData);
      } else {
        // Registration successful but needs email verification
        return {
          success: true,
          message: response.data.message || 'Registration successful! Please check your email to verify your account.'
        };
      }
    } catch (error: any) {
      let errorMessage = 'Registration failed';
      
      if (error.response?.status === 400) {
        if (error.response.data?.email) {
          errorMessage = 'Email already exists';
        } else if (error.response.data?.password) {
          errorMessage = error.response.data.password[0];
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.response?.status >= 500) {
        errorMessage = 'Service may be unavailable. Please try again later.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Network error. Please check your connection.';
      }

      throw new Error(errorMessage);
    }
  };

  const googleLogin = async (credential: string) => {
    try {
      const response = await api.post(API_ENDPOINTS.GOOGLE_OAUTH, {
        token: credential,
      });

      const { access, refresh, user: userData } = response.data;

      // Store tokens
      await tokenStorage.setToken('accessToken', access);
      await tokenStorage.setToken('refreshToken', refresh);

      setUser(userData);
    } catch (error: any) {
      let errorMessage = 'Google authentication failed';
      
      if (error.response?.status >= 500) {
        errorMessage = 'Service may be unavailable. Please try again later.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message === 'Network Error') {
        errorMessage = 'Network error. Please check your connection.';
      }

      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      // Remove tokens from storage
      await tokenStorage.removeToken('accessToken');
      await tokenStorage.removeToken('refreshToken');
      
      // Clear user state
      setUser(null);
      
      // Optional: Call backend logout endpoint
      // await api.post('/logout/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if backend call fails
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    googleLogin,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};