import React from 'react';
import { TextInput, TextInputProps, View, Text } from 'react-native';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
};

export const Input: React.FC<InputProps> = ({ label, error, ...props }) => {
  return (
    <View className="w-full mb-4">
      {label && <Text className="mb-1 text-sm font-medium text-gray-700">{label}</Text>}
      <TextInput
        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-base"
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error && <Text className="mt-1 text-xs text-red-500">{error}</Text>}
    </View>
  );
};

