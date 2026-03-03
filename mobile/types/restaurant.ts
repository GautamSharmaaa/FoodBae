export type Restaurant = {
  id: string;
  name: string;
  description?: string | null;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  averagePrice?: number | null;
  popularDishes: string[];
  bestTimeToVisit?: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  videosCount?: number;
};

