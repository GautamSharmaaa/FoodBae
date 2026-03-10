import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Video as VideoType } from '@types/video';
import { Restaurant } from '@types/restaurant';

const { height } = Dimensions.get('window');

type Props = {
  video: VideoType & { restaurant?: Pick<Restaurant, 'name'> };
  isActive: boolean;
};

export const VideoCard: React.FC<Props> = ({ video, isActive }) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isPausedByUser, setIsPausedByUser] = useState(false);
  const player = useVideoPlayer(video.url, videoPlayer => {
    videoPlayer.loop = true;
    videoPlayer.muted = true;
    videoPlayer.volume = 1;
  });

  useEffect(() => {
    player.muted = isMuted;
  }, [isMuted, player]);

  useEffect(() => {
    const subscription = player.addListener('mutedChange', ({ muted }) => {
      setIsMuted(muted);
    });

    return () => {
      subscription.remove();
    };
  }, [player]);

  useEffect(() => {
    if (isActive && !isPausedByUser) {
      player.play();
    } else {
      player.pause();
    }

    return () => {
      player.pause();
    };
  }, [isActive, isPausedByUser, player]);

  useEffect(() => {
    if (!isActive && isPausedByUser) {
      setIsPausedByUser(false);
    }
  }, [isActive, isPausedByUser]);

  const handlePlaybackToggle = () => {
    if (!isActive) return;
    setIsPausedByUser(prev => !prev);
  };

  const handleAudioToggle = () => {
    const nextMuted = !player.muted;
    player.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  return (
    <View className="flex-1 bg-black">
      <VideoView
        player={player}
        style={{ width: '100%', height }}
        contentFit="cover"
        nativeControls={false}
        allowsFullscreen={false}
        playsInline
      />
      <View className="absolute right-4 top-16">
        <TouchableOpacity
          onPress={handleAudioToggle}
          className="rounded-full bg-black/60 p-3"
          activeOpacity={0.85}
        >
          <Ionicons
            name={isMuted ? 'volume-mute' : 'volume-high'}
            color="white"
            size={22}
          />
        </TouchableOpacity>
      </View>
      <View className="absolute inset-0 items-center justify-center">
        <TouchableOpacity
          onPress={handlePlaybackToggle}
          className="rounded-full bg-black/55 p-4"
          activeOpacity={0.85}
        >
          <Ionicons
            name={isActive && !isPausedByUser ? 'pause' : 'play'}
            color="white"
            size={30}
          />
        </TouchableOpacity>
      </View>
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
            <Ionicons name="heart" color="white" size={24} />
            <Text className="ml-1 text-white text-xs">Like</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="chatbubble" color="white" size={24} />
            <Text className="ml-1 text-white text-xs">Comment</Text>
          </View>
        </View>
      </View>
    </View>
  );
};
