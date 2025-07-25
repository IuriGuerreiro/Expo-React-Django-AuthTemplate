import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { ENV } from './env';

// Backend URL from environment variables
const API_BASE_URL = ENV.API_BASE_URL;

export const API_ENDPOINTS = {
  // Authentication endpoints (matching Django authentication/urls.py)
  LOGIN: `${API_BASE_URL}/api/auth/login/`,
  REGISTER: `${API_BASE_URL}/api/auth/register/`,
  REFRESH_TOKEN: `${API_BASE_URL}/api/auth/token/refresh/`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout/`,
  VERIFY_EMAIL: `${API_BASE_URL}/api/auth/verify-email/`,
  RESEND_VERIFICATION: `${API_BASE_URL}/api/auth/resend-verification/`,
  GOOGLE_OAUTH: `${API_BASE_URL}/api/auth/google-oauth/`,
  
  // User endpoints  
  USER_PROFILE: `${API_BASE_URL}/api/auth/profile/`,
  
  // Todo endpoints (future)
  TODOS: `${API_BASE_URL}/api/todos/`,
};

// Create axios instance
const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Token management functions
export const tokenStorage = {
  async getToken(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  async setToken(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  },

  async removeToken(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },
};

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    console.log('🔍 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      data: config.data
    });
    
    const token = await tokenStorage.getToken('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔍 API Request: Added auth token');
    } else {
      console.log('🔍 API Request: No auth token found');
    }
    return config;
  },
  (error) => {
    console.log('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  async (error) => {
    console.log('❌ API Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    });

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('🔄 API: Attempting token refresh...');
      originalRequest._retry = true;

      try {
        const refreshToken = await tokenStorage.getToken('refreshToken');
        if (refreshToken) {
          console.log('🔍 API: Refreshing token...');
          const response = await axios.post(API_ENDPOINTS.REFRESH_TOKEN, {
            refresh: refreshToken,
          });

          const newAccessToken = response.data.access;
          await tokenStorage.setToken('accessToken', newAccessToken);
          console.log('✅ API: Token refreshed successfully');

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.log('❌ API: Token refresh failed:', refreshError);
        // Refresh failed, remove tokens
        await tokenStorage.removeToken('accessToken');
        await tokenStorage.removeToken('refreshToken');
        // You might want to redirect to login screen here
      }
    }

    return Promise.reject(error);
  }
);

export default api;