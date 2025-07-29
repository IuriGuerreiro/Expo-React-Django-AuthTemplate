import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import TwoFactorAuth from '../components/TwoFactorAuth';
import PasswordSetup from '../components/PasswordSetup';

interface SettingsScreenProps {
  navigation: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<string>('account');

  const sections = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'account':
        return (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Account Settings</Text>
            <View style={styles.accountInfo}>
              <View style={styles.infoGroup}>
                <Text style={styles.label}>Username</Text>
                <Text style={styles.value}>{user?.username}</Text>
              </View>
              <View style={styles.infoGroup}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{user?.email}</Text>
              </View>
              <View style={styles.infoGroup}>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.value}>{user?.first_name} {user?.last_name}</Text>
              </View>
              <View style={styles.infoGroup}>
                <Text style={styles.label}>Email Verified</Text>
                <Text style={[styles.value, user?.is_email_verified ? styles.verified : styles.unverified]}>
                  {user?.is_email_verified ? '✅ Verified' : '⚠️ Not Verified'}
                </Text>
              </View>
              <View style={styles.infoGroup}>
                <Text style={styles.label}>Account Type</Text>
                <Text style={[styles.value, user?.is_oauth_only_user ? styles.oauthOnly : styles.fullAccount]}>
                  {user?.is_oauth_only_user ? '🔐 Google OAuth Only' : '🔑 Full Account (Google OAuth + Password)'}
                </Text>
              </View>
            </View>
            
            {user?.is_oauth_only_user && (
              <View style={styles.securitySection}>
                <Text style={styles.subsectionTitle}>Password Setup</Text>
                <PasswordSetup />
              </View>
            )}
            
            <View style={styles.securitySection}>
              <Text style={styles.subsectionTitle}>Two-Factor Authentication</Text>
              <TwoFactorAuth />
            </View>
          </View>
        );
      case 'security':
        return (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Security Settings</Text>
            <View style={styles.securityOptions}>
              <View style={styles.securityOption}>
                <Text style={styles.optionTitle}>Two-Factor Authentication</Text>
                <Text style={styles.optionDescription}>Add an extra layer of security to your account</Text>
                <TwoFactorAuth />
              </View>
              <View style={styles.securityOption}>
                <Text style={styles.optionTitle}>Password</Text>
                <Text style={styles.optionDescription}>
                  {user?.is_oauth_only_user 
                    ? 'Set up a password for additional login options' 
                    : 'Change your account password'
                  }
                </Text>
                {user?.is_oauth_only_user ? (
                  <PasswordSetup />
                ) : (
                  <TouchableOpacity style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonText}>Change Password</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.securityOption}>
                <Text style={styles.optionTitle}>Login Sessions</Text>
                <Text style={styles.optionDescription}>Manage your active login sessions</Text>
                <TouchableOpacity style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>View Sessions</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      case 'notifications':
        return (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Notification Settings</Text>
            <Text style={styles.comingSoon}>Manage your notification preferences (Coming soon)</Text>
          </View>
        );
      case 'preferences':
        return (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <Text style={styles.comingSoon}>Customize your experience (Coming soon)</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={logout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.nav}>
            {sections.map((section) => (
              <TouchableOpacity
                key={section.id}
                style={[
                  styles.navItem,
                  activeSection === section.id && styles.navItemActive
                ]}
                onPress={() => setActiveSection(section.id)}
              >
                <Text style={styles.navIcon}>{section.icon}</Text>
                <Text style={[
                  styles.navLabel,
                  activeSection === section.id && styles.navLabelActive
                ]}>
                  {section.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Content */}
        <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
          {renderSectionContent()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#007bff',
    borderRadius: 6,
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#dc3545',
    borderRadius: 6,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  sidebar: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  nav: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
    minWidth: 80,
  },
  navItemActive: {
    backgroundColor: '#007bff',
  },
  navIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#495057',
    textAlign: 'center',
  },
  navLabelActive: {
    color: 'white',
  },
  mainContent: {
    flex: 1,
    padding: 20,
  },
  sectionContent: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 20,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 15,
  },
  accountInfo: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  infoGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#212529',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
  },
  verified: {
    color: '#28a745',
    fontWeight: '600',
  },
  unverified: {
    color: '#dc3545',
    fontWeight: '600',
  },
  oauthOnly: {
    color: '#6f42c1',
    fontWeight: '600',
  },
  fullAccount: {
    color: '#28a745',
    fontWeight: '600',
  },
  securitySection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  securityOptions: {
    gap: 20,
  },
  securityOption: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    backgroundColor: '#fdfdfd',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 5,
  },
  optionDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 15,
  },
  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#6c757d',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  comingSoon: {
    fontSize: 16,
    color: '#6c757d',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default SettingsScreen;