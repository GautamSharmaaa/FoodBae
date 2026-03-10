import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@hooks/useAuth';
import { Loader } from '@components/Loader';

export default function IndexScreen() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  return <Redirect href={user ? '/(tabs)/feed' : '/(auth)/login'} />;
}
