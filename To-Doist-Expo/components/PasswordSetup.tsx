import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import api, { API_ENDPOINTS } from '../config/api';

interface PasswordSetupProps {
  onPasswordSet?: () => void;
}

const PasswordSetup: React.FC<PasswordSetupProps> = ({ onPasswordSet }) => {
  const { user, refreshUserData } = useAuth();
  const [step, setStep] = useState<'initial' | 'verification'>('initial');
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Show password setup only for OAuth-only users
  if (!user?.is_oauth_only_user) {
    return null;
  }

  const handleRequestPasswordSetup = async () => {
    setLoading(true);
    
    try {
      const response = await api.post(API_ENDPOINTS.PASSWORD_SETUP_REQUEST, {});
      
      Alert.alert(
        'Verification Code Sent',
        response.data.message,
        [{ text: 'OK', onPress: () => setStep('verification') }]
      );
      
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to send verification code'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }
    
    if (verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit verification code');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await api.post(API_ENDPOINTS.PASSWORD_SETUP_SET, {
        code: verificationCode,
        password,
        password_confirm: confirmPassword,
      });
      
      Alert.alert(
        'Success',
        response.data.message,
        [
          {
            text: 'OK',
            onPress: async () => {
              // Refresh user data to update is_oauth_only_user status
              if (refreshUserData) {
                await refreshUserData();
              }
              
              // Reset form
              setVerificationCode('');
              setPassword('');
              setConfirmPassword('');
              setStep('initial');
              
              // Call callback if provided
              if (onPasswordSet) {
                onPasswordSet();
              }
            }
          }
        ]
      );
      
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to set password'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('initial');
    setVerificationCode('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleResendCode = () => {
    handleRequestPasswordSetup();
  };

  return (
    <View style={styles.container}>
      {step === 'initial' && (
        <View style={styles.initialStep}>
          <View style={styles.oauthInfo}>
            <View style={styles.oauthIndicator}>
              <Text style={styles.oauthIcon}>🔐</Text>
              <View style={styles.oauthText}>
                <Text style={styles.oauthTitle}>Google OAuth Account</Text>
                <Text style={styles.oauthDescription}>
                  You're currently using Google OAuth for authentication
                </Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleRequestPasswordSetup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Set Up Password</Text>
            )}
          </TouchableOpacity>
          
          <View style={styles.setupInfo}>
            <Text style={styles.setupInfoTitle}>Why set up a password?</Text>
            <Text style={styles.setupInfoText}>
              • Alternative login method if Google OAuth is unavailable{'\n'}
              • Enhanced account security with multiple authentication options{'\n'}
              • Access to advanced security features
            </Text>
            <View style={styles.securityNote}>
              <Text style={styles.securityNoteText}>
                <Text style={styles.bold}>Security:</Text> Setting up a password requires email verification with a 6-digit code.
              </Text>
            </View>
          </View>
        </View>
      )}

      {step === 'verification' && (
        <View style={styles.verificationStep}>
          <View style={styles.verificationHeader}>
            <Text style={styles.verificationTitle}>Verify and Set Password</Text>
            <Text style={styles.verificationDescription}>
              Enter the 6-digit code sent to your email and your new password.
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Verification Code</Text>
            <TextInput
              style={styles.codeInput}
              value={verificationCode}
              onChangeText={(text) => setVerificationCode(text.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              maxLength={6}
              textAlign="center"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.textInput}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter new password"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.textInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formActions}>
            <TouchableOpacity
              style={[styles.secondaryButton, loading && styles.buttonDisabled]}
              onPress={handleBack}
              disabled={loading}
            >
              <Text style={styles.secondaryButtonText}>Back</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.primaryButton,
                (loading || verificationCode.length !== 6 || !password || !confirmPassword) && styles.buttonDisabled
              ]}
              onPress={handleSetPassword}
              disabled={loading || verificationCode.length !== 6 || !password || !confirmPassword}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Set Password</Text>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.verificationInfo}>
            <Text style={styles.codeInfo}>
              📧 Code expires in 10 minutes. Check your spam folder if you don't see the email.
            </Text>
            <TouchableOpacity onPress={handleResendCode} disabled={loading}>
              <Text style={[styles.linkText, loading && styles.linkTextDisabled]}>
                Resend code
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  initialStep: {
    gap: 20,
  },
  oauthInfo: {
    marginBottom: 10,
  },
  oauthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6f42c1',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  oauthIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  oauthText: {
    flex: 1,
  },
  oauthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  oauthDescription: {
    fontSize: 14,
    color: '#6c757d',
  },
  setupInfo: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#17a2b8',
  },
  setupInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 10,
  },
  setupInfoText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    marginBottom: 15,
  },
  securityNote: {
    padding: 12,
    backgroundColor: '#fff3cd',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  securityNoteText: {
    fontSize: 14,
    color: '#856404',
  },
  bold: {
    fontWeight: '600',
  },
  verificationStep: {
    gap: 20,
  },
  verificationHeader: {
    alignItems: 'center',
    marginBottom: 10,
  },
  verificationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  verificationDescription: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 6,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  codeInput: {
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 6,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 20,
    fontWeight: '600',
    backgroundColor: 'white',
    letterSpacing: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  formActions: {
    flexDirection: 'row',
    gap: 15,
    justifyContent: 'space-between',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  verificationInfo: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    alignItems: 'center',
  },
  codeInfo: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 10,
  },
  linkText: {
    color: '#007bff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  linkTextDisabled: {
    color: '#6c757d',
    textDecorationLine: 'none',
  },
});

export default PasswordSetup;