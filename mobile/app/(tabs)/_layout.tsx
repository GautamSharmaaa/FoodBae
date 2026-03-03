import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { useAuth } from '@hooks/useAuth';
import { Home, Category, Plus, Profile } from 'react-native-iconly';
import { colors } from '@constants/colors';

export default function TabsLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarStyle: { backgroundColor: '#ffffff' }
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => <Home set="bold" color={color} />
        }}
      />
      <Tabs.Screen
        name="restaurants"
        options={{
          title: 'Restaurants',
          tabBarIcon: ({ color }) => <Category set="bold" color={color} />
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: 'Upload',
          tabBarIcon: ({ color }) => <Plus set="bold" color={color} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Profile set="bold" color={color} />
        }}
      />
    </Tabs>
  );
}

