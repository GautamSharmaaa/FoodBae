import React from 'react';
import { View, Text, Alert } from 'react-native';
import { useAuth } from '@hooks/useAuth';
import { Button } from '@components/Button';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to logout');
    }
  };

  return (
    <View className="flex-1 bg-white px-4 pt-8">
      <Text className="text-2xl font-bold mb-2 text-gray-900">Profile</Text>
      {user && (
        <>
          <Text className="text-base text-gray-800">{user.name}</Text>
          <Text className="mt-1 text-sm text-gray-500">{user.email}</Text>
        </>
      )}
      <View className="mt-8">
        <Button title="Logout" variant="outline" onPress={handleLogout} />
      </View>
    </View>
  );
}

