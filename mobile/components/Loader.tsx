import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '@constants/colors';

export const Loader: React.FC = () => (
  <View className="flex-1 items-center justify-center bg-white">
    <ActivityIndicator size="large" color={colors.primary} />
  </View>
);

