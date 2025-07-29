import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import api, { tokenStorage, API_ENDPOINTS } from '../config/api';

// User interface
interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_email_verified: boolean;
  two_factor_enabled?: boolean;
  is_oauth_only_user?: boolean;
}

interface RateLimitStatus {
  can_send: boolean;
  time_remaining: number;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, confirmPassword: string, firstName: string, lastName: string) => Promise<{success: boolean, message: string} | void>;
  resendVerification: (email: string) => Promise<{success: boolean, message: string}>;
  checkEmailRateLimit: (email: string, requestType?: string) => Promise<RateLimitStatus>;
  googleLogin: (googleUserData: any) => Promise<void>;
  refreshUserData: () => Promise<void>;
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

  const googleLogin = async (googleUserData: any) => {
    try {
      console.log('Processing Google login with user data:', googleUserData.email);
      console.log('Platform:', Platform.OS);
      
      // YummiAI approach - Try login first, then registration if user not found
      const enrichedData = {
        ...googleUserData,
        platform: Platform.OS,
        timestamp: new Date().toISOString(),
      };
      
      try {
        // Try login first
        const loginResponse = await api.post(API_ENDPOINTS.GOOGLE_LOGIN, enrichedData);
        
        if (loginResponse.data.success) {
          console.log('Google login successful');
          
          const { tokens, user: userData } = loginResponse.data;
          
          // Store tokens
          await tokenStorage.setToken('accessToken', tokens.access);
          await tokenStorage.setToken('refreshToken', tokens.refresh);
          
          setUser(userData);
          console.log('Google login successful on', Platform.OS);
          return;
        }
      } catch (loginError: any) {
        console.log('Login failed, checking if user needs registration...');
        
        // Check if it's a "user not found" error
        if (loginError.response?.data?.error_code === 'user_not_found') {
          console.log('User not found, attempting registration...');
          
          try {
            // Try registration
            const registerResponse = await api.post(API_ENDPOINTS.GOOGLE_REGISTER, enrichedData);
            
            if (registerResponse.data.success || registerResponse.data.tokens) {
              console.log('Google registration successful');
              
              const { tokens, user: userData } = registerResponse.data;
              
              // Store tokens
              await tokenStorage.setToken('accessToken', tokens.access);
              await tokenStorage.setToken('refreshToken', tokens.refresh);
              
              setUser(userData);
              console.log('Google registration successful on', Platform.OS);
              return;
            } else {
              throw new Error(registerResponse.data.error || 'Registration failed');
            }
          } catch (registerError: any) {
            console.error('Google registration error:', registerError);
            throw new Error(registerError.response?.data?.error || 'Registration failed');
          }
        } else {
          // Some other login error
          throw loginError;
        }
      }
    } catch (error: any) {
      console.error('Google authentication error:', error);
      console.error('Platform:', Platform.OS);
      
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

  const refreshUserData = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.USER_PROFILE);
      setUser(response.data);
    } catch (error) {
      console.log('❌ AuthContext: Failed to refresh user data:', error);
      // Don't logout on refresh failure, just log the error
    }
  };

  const resendVerification = async (email: string): Promise<{success: boolean, message: string}> => {
    try {
      const response = await api.post(API_ENDPOINTS.RESEND_VERIFICATION, { email });
      
      return {
        success: true,
        message: response.data.message || 'Verification email sent successfully'
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to resend verification email';
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  const checkEmailRateLimit = async (email: string, requestType: string = 'email_verification'): Promise<RateLimitStatus> => {
    try {
      const response = await api.post(API_ENDPOINTS.CHECK_EMAIL_RATE_LIMIT, {
        email,
        request_type: requestType,
      });

      return {
        can_send: response.data.can_send,
        time_remaining: response.data.time_remaining
      };
    } catch (error) {
      // On error, assume rate limiting is not active
      console.log('Rate limit check failed:', error);
      return {
        can_send: true,
        time_remaining: 0
      };
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
    resendVerification,
    checkEmailRateLimit,
    googleLogin,
    refreshUserData,
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