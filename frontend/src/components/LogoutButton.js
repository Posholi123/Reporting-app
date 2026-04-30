import React from 'react';
import { Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../config/firebaseConfig';
import { colors } from '../styles/theme';

export const LogoutButton = ({ navigation }) => {
  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Logout Failed', error.message);
    }
  };

  return (
    <Ionicons
      name="log-out"
      size={24}
      color={colors.textPrimary}
      style={{ marginRight: 15 }}
      onPress={handleLogout}
    />
  );
};