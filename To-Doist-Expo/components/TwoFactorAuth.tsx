import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import api, { API_ENDPOINTS } from '../config/api';
import TwoFactorVerifyModal from './TwoFactorVerifyModal';

interface TwoFactorStatus {
  two_factor_enabled: boolean;
  email: string;
}

const TwoFactorAuth: React.FC = () => {
  const [twoFactorStatus, setTwoFactorStatus] = useState<TwoFactorStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'enable' | 'disable' | null>(null);

  useEffect(() => {
    fetchTwoFactorStatus();
  }, []);

  const fetchTwoFactorStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get(API_ENDPOINTS.TWO_FACTOR_STATUS);
      setTwoFactorStatus(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch 2FA status');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = async (enable: boolean) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.post(API_ENDPOINTS.TWO_FACTOR_TOGGLE, { enable });

      if (response.data.requires_verification) {
        setPendingAction(enable ? 'enable' : 'disable');
        setShowVerifyModal(true);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to toggle 2FA';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    setShowVerifyModal(false);
    setPendingAction(null);
    fetchTwoFactorStatus();
    Alert.alert(
      'Success',
      `2FA has been successfully ${pendingAction === 'enable' ? 'enabled' : 'disabled'} for your account.`
    );
  };

  const handleVerificationCancel = () => {
    setShowVerifyModal(false);
    setPendingAction(null);
  };

  const confirmToggle = (enable: boolean) => {
    const action = enable ? 'enable' : 'disable';
    Alert.alert(
      `${action === 'enable' ? 'Enable' : 'Disable'} 2FA`,
      `Are you sure you want to ${action} two-factor authentication? A verification code will be sent to your email.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => handleToggle2FA(enable) },
      ]
    );
  };

  if (loading && !twoFactorStatus) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#007bff" />
        <Text style={styles.loadingText}>Loading 2FA settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.statusIndicator}>
            <View style={[
              styles.statusDot,
              twoFactorStatus?.two_factor_enabled ? styles.statusEnabled : styles.statusDisabled
            ]} />
            <Text style={styles.statusText}>
              {twoFactorStatus?.two_factor_enabled ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
          <Text style={styles.title}>Email Two-Factor Authentication</Text>
        </View>
        
        <View style={styles.body}>
          <Text style={styles.description}>
            {twoFactorStatus?.two_factor_enabled 
              ? 'Your account is protected with email-based two-factor authentication. You will receive a verification code via email when signing in.'
              : 'Add an extra layer of security to your account. When enabled, you will receive a verification code via email when signing in.'
            }
          </Text>
          
          {twoFactorStatus?.email && (
            <View style={styles.emailInfo}>
              <Text style={styles.emailLabel}>Email:</Text>
              <Text style={styles.emailValue}>{twoFactorStatus.email}</Text>
            </View>
          )}
          
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          <TouchableOpacity
            style={[
              styles.button,
              twoFactorStatus?.two_factor_enabled ? styles.dangerButton : styles.primaryButton
            ]}
            onPress={() => confirmToggle(!twoFactorStatus?.two_factor_enabled)}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.buttonText}>Processing...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>
                {twoFactorStatus?.two_factor_enabled ? 'Disable 2FA' : 'Enable 2FA'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {showVerifyModal && pendingAction && (
        <TwoFactorVerifyModal
          action={pendingAction}
          visible={showVerifyModal}
          onSuccess={handleVerificationSuccess}
          onCancel={handleVerificationCancel}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 10,
    color: '#6c757d',
    fontSize: 14,
  },
  card: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    backgroundColor: 'white',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  header: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusEnabled: {
    backgroundColor: '#28a745',
  },
  statusDisabled: {
    backgroundColor: '#dc3545',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#495057',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    margin: 0,
  },
  body: {
    padding: 15,
  },
  description: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    marginBottom: 15,
  },
  emailInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
  },
  emailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginRight: 8,
  },
  emailValue: {
    fontSize: 14,
    color: '#495057',
    flex: 1,
  },
  errorContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
    borderRadius: 6,
  },
  errorText: {
    color: '#721c24',
    fontSize: 14,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#007bff',
  },
  dangerButton: {
    backgroundColor: '#dc3545',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
});

export default TwoFactorAuth;