export type Video = {
  id: string;
  title?: string | null;
  description?: string | null;
  url: string;
  thumbnailUrl?: string | null;
  publicId?: string | null;
  duration?: number | null;
  restaurantId: string;
  createdAt: string;
};

