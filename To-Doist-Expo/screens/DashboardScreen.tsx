import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

interface DashboardScreenProps {
  navigation: any;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Welcome to Todoist</Text>
            <Text style={styles.userText}>
              Hello, {user?.first_name || user?.username}!
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.settingsButton} 
              onPress={() => navigation.navigate('Settings')}
            >
              <Ionicons name="settings-outline" size={24} color="#667eea" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="#667eea" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.welcomeCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="checkmark-circle" size={32} color="#10B981" />
            <Text style={styles.cardTitle}>Dashboard</Text>
          </View>
          
          <Text style={styles.cardSubtitle}>
            You are now logged in successfully!
          </Text>

          <View style={styles.userDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Username:</Text>
              <Text style={styles.detailValue}>{user?.username}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email:</Text>
              <Text style={styles.detailValue}>{user?.email}</Text>
            </View>
            
            {user?.first_name && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Name:</Text>
                <Text style={styles.detailValue}>
                  {user.first_name} {user.last_name}
                </Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email Verified:</Text>
              <View style={styles.verificationStatus}>
                <Ionicons
                  name={user?.is_email_verified ? "checkmark-circle" : "alert-circle"}
                  size={16}
                  color={user?.is_email_verified ? "#10B981" : "#F59E0B"}
                />
                <Text style={[
                  styles.detailValue,
                  { color: user?.is_email_verified ? "#10B981" : "#F59E0B" }
                ]}>
                  {user?.is_email_verified ? "Verified" : "Not Verified"}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>2FA Status:</Text>
              <View style={styles.verificationStatus}>
                <Ionicons
                  name={user?.two_factor_enabled ? "shield-checkmark" : "shield-outline"}
                  size={16}
                  color={user?.two_factor_enabled ? "#10B981" : "#EF4444"}
                />
                <Text style={[
                  styles.detailValue,
                  { color: user?.two_factor_enabled ? "#10B981" : "#EF4444" }
                ]}>
                  {user?.two_factor_enabled ? "Enabled" : "Disabled"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.actionsSection}>
            <TouchableOpacity 
              style={styles.settingsActionButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <Ionicons name="settings-outline" size={20} color="#667eea" />
              <Text style={styles.settingsActionText}>Account Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.featuresCard}>
          <Text style={styles.cardTitle}>Coming Soon</Text>
          <Text style={styles.cardSubtitle}>
            Task management features will be available here
          </Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="list" size={20} color="#667eea" />
              <Text style={styles.featureText}>Create and manage tasks</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="calendar" size={20} color="#667eea" />
              <Text style={styles.featureText}>Set deadlines and reminders</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="stats-chart" size={20} color="#667eea" />
              <Text style={styles.featureText}>Track your productivity</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="sync" size={20} color="#667eea" />
              <Text style={styles.featureText}>Sync across all devices</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  userText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featuresCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 12,
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 24,
  },
  userDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    width: 120,
  },
  detailValue: {
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
  },
  verificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  actionsSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  settingsActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#667eea',
    borderRadius: 8,
  },
  settingsActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default DashboardScreen;