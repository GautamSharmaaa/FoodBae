import axios from 'axios';
import { api } from './api';
import type { Video } from '@types/video';

export type FeedResponse = {
  videos: (Video & { restaurant?: { id: string; name: string } })[];
  nextCursor: string | null;
};

export const fetchFeed = async (
  limit = 10,
  cursor?: string | null
): Promise<FeedResponse> => {
  try {
    const res = await api.get('/videos/feed', {
      params: { limit, cursor: cursor ?? undefined }
    });
    if (!res.data?.success) throw new Error(res.data?.message ?? 'Failed to load feed');
    return res.data.data as FeedResponse;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message ?? 'Unable to load videos right now.');
    }

    throw error;
  }
};

export const uploadVideo = async (params: {
  uri: string;
  restaurantId: string;
  title?: string;
  description?: string;
  onProgress?: (progress: number) => void;
}): Promise<Video> => {
  const formData = new FormData();
  const filename = params.uri.split('/').pop() ?? 'video.mp4';

  formData.append('video', {
    uri: params.uri,
    name: filename,
    type: 'video/mp4'
  } as any);
  formData.append('restaurantId', params.restaurantId);
  if (params.title) formData.append('title', params.title);
  if (params.description) formData.append('description', params.description);

  const res = await api.post('/videos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: e => {
      if (!params.onProgress || !e.total) return;
      params.onProgress(Math.round((e.loaded / e.total) * 100));
    }
  });

  if (!res.data?.success) throw new Error(res.data?.message ?? 'Upload failed');
  return res.data.data as Video;
};
