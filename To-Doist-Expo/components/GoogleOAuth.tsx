import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../contexts/AuthContext';
import { ENV, isDebugMode } from '../config/env';

// Complete auth session
WebBrowser.maybeCompleteAuthSession();

interface GoogleOAuthProps {
  onError: (error: string) => void;
}

const GoogleOAuth: React.FC<GoogleOAuthProps> = ({ onError }) => {
  const [localLoading, setLocalLoading] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const { googleLogin, isLoading, user } = useAuth();

  // Check if Google is configured
  const isGoogleConfigured = Boolean(ENV.GOOGLE_WEB_CLIENT_ID && ENV.GOOGLE_WEB_CLIENT_ID.trim() !== '');

  // Google OAuth setup
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: ENV.GOOGLE_WEB_CLIENT_ID,
    androidClientId: ENV.GOOGLE_ANDROID_CLIENT_ID || undefined,
    iosClientId: ENV.GOOGLE_IOS_CLIENT_ID || undefined,
    redirectUri: makeRedirectUri({
      scheme: 'com.rshazow.todoist',
    }),
    scopes: ['profile', 'email'],
    responseType: 'token',
  });

  // Handle Google OAuth response
  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleAuthResponse(response);
    } else if (response?.type === 'cancel') {
      if (isDebugMode()) {
        console.log('🚫 Google OAuth cancelled by user');
      }
      setLocalLoading(false);
      setShowLoadingModal(false);
    } else if (response?.type === 'error') {
      console.error('❌ Google OAuth error:', response.error);
      onError('Google authentication failed');
      setLocalLoading(false);
      setShowLoadingModal(false);
    }
  }, [response]);

  const handleGoogleAuthResponse = async (response: any) => {
    try {
      if (isDebugMode()) {
        console.log('🔍 Processing Google auth response...');
      }

      const { access_token } = response.params || response.authentication || {};
      
      if (!access_token) {
        console.error('❌ No access token received from Google');
        onError('Failed to get Google access token');
        setLocalLoading(false);
        setShowLoadingModal(false);
        return;
      }

      // Get user info from Google
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (!userInfoResponse.ok) {
        throw new Error('Failed to fetch Google user info');
      }

      const googleUserData = await userInfoResponse.json();
      
      if (isDebugMode()) {
        console.log('✅ Google user data received:', googleUserData.email);
      }

      // Send to backend via AuthContext
      await googleLogin(access_token);
      
      if (isDebugMode()) {
        console.log('✅ Google login successful');
      }

    } catch (error: any) {
      console.error('❌ Error in handleGoogleAuthResponse:', error);
      
      const isCancellation = error.message?.includes('cancelled') || 
                            error.message?.includes('canceled') ||
                            error.message?.includes('User canceled');
      
      if (!isCancellation) {
        onError(error.message || 'Google authentication failed');
      }
      
      setLocalLoading(false);
      setShowLoadingModal(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (!isGoogleConfigured) {
      onError('Google Sign-In is not configured. Please add your Client ID to .env file.');
      return;
    }

    if (!request) {
      onError('Google Sign-In is not ready. Please try again.');
      return;
    }

    try {
      setLocalLoading(true);
      setShowLoadingModal(true);

      if (isDebugMode()) {
        console.log('🔍 Starting Google OAuth flow...');
        console.log('🔍 Redirect URI:', makeRedirectUri({ scheme: 'com.rshazow.todoist' }));
        console.log('🔍 Request config:', { 
          webClientId: ENV.GOOGLE_WEB_CLIENT_ID?.substring(0, 20) + '...', 
          androidClientId: ENV.GOOGLE_ANDROID_CLIENT_ID?.substring(0, 20) + '...' 
        });
      }

      const result = await promptAsync();
      
      if (result?.type === 'cancel') {
        if (isDebugMode()) {
          console.log('🚫 User cancelled Google OAuth');
        }
        // Don't show error for cancellation
        setLocalLoading(false);
        setShowLoadingModal(false);
      } else if (result?.type !== 'success') {
        console.error('❌ Google OAuth failed:', result);
        onError('Google authentication failed');
        setLocalLoading(false);
        setShowLoadingModal(false);
      }
      // Success case will be handled by useEffect
    } catch (error: any) {
      console.error('❌ Error in handleGoogleAuth:', error);
      
      const isCancellation = error.message?.includes('cancelled') || 
                            error.message?.includes('canceled');
      
      if (!isCancellation) {
        onError('Failed to start Google authentication');
      }
      
      setLocalLoading(false);
      setShowLoadingModal(false);
    }
  };

  // Clear loading state when user is authenticated
  useEffect(() => {
    if (user) {
      if (isDebugMode()) {
        console.log('✅ User authenticated, clearing local loading state');
      }
      setLocalLoading(false);
      setShowLoadingModal(false);
    }
  }, [user]);

  // Clear local loading when AuthContext loading completes
  useEffect(() => {
    if (!isLoading && localLoading) {
      if (isDebugMode()) {
        console.log('✅ AuthContext loading completed, clearing local loading state');
      }
      setLocalLoading(false);
      setShowLoadingModal(false);
    }
  }, [isLoading, localLoading]);

  // Timeout mechanism to prevent infinite loading
  useEffect(() => {
    if (localLoading) {
      const timeout = setTimeout(() => {
        if (isDebugMode()) {
          console.log('⏰ Auth timeout reached, clearing loading state');
        }
        setLocalLoading(false);
        setShowLoadingModal(false);
        onError('Authentication timeout - please try again');
      }, 45000); // 45 seconds timeout for OAuth flows

      return () => clearTimeout(timeout);
    }
  }, [localLoading]);

  const isButtonLoading = isLoading || localLoading;

  if (!isGoogleConfigured) {
    return (
      <View style={styles.container}>
        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.line} />
        </View>
        
        <View style={styles.configMessage}>
          <Ionicons name="information-circle" size={20} color="#6B7280" />
          <Text style={styles.configText}>
            Google Sign-In not configured
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.line} />
      </View>

      <TouchableOpacity 
        style={[styles.googleButton, isButtonLoading && styles.buttonDisabled]}
        onPress={handleGoogleAuth}
        disabled={isButtonLoading}
        activeOpacity={0.8}
      >
        {isButtonLoading ? (
          <>
            <ActivityIndicator size="small" color="#636366" style={styles.loadingIcon} />
            <Text style={[styles.googleButtonText, styles.buttonTextDisabled]}>
              Authenticating...
            </Text>
          </>
        ) : (
          <>
            <Ionicons name="logo-google" size={20} color="#4285F4" style={styles.googleIcon} />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Loading Modal Overlay */}
      <Modal
        visible={showLoadingModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          // Prevent closing modal during OAuth flow
          if (isDebugMode()) {
            console.log('🚫 Modal close requested, but OAuth is in progress');
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#4285F4" style={styles.loadingSpinner} />
            <Text style={styles.loadingTitle}>
              Authenticating with Google...
            </Text>
            <Text style={styles.loadingSubtitle}>
              Please wait while we process your Google login
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 55,
  },
  googleIcon: {
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  loadingIcon: {
    marginRight: 12,
  },
  buttonDisabled: {
    backgroundColor: '#F5F5F5',
    opacity: 0.7,
  },
  buttonTextDisabled: {
    color: '#636366',
  },
  configMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  configText: {
    color: '#6B7280',
    fontSize: 15,
  },
  // Modal overlay styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
    minWidth: 300,
    maxWidth: 320,
  },
  loadingSpinner: {
    marginBottom: 20,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 12,
  },
  loadingSubtitle: {
    fontSize: 14,
    color: '#636366',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
});

export default GoogleOAuth;