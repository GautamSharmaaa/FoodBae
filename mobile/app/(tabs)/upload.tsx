import React, { useEffect, useState } from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { fetchRestaurants } from '@services/restaurant.service';
import { uploadVideo } from '@services/video.service';
import type { Restaurant } from '@types/restaurant';

export default function UploadScreen() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchRestaurants(1, 50);
        setRestaurants(res.restaurants);
        if (res.restaurants[0]) setSelectedRestaurantId(res.restaurants[0].id);
      } catch (e: any) {
        Alert.alert('Error', e.message ?? 'Failed to load restaurants');
      }
    })();
  }, []);

  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'We need access to your media library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 1
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setVideoUri(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!videoUri || !selectedRestaurantId) {
      Alert.alert('Missing data', 'Please select a video and restaurant.');
      return;
    }
    try {
      setUploading(true);
      setProgress(0);
      await uploadVideo({
        uri: videoUri,
        restaurantId: selectedRestaurantId,
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        onProgress: setProgress
      });
      Alert.alert('Success', 'Video uploaded successfully.');
      setVideoUri(null);
      setTitle('');
      setDescription('');
      setProgress(0);
    } catch (e: any) {
      Alert.alert('Upload failed', e.message ?? 'Please try again');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View className="flex-1 bg-white px-4 pt-4">
      <Text className="text-xl font-semibold mb-4 text-gray-900">Upload a new reel</Text>

      <TouchableOpacity
        onPress={pickVideo}
        className="mb-4 h-40 rounded-2xl border border-dashed border-gray-300 items-center justify-center bg-gray-50"
      >
        <Text className="text-gray-500">
          {videoUri ? 'Change selected video' : 'Tap to select a video from gallery'}
        </Text>
      </TouchableOpacity>

      <Input label="Title" value={title} onChangeText={setTitle} />
      <Input
        label="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />

      <Text className="mt-2 mb-1 text-sm font-medium text-gray-700">Restaurant</Text>
      <View className="mb-4 rounded-xl border border-gray-200 bg-white">
        {restaurants.map(r => (
          <TouchableOpacity
            key={r.id}
            onPress={() => setSelectedRestaurantId(r.id)}
            className={`px-4 py-3 ${
              selectedRestaurantId === r.id ? 'bg-primary/10' : ''
            }`}
          >
            <Text
              className={
                selectedRestaurantId === r.id
                  ? 'text-primary font-semibold'
                  : 'text-gray-800'
              }
            >
              {r.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {uploading && (
        <Text className="mb-2 text-xs text-gray-500">Uploading… {progress}%</Text>
      )}

      <Button
        title="Upload"
        onPress={handleUpload}
        loading={uploading}
        disabled={!videoUri || !selectedRestaurantId}
      />
    </View>
  );
}

