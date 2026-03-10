import '../global.css';
import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '@hooks/useAuth';
import { Loader } from '@components/Loader';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const RootInner: React.FC = () => {
  const { loading } = useAuth();
  if (loading) return <Loader />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="restaurants/[id]" />
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootInner />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
