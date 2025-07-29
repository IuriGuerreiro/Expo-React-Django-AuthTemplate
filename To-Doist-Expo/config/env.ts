import Constants from 'expo-constants';

// Environment configuration utility
export const ENV = {
  // API Configuration
  API_BASE_URL: Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL || 
                process.env.EXPO_PUBLIC_API_BASE_URL || 
                'http://192.168.3.2:8000',

  // Google OAuth Configuration - reads from .env file
  GOOGLE_WEB_CLIENT_ID: Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 
                       process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 
                       '',

  GOOGLE_ANDROID_CLIENT_ID: Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || 
                           process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || 
                           '',

  GOOGLE_IOS_CLIENT_ID: Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || 
                       process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || 
                       '',

  // Development Settings
  APP_ENV: Constants.expoConfig?.extra?.EXPO_PUBLIC_APP_ENV || 
          process.env.EXPO_PUBLIC_APP_ENV || 
          'development',

  DEBUG_MODE: Constants.expoConfig?.extra?.EXPO_PUBLIC_DEBUG_MODE === 'true' || 
             process.env.EXPO_PUBLIC_DEBUG_MODE === 'true' || 
             false,
} as const;

// Validation functions
export const validateEnv = () => {
  const errors: string[] = [];

  if (!ENV.API_BASE_URL) {
    errors.push('EXPO_PUBLIC_API_BASE_URL is required');
  }

  if (!ENV.GOOGLE_WEB_CLIENT_ID) {
    console.warn('⚠️ EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID not set - Google OAuth will be disabled');
  }

  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
  }

  return true;
};

// Development helpers
export const isDevelopment = () => ENV.APP_ENV === 'development';
export const isProduction = () => ENV.APP_ENV === 'production';
export const isDebugMode = () => ENV.DEBUG_MODE && isDevelopment();

// Log environment info (only in development)
if (isDevelopment()) {
  console.log('🔧 Environment Configuration:');
  console.log('- API Base URL:', ENV.API_BASE_URL);
  console.log('- Google Client ID configured:', !!ENV.GOOGLE_WEB_CLIENT_ID);
  console.log('- Debug Mode:', ENV.DEBUG_MODE);
  console.log('- App Environment:', ENV.APP_ENV);
}