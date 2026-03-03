import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { colors } from '@constants/colors';

type ButtonProps = {
  title: string;
  onPress: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'outline';
};

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled,
  loading,
  variant = 'primary'
}) => {
  const isDisabled = disabled || loading;
  const baseClasses =
    'w-full py-3 rounded-xl flex-row items-center justify-center';
  const variantClasses =
    variant === 'primary'
      ? 'bg-primary'
      : 'border border-primary bg-transparent';
  const textClasses =
    variant === 'primary' ? 'text-white font-semibold' : 'text-primary font-semibold';

  return (
    <TouchableOpacity
      className={`${baseClasses} ${variantClasses} ${isDisabled ? 'opacity-60' : ''}`}
      disabled={isDisabled}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : colors.primary} />
      ) : (
        <Text className={textClasses}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

