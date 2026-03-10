import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, FlatList, Text } from 'react-native';
import { fetchFeed, FeedResponse } from '@services/video.service';
import { VideoCard } from '@components/VideoCard';
import { Loader } from '@components/Loader';
import { Button } from '@components/Button';

export default function FeedScreen() {
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const loadingMoreRef = useRef(false);

  const loadInitial = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchFeed(10, null);
      setFeed(data);
      setCursor(data.nextCursor);
    } catch (e: any) {
      setError(e.message ?? 'Unable to load videos right now.');
      setFeed(null);
      setCursor(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!cursor || loadingMoreRef.current) return;
    try {
      setLoadingMore(true);
      setError(null);
      loadingMoreRef.current = true;
      const data = await fetchFeed(10, cursor);
      setFeed(prev =>
        prev
          ? { videos: [...prev.videos, ...data.videos], nextCursor: data.nextCursor }
          : data
      );
      setCursor(data.nextCursor);
    } catch (e: any) {
      setError(e.message ?? 'Unable to load more videos.');
    } finally {
      setLoadingMore(false);
      loadingMoreRef.current = false;
    }
  }, [cursor]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: { index: number }[] }) => {
      if (viewableItems?.length) {
        setActiveIndex(viewableItems[0].index ?? 0);
      }
    }
  ).current;

  const viewabilityConfig = { itemVisiblePercentThreshold: 80 };

  if (loading && !feed) return <Loader />;

  if (error && !feed) {
    return (
      <View className="flex-1 items-center justify-center bg-black px-6">
        <Text className="mb-3 text-center text-base text-white">{error}</Text>
        <View className="w-full">
          <Button title="Retry" onPress={loadInitial} />
        </View>
      </View>
    );
  }

  if (!feed?.videos?.length) {
    return (
      <View className="flex-1 items-center justify-center bg-black px-6">
        <Text className="mb-3 text-center text-lg font-semibold text-white">
          No videos yet. Be the first to upload.
        </Text>
        <View className="w-full">
          <Button title="Retry" onPress={loadInitial} />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <FlatList
        data={feed?.videos ?? []}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <VideoCard video={item} isActive={index === activeIndex} />
        )}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.5}
        onEndReached={loadMore}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
      />
      {error ? (
        <View className="absolute bottom-6 left-4 right-4 rounded-xl bg-black/70 p-3">
          <Text className="mb-2 text-sm text-white">{error}</Text>
          <Button title="Retry" onPress={loadMore} />
        </View>
      ) : null}
      {loadingMore && <View className="absolute bottom-4 left-0 right-0" />}
    </View>
  );
}
