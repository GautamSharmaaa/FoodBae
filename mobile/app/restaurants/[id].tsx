import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, Dimensions, Modal, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchRestaurantDetail } from '@services/restaurant.service';
import { Loader } from '@components/Loader';
import { VideoView, useVideoPlayer } from 'expo-video';

const { width } = Dimensions.get('window');

const RestaurantVideoPreview: React.FC<{ uri: string }> = ({ uri }) => {
  const player = useVideoPlayer(uri, videoPlayer => {
    videoPlayer.loop = true;
    videoPlayer.muted = true;
  });

  return (
    <VideoView
      player={player}
      style={{ width: '100%', height: '100%' }}
      contentFit="cover"
      nativeControls={false}
      allowsFullscreen={false}
      playsInline
    />
  );
};

const RestaurantVideoModalPlayer: React.FC<{ uri: string }> = ({ uri }) => {
  const player = useVideoPlayer(uri, videoPlayer => {
    videoPlayer.loop = true;
  });

  useEffect(() => {
    player.play();
    return () => {
      player.pause();
    };
  }, [player]);

  return (
    <VideoView
      player={player}
      style={{ width, height: '100%' }}
      contentFit="cover"
      nativeControls
      allowsFullscreen
      playsInline
    />
  );
};

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchRestaurantDetail(id);
        setData(res);
      } catch (e: any) {
        Alert.alert('Error', e.message ?? 'Failed to load restaurant', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  if (loading || !data) return <Loader />;

  return (
    <View className="flex-1 bg-white px-4 pt-4">
      <Text className="text-2xl font-bold text-gray-900">{data.name}</Text>
      <Text className="mt-1 text-sm text-gray-600">{data.address}</Text>
      {data.bestTimeToVisit && (
        <Text className="mt-1 text-xs text-gray-500">
          Best time to visit: {data.bestTimeToVisit}
        </Text>
      )}
      {data.popularDishes?.length ? (
        <Text className="mt-2 text-xs text-gray-500">
          Popular: {data.popularDishes.join(', ')}
        </Text>
      ) : null}

      <Text className="mt-4 mb-2 text-base font-semibold text-gray-900">
        Videos
      </Text>
      <FlatList
        data={data.videos ?? []}
        keyExtractor={(item: any) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedVideo(item)}
            className="mr-3 w-40 h-64 rounded-2xl bg-black overflow-hidden"
          >
            <RestaurantVideoPreview uri={item.url} />
          </TouchableOpacity>
        )}
      />

      <Modal visible={!!selectedVideo} animationType="slide" transparent>
        <View className="flex-1 bg-black">
          {selectedVideo && (
            <RestaurantVideoModalPlayer uri={selectedVideo.url} />
          )}
          <TouchableOpacity
            onPress={() => setSelectedVideo(null)}
            className="absolute top-12 right-4 bg-black/60 px-3 py-2 rounded-full"
          >
            <Text className="text-white text-sm">Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
