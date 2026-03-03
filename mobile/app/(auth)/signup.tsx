import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useAuth } from '@hooks/useAuth';
import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { Link, Redirect } from 'expo-router';

export default function SignupScreen() {
  const { signup, user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Redirect href="/(tabs)/feed" />;

  const handleSignup = async () => {
    try {
      setLoading(true);
      await signup(name.trim(), email.trim(), password);
    } catch (err: any) {
      Alert.alert('Signup failed', err.message ?? 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white px-6 justify-center">
      <Text className="text-3xl font-bold mb-6 text-gray-900">Create your account</Text>
      <Input label="Name" value={name} onChangeText={setName} />
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
      <Button title="Sign up" onPress={handleSignup} loading={loading} />
      <View className="mt-4 flex-row justify-center">
        <Text className="text-sm text-gray-500">Already have an account? </Text>
        <Link href="/(auth)/login" className="text-sm text-primary font-semibold">
          Login
        </Link>
      </View>
    </View>
  );
}

