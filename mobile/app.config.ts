import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'FoodBae',
  slug: 'foodbae-mobile',
  scheme: 'foodbae',
  userInterfaceStyle: 'automatic',
  extra: {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api'
  },
  plugins: ['expo-asset', 'expo-font', 'expo-video'],
  experiments: {
    typedRoutes: true
  },
  web: {
    bundler: 'metro'
  }
};

export default config;
