import React, { useEffect, useRef } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { Video, AVPlaybackStatus } from 'expo-av';
import { Video as VideoType } from '@types/video';
import { Restaurant } from '@types/restaurant';
import { Heart, Message } from 'react-native-iconly';

const { height } = Dimensions.get('window');

type Props = {
  video: VideoType & { restaurant?: Pick<Restaurant, 'name'> };
  isActive: boolean;
};

export const VideoCard: React.FC<Props> = ({ video, isActive }) => {
  const ref = useRef<Video | null>(null);

  useEffect(() => {
    let isMounted = true;
    const togglePlayback = async () => {
      const instance = ref.current;
      if (!instance) return;

      const status = (await instance.getStatusAsync()) as AVPlaybackStatus;
      if (!isMounted || !status.isLoaded) return;

      if (isActive && !status.isPlaying) {
        await instance.playAsync();
      } else if (!isActive && status.isPlaying) {
        await instance.pauseAsync();
      }
    };
    togglePlayback();
    return () => {
      isMounted = false;
    };
  }, [isActive]);

  return (
    <View className="flex-1 bg-black">
      <Video
        ref={ref}
        source={{ uri: video.url }}
        style={{ width: '100%', height }}
        resizeMode="cover"
        isLooping
        shouldPlay={isActive}
      />
      <View className="absolute bottom-16 left-4 right-4">
        <Text className="text-white text-sm font-semibold mb-1">
          {video.restaurant?.name ?? ''}
        </Text>
        {video.title && (
          <Text className="text-white text-base font-bold mb-1">{video.title}</Text>
        )}
        {video.description && (
          <Text className="text-gray-200 text-xs mb-3" numberOfLines={3}>
            {video.description}
          </Text>
        )}

        <View className="flex-row items-center mt-2">
          <View className="mr-4 flex-row items-center">
            <Heart set="bold" color="white" size={24} />
            <Text className="ml-1 text-white text-xs">Like</Text>
          </View>
          <View className="flex-row items-center">
            <Message set="bold" color="white" size={24} />
            <Text className="ml-1 text-white text-xs">Comment</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

