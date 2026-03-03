import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, FlatList } from 'react-native';
import { fetchFeed, FeedResponse } from '@services/video.service';
import { VideoCard } from '@components/VideoCard';
import { Loader } from '@components/Loader';

export default function FeedScreen() {
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const loadingMoreRef = useRef(false);

  const loadInitial = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchFeed(10, null);
      setFeed(data);
      setCursor(data.nextCursor);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!cursor || loadingMoreRef.current) return;
    try {
      setLoadingMore(true);
      loadingMoreRef.current = true;
      const data = await fetchFeed(10, cursor);
      setFeed(prev =>
        prev
          ? { videos: [...prev.videos, ...data.videos], nextCursor: data.nextCursor }
          : data
      );
      setCursor(data.nextCursor);
    } finally {
      setLoadingMore(false);
      loadingMoreRef.current = false;
    }
  }, [cursor]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  if (loading && !feed) return <Loader />;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: { index: number }[] }) => {
      if (viewableItems?.length) {
        setActiveIndex(viewableItems[0].index ?? 0);
      }
    }
  ).current;

  const viewabilityConfig = { itemVisiblePercentThreshold: 80 };

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
      {loadingMore && <View className="absolute bottom-4 left-0 right-0" />}
    </View>
  );
}

