import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useAuth } from '@hooks/useAuth';
import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { Link, Redirect } from 'expo-router';

export default function LoginScreen() {
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Redirect href="/(tabs)/feed" />;

  const handleLogin = async () => {
    try {
      setLoading(true);
      await login(email.trim(), password);
    } catch (err: any) {
      Alert.alert('Login failed', err.message ?? 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white px-6 justify-center">
      <Text className="text-3xl font-bold mb-6 text-gray-900">Welcome to FoodBae</Text>
      <Input
        label="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <Input
        label="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin} loading={loading} />
      <View className="mt-4 flex-row justify-center">
        <Text className="text-sm text-gray-500">Don't have an account? </Text>
        <Link href="/(auth)/signup" className="text-sm text-primary font-semibold">
          Sign up
        </Link>
      </View>
    </View>
  );
}

