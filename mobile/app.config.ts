import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'FoodBae',
  slug: 'foodbae-mobile',
  scheme: 'foodbae',
  extra: {
    apiBaseUrl: 'http://localhost:3000/api'
  },
  experiments: {
    typedRoutes: true
  }
};

export default config;

