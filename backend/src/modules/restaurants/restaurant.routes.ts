import { Router } from 'express';
import {
    createRestaurant,
    getAllRestaurants,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant,
    getMyRestaurants,
} from './restaurant.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Public routes
router.get('/', getAllRestaurants);
router.get('/:id', getRestaurantById);

// Protected routes (require JWT)
router.post('/', authenticate, createRestaurant);
router.get('/me/owned', authenticate, getMyRestaurants);
router.patch('/:id', authenticate, updateRestaurant);
router.delete('/:id', authenticate, deleteRestaurant);

export default router;
