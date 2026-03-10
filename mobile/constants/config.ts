import Constants from 'expo-constants';

const expoConfiguredUrl =
  (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl;

export const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_URL ?? expoConfiguredUrl ?? 'http://localhost:3000/api';
