import { prisma } from '../../config/prisma';
import { z } from 'zod';
import { AppError } from '../../utils/errors';

export const createRestaurantSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters.').max(200),
    description: z.string().max(1000).optional(),
    address: z.string().min(5, 'Address is required.').max(500),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    averagePrice: z.number().positive().optional(),
    popularDishes: z.array(z.string().min(1)).optional().default([]),
    bestTimeToVisit: z.string().max(200).optional(),
});

export const updateRestaurantSchema = createRestaurantSchema.partial();

export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>;
export type UpdateRestaurantInput = z.infer<typeof updateRestaurantSchema>;

const restaurantSelect = {
    id: true,
    name: true,
    description: true,
    address: true,
    latitude: true,
    longitude: true,
    averagePrice: true,
    popularDishes: true,
    bestTimeToVisit: true,
    ownerId: true,
    createdAt: true,
    updatedAt: true,
    owner: { select: { id: true, name: true } },
    _count: { select: { videos: true } },
};

export async function createRestaurant(ownerId: string, input: CreateRestaurantInput) {
    return prisma.restaurant.create({
        data: { ...input, ownerId },
        select: restaurantSelect,
    });
}

export async function getAllRestaurants(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [restaurants, total] = await prisma.$transaction([
        prisma.restaurant.findMany({
            skip,
            take: limit,
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            select: restaurantSelect,
        }),
        prisma.restaurant.count(),
    ]);

    return {
        restaurants,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
        },
    };
}

export async function getRestaurantById(id: string) {
    const restaurant = await prisma.restaurant.findUnique({
        where: { id },
        select: {
            ...restaurantSelect,
            videos: {
                orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
                take: 10,
                select: {
                    id: true,
                    title: true,
                    url: true,
                    thumbnailUrl: true,
                    duration: true,
                    createdAt: true,
                },
            },
        },
    });

    if (!restaurant) throw new AppError('Restaurant not found.', 404);
    return restaurant;
}

export async function getRestaurantVideos(restaurantId: string) {
    return prisma.video.findMany({
        where: { restaurantId },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: {
            id: true,
            title: true,
            description: true,
            url: true,
            thumbnailUrl: true,
            duration: true,
            createdAt: true,
        },
    });
}

export async function updateRestaurant(
    id: string,
    ownerId: string,
    input: UpdateRestaurantInput
) {
    const existing = await prisma.restaurant.findUnique({ where: { id } });
    if (!existing) throw new AppError('Restaurant not found.', 404);
    if (existing.ownerId !== ownerId) throw new AppError('You do not own this restaurant.', 403);

    return prisma.restaurant.update({
        where: { id },
        data: input,
        select: restaurantSelect,
    });
}

export async function deleteRestaurant(id: string, ownerId: string) {
    const existing = await prisma.restaurant.findUnique({ where: { id } });
    if (!existing) throw new AppError('Restaurant not found.', 404);
    if (existing.ownerId !== ownerId) throw new AppError('You do not own this restaurant.', 403);

    await prisma.restaurant.delete({ where: { id } });
}

export async function getMyRestaurants(ownerId: string) {
    return prisma.restaurant.findMany({
        where: { ownerId },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: restaurantSelect,
    });
}
