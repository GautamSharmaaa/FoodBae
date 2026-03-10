import { prisma } from '../../config/prisma';
import { cloudinary } from '../../config/cloudinary';
import { z } from 'zod';
import type { UploadApiResponse } from 'cloudinary';
import { AppError } from '../../utils/errors';
import { decodeFeedCursor, encodeFeedCursor } from '../../utils/validation';

export const uploadVideoSchema = z.object({
    restaurantId: z.string().uuid('restaurantId must be a valid UUID.'),
    title: z.string().min(1, 'Title is required.').max(200).optional(),
    description: z.string().max(1000).optional(),
});

export type UploadVideoInput = z.infer<typeof uploadVideoSchema>;

async function uploadToCloudinary(file: Express.Multer.File): Promise<UploadApiResponse> {
    try {
        return await cloudinary.uploader.upload(file.path, {
            resource_type: 'video',
            folder: 'foodbae/reels',
        });
    } catch {
        throw new AppError('Failed to upload video.', 502);
    }
}

export async function uploadVideo(
    ownerId: string,
    input: UploadVideoInput,
    file: Express.Multer.File
) {
    const restaurant = await prisma.restaurant.findUnique({
        where: { id: input.restaurantId },
    });

    if (!restaurant) {
        throw new AppError('Restaurant not found.', 404);
    }

    if (restaurant.ownerId !== ownerId) {
        throw new AppError('You do not own this restaurant.', 403);
    }

    const uploadResult = await uploadToCloudinary(file);

    const video = await prisma.video.create({
        data: {
            title: input.title ?? null,
            description: input.description ?? null,
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            thumbnailUrl: uploadResult.secure_url.replace(/\.[^.]+$/, '.jpg'),
            duration: uploadResult.duration ?? null,
            restaurantId: restaurant.id,
        },
        include: {
            restaurant: {
                select: { id: true, name: true },
            },
        },
    });

    return video;
}

export async function getFeed(limit: number, cursor?: string) {
    const take = Math.min(Math.max(limit, 1), 50);
    const decodedCursor = cursor ? decodeFeedCursor(cursor) : null;

    const videos = await prisma.video.findMany({
        take: take + 1,
        ...(decodedCursor
            ? {
                  where: {
                      OR: [
                          { createdAt: { lt: decodedCursor.createdAt } },
                          {
                              createdAt: decodedCursor.createdAt,
                              id: { lt: decodedCursor.id },
                          },
                      ],
                  },
              }
            : {}),
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        include: {
            restaurant: {
                select: { id: true, name: true },
            },
        },
    });

    let nextCursor: string | null = null;
    if (videos.length > take) {
        const nextItem = videos.pop();
        nextCursor =
            nextItem && nextItem.createdAt
                ? encodeFeedCursor(nextItem.createdAt, nextItem.id)
                : null;
    }

    return {
        videos,
        nextCursor,
    };
}

export async function getRestaurantVideos(restaurantId: string) {
    return prisma.video.findMany({
        where: { restaurantId },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        include: {
            restaurant: {
                select: { id: true, name: true },
            },
        },
    });
}
