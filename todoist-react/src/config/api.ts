const API_BASE_URL = 'http://192.168.3.2:8000'; // ip da backend

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

// API utility functions
export const apiRequest = async (
  url: string, 
  options: RequestInit = {}
): Promise<any> => {
  const token = localStorage.getItem('access_token');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (response.status === 401) {
      // Token expired, try to refresh
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        const refreshResponse = await fetch(API_ENDPOINTS.REFRESH_TOKEN, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken }),
        });
        
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          localStorage.setItem('access_token', data.access);
          
          // Retry original request with new token
          config.headers = {
            ...config.headers,
            'Authorization': `Bearer ${data.access}`,
          };
          return fetch(url, config);
        } else {
          // Refresh failed, redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          return Promise.reject('Authentication failed');
        }
      }
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export default API_ENDPOINTS;