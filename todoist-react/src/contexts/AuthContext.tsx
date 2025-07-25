import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest, API_ENDPOINTS } from '../config/api';

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<{success: boolean, message: string, email?: string}>;
  verifyEmail: (token: string) => Promise<{success: boolean, message: string}>;
  resendVerification: (email: string) => Promise<{success: boolean, message: string}>;
  googleLogin: (token: string) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      console.log('🔍 AuthContext: Checking auth status...');
      const token = localStorage.getItem('access_token');
      console.log('🔍 AuthContext: Access token found:', !!token);
      
      if (token) {
        try {
          console.log('🔍 AuthContext: Fetching user profile...');
          const userData = await apiRequest(API_ENDPOINTS.USER_PROFILE);
          console.log('✅ AuthContext: User profile fetched:', userData);
          setUser(userData);
        } catch (error) {
          console.log('❌ AuthContext: Failed to fetch user profile:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      setIsLoading(false);
      console.log('🔍 AuthContext: Auth status check complete');
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      console.log('🔍 AuthContext: Starting login process...');
      console.log('🔍 AuthContext: Login URL:', API_ENDPOINTS.LOGIN);
      console.log('🔍 AuthContext: Login data:', { email, password: '***' });
      setIsLoading(true);
      
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      console.log('🔍 AuthContext: Login response status:', response.status);

      if (!response.ok) {
        // Handle server errors (5xx)
        if (response.status >= 500) {
          throw new Error('Service may be unavailable. Please try again later.');
        }
        
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          throw new Error('Service may be unavailable. Please try again later.');
        }
        
        // Handle 401 errors (authentication failures) - show user-friendly messages
        if (response.status === 401) {
          throw new Error(errorData.error || errorData.message || 'Invalid login credentials');
        }
        
        // Handle 403 errors (forbidden - like unverified email)
        if (response.status === 403) {
          throw new Error(errorData.error || errorData.message || 'Access denied');
        }
        
        // For other errors, show generic message
        throw new Error('Service may be unavailable. Please try again later.');
      }

      const data = await response.json();
      console.log('✅ AuthContext: Login successful, response data:', data);
      
      // Store tokens
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      console.log('✅ AuthContext: Tokens stored');
      
      // Set user from response
      setUser(data.user);
      console.log('✅ AuthContext: User set:', data.user);
      
    } catch (error) {
      console.log('❌ AuthContext: Login error:', error);
      // Check if it's a network error or server exception
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Service may be unavailable. Please try again later.');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<{success: boolean, message: string, email?: string}> => {
    try {
      console.log('🔍 AuthContext: Starting registration process...');
      console.log('🔍 AuthContext: Register URL:', API_ENDPOINTS.REGISTER);
      console.log('🔍 AuthContext: Register data:', { ...userData, password: '***' });
      setIsLoading(true);
      
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      console.log('🔍 AuthContext: Register response status:', response.status);
      const data = await response.json();
      console.log('🔍 AuthContext: Register response data:', data);

      if (!response.ok) {
        // Handle server errors (5xx)
        if (response.status >= 500) {
          return {
            success: false,
            message: 'Service may be unavailable. Please try again later.'
          };
        }
        
        // Handle 400 errors (validation errors) - show specific messages
        if (response.status === 400 && data.errors) {
          const errorMessages = [];
          if (data.errors.email) errorMessages.push(`Email: ${data.errors.email}`);
          if (data.errors.password) errorMessages.push(`Password: ${data.errors.password}`);
          if (data.errors.username) errorMessages.push(`Username: ${data.errors.username}`);
          if (data.errors.general) errorMessages.push(data.errors.general);
          
          return {
            success: false,
            message: errorMessages.length > 0 ? errorMessages.join('. ') : (data.error || 'Registration failed')
          };
        }
        
        // For other client errors, show generic message
        return {
          success: false,
          message: 'Service may be unavailable. Please try again later.'
        };
      }

      return {
        success: true,
        message: data.message,
        email: data.email
      };
      
    } catch (error) {
      // Check if it's a network error or server exception
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          message: 'Service may be unavailable. Please try again later.'
        };
      }
      return {
        success: false,
        message: 'Service may be unavailable. Please try again later.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (token: string): Promise<{success: boolean, message: string}> => {
    try {
      const response = await fetch(API_ENDPOINTS.VERIFY_EMAIL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: data.message
        };
      } else {
        return {
          success: false,
          message: data.error || 'Email verification failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Service may be unavailable. Please try again later.'
      };
    }
  };

  const resendVerification = async (email: string): Promise<{success: boolean, message: string}> => {
    try {
      const response = await fetch(API_ENDPOINTS.RESEND_VERIFICATION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: data.message
        };
      } else {
        return {
          success: false,
          message: data.error || 'Failed to resend verification email'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Service may be unavailable. Please try again later.'
      };
    }
  };

  const googleLogin = async (token: string): Promise<void> => {
    try {
      console.log('🔍 GoogleLogin called with token:', token?.substring(0, 20) + '...');
      setIsLoading(true);
      
      console.log('🔍 Making request to:', API_ENDPOINTS.GOOGLE_OAUTH);
      const response = await fetch(API_ENDPOINTS.GOOGLE_OAUTH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      
      console.log('🔍 Google OAuth response status:', response.status);

      if (!response.ok) {
        // Handle server errors (5xx)
        if (response.status >= 500) {
          throw new Error('Service may be unavailable. Please try again later.');
        }
        
        let errorData;
        try {
          errorData = await response.json();
          console.log('🔍 Google OAuth error response:', errorData);
        } catch (jsonError) {
          console.log('❌ Failed to parse error response JSON:', jsonError);
          throw new Error('Service may be unavailable. Please try again later.');
        }
        
        // Handle 400 errors (bad request) - show specific Google auth errors
        if (response.status === 400) {
          console.log('❌ Google OAuth 400 error:', errorData.error);
          throw new Error(errorData.error || 'Google authentication failed');
        }
        
        // For other errors, show generic message
        console.log('❌ Google OAuth other error:', response.status);
        throw new Error('Service may be unavailable. Please try again later.');
      }

      const data = await response.json();
      console.log('✅ Google OAuth success response:', data);
      
      // Store tokens
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      console.log('✅ Tokens stored in localStorage');
      
      // Set user from response
      setUser(data.user);
      console.log('✅ User set in context:', data.user);
      
    } catch (error) {
      console.log('❌ Google OAuth error in AuthContext:', error);
      // Check if it's a network error or server exception
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Service may be unavailable. Please try again later.');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    verifyEmail,
    resendVerification,
    googleLogin,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};