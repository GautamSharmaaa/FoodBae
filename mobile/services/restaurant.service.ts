import { api } from './api';
import type { Restaurant } from '@types/restaurant';

export type RestaurantListResponse = {
  restaurants: Restaurant[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

export const fetchRestaurants = async (
  page = 1,
  limit = 10
): Promise<RestaurantListResponse> => {
  const res = await api.get('/restaurants', { params: { page, limit } });
  if (!res.data?.success) throw new Error(res.data?.message ?? 'Failed to load restaurants');
  const data = res.data.data as RestaurantListResponse & { restaurants: any[] };
  data.restaurants = data.restaurants.map((r: any) => ({
    ...r,
    videosCount: r._count?.videos ?? r.videosCount
  })) as Restaurant[];
  return data;
};

export const fetchRestaurantDetail = async (id: string) => {
  const res = await api.get(`/restaurants/${id}`);
  if (!res.data?.success) throw new Error(res.data?.message ?? 'Failed to load restaurant');
  return res.data.data as any;
};

export const fetchRestaurantVideos = async (id: string) => {
  const res = await api.get(`/restaurants/${id}/videos`);
  if (!res.data?.success) throw new Error(res.data?.message ?? 'Failed to load videos');
  return res.data.data as any[];
};

