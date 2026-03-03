import React, { useEffect, useState } from 'react';
import { View, FlatList, RefreshControl, Alert } from 'react-native';
import { fetchRestaurants, RestaurantListResponse } from '@services/restaurant.service';
import { RestaurantCard } from '@components/RestaurantCard';
import { Loader } from '@components/Loader';
import { useRouter } from 'expo-router';

export default function RestaurantsScreen() {
  const [data, setData] = useState<RestaurantListResponse | null>(null);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const load = async (pageToLoad = 1, replace = false) => {
    try {
      if (!refreshing) setLoading(true);
      const res = await fetchRestaurants(pageToLoad, 10);
      setData(prev =>
        replace || !prev
          ? res
          : {
              ...res,
              restaurants: [...prev.restaurants, ...res.restaurants]
            }
      );
      setPage(pageToLoad);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to load restaurants');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load(1, true);
  }, []);

  if (loading && !data) return <Loader />;

  return (
    <View className="flex-1 bg-gray-50 px-4 pt-4">
      <FlatList
        data={data?.restaurants ?? []}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <RestaurantCard
            restaurant={item}
            onPress={() => router.push(`/restaurants/${item.id}` as any)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load(1, true);
            }}
          />
        }
        onEndReached={() => {
          if (data?.pagination.hasNext) load(page + 1);
        }}
        onEndReachedThreshold={0.3}
      />
    </View>
  );
}

