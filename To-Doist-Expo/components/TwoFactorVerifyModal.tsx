import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import api, { API_ENDPOINTS } from '../config/api';

interface TwoFactorVerifyModalProps {
  action: 'enable' | 'disable';
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

const TwoFactorVerifyModal: React.FC<TwoFactorVerifyModalProps> = ({
  action,
  visible,
  onSuccess,
  onCancel,
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    if (visible) {
      setCode('');
      setError('');
      setTimeLeft(600);
    }
  }, [visible]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (visible && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [visible, timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const purpose = action === 'enable' ? 'enable_2fa' : 'disable_2fa';
      
      await api.post(API_ENDPOINTS.TWO_FACTOR_VERIFY, { code, purpose });
      onSuccess();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Invalid or expired code';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (text: string) => {
    const numericText = text.replace(/\D/g, '').slice(0, 6);
    setCode(numericText);
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {action === 'enable' ? 'Enable' : 'Disable'} Two-Factor Authentication
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.body}>
            <View style={styles.verificationInfo}>
              <Text style={styles.emailIcon}>📧</Text>
              <Text style={styles.infoText}>
                We've sent a 6-digit verification code to your email address. 
                Please enter it below to {action === 'enable' ? 'enable' : 'disable'} 2FA.
              </Text>
            </View>

            <View style={styles.codeInputContainer}>
              <Text style={styles.inputLabel}>Verification Code</Text>
              <TextInput
                style={[styles.codeInput, error && styles.codeInputError]}
                value={code}
                onChangeText={handleCodeChange}
                placeholder="000000"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={6}
                textAlign="center"
                autoFocus
                autoCorrect={false}
                autoCapitalize="none"
                secureTextEntry={false}
              />
              <Text style={styles.codeHint}>
                Enter the 6-digit code from your email
              </Text>
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.timerInfo}>
              {timeLeft > 0 ? (
                <Text style={styles.timer}>
                  ⏰ Code expires in: <Text style={styles.timeLeft}>{formatTime(timeLeft)}</Text>
                </Text>
              ) : (
                <Text style={styles.timerExpired}>
                  ⚠️ Code has expired. Please try again.
                </Text>
              )}
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onCancel}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  (loading || code.length !== 6 || timeLeft <= 0) && styles.buttonDisabled
                ]}
                onPress={handleSubmit}
                disabled={loading || code.length !== 6 || timeLeft <= 0}
              >
                {loading ? (
                  <View style={styles.buttonContent}>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={styles.verifyButtonText}>Verifying...</Text>
                  </View>
                ) : (
                  <Text style={styles.verifyButtonText}>Verify Code</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.3,
        shadowRadius: 60,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#6c757d',
    lineHeight: 24,
  },
  body: {
    padding: 20,
  },
  verificationInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  emailIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  infoText: {
    textAlign: 'center',
    color: '#6c757d',
    lineHeight: 20,
    fontSize: 14,
  },
  codeInputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  codeInput: {
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    fontSize: 24,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 8,
    textAlign: 'center',
  },
  codeInputError: {
    borderColor: '#dc3545',
  },
  codeHint: {
    marginTop: 8,
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  errorContainer: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
    borderRadius: 6,
  },
  errorText: {
    color: '#721c24',
    fontSize: 14,
    textAlign: 'center',
  },
  timerInfo: {
    marginBottom: 30,
    alignItems: 'center',
  },
  timer: {
    fontSize: 14,
    color: '#495057',
  },
  timeLeft: {
    fontWeight: '600',
    color: '#007bff',
  },
  timerExpired: {
    fontSize: 14,
    color: '#dc3545',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#6c757d',
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  verifyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#007bff',
    borderRadius: 6,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default TwoFactorVerifyModal;