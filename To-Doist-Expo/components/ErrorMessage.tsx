import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ErrorMessageProps {
  message: string;
  onClose?: () => void;
  type?: 'error' | 'warning' | 'network' | 'success';
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onClose, 
  type = 'error' 
}) => {
  const getErrorStyle = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#F0FDF4',
          borderColor: '#BBF7D0',
          borderLeftColor: '#16A34A',
          textColor: '#166534',
          icon: 'checkmark-circle' as const,
        };
      case 'warning':
        return {
          backgroundColor: '#FFFBEB',
          borderColor: '#FED7AA',
          borderLeftColor: '#D97706',
          textColor: '#D97706',
          icon: 'warning' as const,
        };
      case 'network':
        return {
          backgroundColor: '#F3F4F6',
          borderColor: '#D1D5DB',
          borderLeftColor: '#6B7280',
          textColor: '#6B7280',
          icon: 'wifi-off' as const,
        };
      default:
        return {
          backgroundColor: '#FEF2F2',
          borderColor: '#FECACA',
          borderLeftColor: '#DC2626',
          textColor: '#DC2626',
          icon: 'alert-circle' as const,
        };
    }
  };

  const errorStyle = getErrorStyle();

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: errorStyle.backgroundColor,
        borderColor: errorStyle.borderColor,
        borderLeftColor: errorStyle.borderLeftColor,
      }
    ]}>
      <View style={styles.content}>
        <Ionicons 
          name={errorStyle.icon} 
          size={18} 
          color={errorStyle.textColor} 
          style={styles.icon}
        />
        <Text style={[styles.message, { color: errorStyle.textColor }]}>
          {message}
        </Text>
      </View>
      
      {onClose && (
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons 
            name="close" 
            size={16} 
            color={errorStyle.textColor} 
            style={{ opacity: 0.7 }}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 12,
    flexShrink: 0,
  },
  message: {
    fontSize: 15,
    lineHeight: 20,
    flex: 1,
  },
  closeButton: {
    padding: 4,
    marginLeft: 12,
    borderRadius: 4,
    flexShrink: 0,
  },
});

export default ErrorMessage;