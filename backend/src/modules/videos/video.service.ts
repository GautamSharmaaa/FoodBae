import { prisma } from '../../config/prisma';
import { cloudinary } from '../../config/cloudinary';
import { z } from 'zod';
import type { UploadApiResponse } from 'cloudinary';

export const uploadVideoSchema = z.object({
    restaurantId: z.string().uuid('restaurantId must be a valid UUID.'),
    title: z.string().min(1, 'Title is required.').max(200).optional(),
    description: z.string().max(1000).optional(),
});

export type UploadVideoInput = z.infer<typeof uploadVideoSchema>;

async function uploadToCloudinary(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'video',
                folder: 'foodbae/reels',
            },
            (error, result) => {
                if (error || !result) {
                    return reject(error || new Error('Failed to upload video to Cloudinary.'));
                }
                resolve(result);
            }
        );

        uploadStream.end(file.buffer);
    });
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
        throw new Error('Restaurant not found.');
    }

    if (restaurant.ownerId !== ownerId) {
        throw new Error('You do not own this restaurant.');
    }

    const uploadResult = await uploadToCloudinary(file);

    const video = await prisma.video.create({
        data: {
            title: input.title ?? null,
            description: input.description ?? null,
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            thumbnailUrl:
                // @ts-expect-error Cloudinary types do not always expose thumbnail_url
                (uploadResult.thumbnail_url as string | undefined) ?? null,
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

    const videos = await prisma.video.findMany({
        take: take + 1,
        skip: cursor ? 1 : 0,
        ...(cursor ? { cursor: { id: cursor } } : {}),
        orderBy: { createdAt: 'desc' },
        include: {
            restaurant: {
                select: { id: true, name: true },
            },
        },
    });

    let nextCursor: string | null = null;
    if (videos.length > take) {
        const nextItem = videos.pop();
        nextCursor = nextItem ? nextItem.id : null;
    }

    return {
        videos,
        nextCursor,
    };
}

export async function getRestaurantVideos(restaurantId: string) {
    return prisma.video.findMany({
        where: { restaurantId },
        orderBy: { createdAt: 'desc' },
        include: {
            restaurant: {
                select: { id: true, name: true },
            },
        },
    });
}

