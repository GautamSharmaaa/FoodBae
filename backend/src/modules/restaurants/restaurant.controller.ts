import { Request, Response, NextFunction } from 'express';
import * as restaurantService from './restaurant.service';
import {
    createRestaurantSchema,
    updateRestaurantSchema,
} from './restaurant.service';
import { sendSuccess, sendError } from '../../utils/response';

export async function createRestaurant(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const parsed = createRestaurantSchema.safeParse(req.body);
        if (!parsed.success) {
            sendError(res, parsed.error.errors[0].message, 422);
            return;
        }
        const restaurant = await restaurantService.createRestaurant(req.user!.id, parsed.data);
        sendSuccess(res, restaurant, 'Restaurant created successfully.', 201);
    } catch (err) {
        next(err);
    }
}

export async function getAllRestaurants(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
        const result = await restaurantService.getAllRestaurants(page, limit);
        sendSuccess(res, result);
    } catch (err) {
        next(err);
    }
}

export async function getRestaurantById(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const restaurant = await restaurantService.getRestaurantById(String(req.params.id));
        sendSuccess(res, restaurant);
    } catch (err) {
        next(err);
    }
}

export async function getRestaurantVideos(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const restaurantId = String(req.params.id);
        const videos = await restaurantService.getRestaurantVideos(restaurantId);
        sendSuccess(res, videos);
    } catch (err) {
        next(err);
    }
}

export async function updateRestaurant(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const parsed = updateRestaurantSchema.safeParse(req.body);
        if (!parsed.success) {
            sendError(res, parsed.error.errors[0].message, 422);
            return;
        }
        const restaurant = await restaurantService.updateRestaurant(
            String(req.params.id),
            req.user!.id,
            parsed.data
        );
        sendSuccess(res, restaurant, 'Restaurant updated successfully.');
    } catch (err) {
        next(err);
    }
}

export async function deleteRestaurant(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        await restaurantService.deleteRestaurant(String(req.params.id), req.user!.id);
        sendSuccess(res, null, 'Restaurant deleted successfully.');
    } catch (err) {
        next(err);
    }
}

export async function getMyRestaurants(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const restaurants = await restaurantService.getMyRestaurants(req.user!.id);
        sendSuccess(res, restaurants);
    } catch (err) {
        next(err);
    }
}
