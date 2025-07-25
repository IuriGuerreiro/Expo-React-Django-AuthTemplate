import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

declare global {
  interface Window {
    google: any;
  }
}

interface GoogleOAuthProps {
  onError: (error: string) => void;
}

const GoogleOAuth: React.FC<GoogleOAuthProps> = ({ onError }) => {
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const { googleLogin, isLoading } = useAuth();


  useEffect(() => {
    // Set document policies for Google OAuth
    if (document.featurePolicy) {
      try {
        document.featurePolicy.allowsFeature('identity-credentials-get', '*');
      } catch (e) {
        // Feature policy not supported, continue
      }
    }

    // Wait for Google script to load
    const checkGoogleLoaded = (attempts = 0) => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        setIsGoogleLoaded(true);
      } else if (attempts < 50) { // Try for 5 seconds max
        setTimeout(() => checkGoogleLoaded(attempts + 1), 100);
      }
    };

    // Start checking after a small delay to ensure DOM is ready
    setTimeout(() => checkGoogleLoaded(), 500);
  }, []);

  // Separate effect to ensure DOM is ready when Google is loaded
  useEffect(() => {
    if (isGoogleLoaded) {
      // Double-check that button element exists before initializing
      const checkButtonExists = (attempts = 0) => {
        const buttonElement = document.getElementById('google-signin-button');
        
        if (buttonElement) {
          initializeGoogleSignIn();
        } else if (attempts < 10) {
          setTimeout(() => checkButtonExists(attempts + 1), 50);
        }
      };
      
      checkButtonExists();
    }
  }, [isGoogleLoaded]);

  const initializeGoogleSignIn = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    console.log('🔍 Current URL origin:', window.location.origin);
    console.log('🔍 Current URL hostname:', window.location.hostname);
    console.log('🔍 Current URL port:', window.location.port);
    console.log('🔍 Full URL:', window.location.href);
    
    if (!clientId || clientId === 'undefined' || clientId === '' || clientId.trim() === '') {
      onError('Google Client ID not configured');
      return;
    }

    try {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: true,
          itp_support: true,
        });
      } catch (initError) {
        onError('Failed to initialize Google Sign-In');
        return;
      }

      const buttonElement = document.getElementById('google-signin-button');
      if (!buttonElement) {
        return;
      }

      try {
        window.google.accounts.id.renderButton(
          buttonElement,
          {
            theme: 'outline',
            size: 'large',
            width: 400,
            height: 48,
            type: 'standard',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
          }
        );
      } catch (renderError) {
        onError('Failed to render Google Sign-In button');
        return;
      }

    } catch (error) {
      onError('Failed to load Google Sign-In. Please refresh the page.');
    }
  };

  const handleCredentialResponse = async (response: any) => {
    console.log('🔍 Google credential response received:', response);
    try {
      console.log('🔍 Calling googleLogin with credential...');
      await googleLogin(response.credential);
      console.log('✅ Google login successful');
    } catch (error) {
      console.log('❌ Google login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Google authentication failed';
      console.log('❌ Setting error message:', errorMessage);
      onError(errorMessage);
    }
  };


  if (!isGoogleLoaded) {
    return (
      <div className="google-oauth-container">
        <div className="divider">
          <span>or</span>
        </div>
        <div className="google-oauth-loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="google-oauth-container">
      <div className="divider">
        <span>or</span>
      </div>
      <div 
        id="google-signin-button" 
        className={isLoading ? 'google-button-disabled' : ''}
      ></div>
    </div>
  );
};

export default GoogleOAuth;