import { ENV } from './env';

// Google OAuth Configuration from environment variables
export const GOOGLE_CONFIG = {
  // Get this from Google Cloud Console - OAuth 2.0 Client IDs
  WEB_CLIENT_ID: ENV.GOOGLE_WEB_CLIENT_ID,
  
  // For Android (if building APK)
  ANDROID_CLIENT_ID: ENV.GOOGLE_ANDROID_CLIENT_ID,
  
  // For iOS (if building for iOS)
  IOS_CLIENT_ID: ENV.GOOGLE_IOS_CLIENT_ID,
};

// Instructions to get Google Client ID:
// 1. Go to Google Cloud Console (console.cloud.google.com)
// 2. Select your project or create a new one
// 3. Go to APIs & Services > Credentials
// 4. Create OAuth 2.0 Client ID for Web application
// 5. Add your authorized JavaScript origins:
//    - http://localhost:8080 (Expo dev server)
//    - http://localhost:8081 (Expo dev server alternate)
//    - Your production domains
// 6. Copy the Client ID and paste it above

export const isGoogleConfigured = () => {
  return Boolean(GOOGLE_CONFIG.WEB_CLIENT_ID && GOOGLE_CONFIG.WEB_CLIENT_ID.trim() !== '');
};