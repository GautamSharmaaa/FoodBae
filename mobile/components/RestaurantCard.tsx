import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Restaurant } from '@types/restaurant';

type Props = {
  restaurant: Restaurant;
  onPress?: () => void;
};

export const RestaurantCard: React.FC<Props> = ({ restaurant, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="mb-3 rounded-2xl bg-white p-4 shadow-sm"
    >
      <Text className="text-lg font-semibold text-gray-900">{restaurant.name}</Text>
      <Text className="mt-1 text-sm text-gray-500">{restaurant.address}</Text>
      {restaurant.popularDishes?.length ? (
        <Text className="mt-1 text-xs text-gray-400">
          Popular: {restaurant.popularDishes.join(', ')}
        </Text>
      ) : null}
      <Text className="mt-2 text-xs text-gray-500">
        {restaurant.videosCount ?? 0} videos
      </Text>
    </TouchableOpacity>
  );
};

