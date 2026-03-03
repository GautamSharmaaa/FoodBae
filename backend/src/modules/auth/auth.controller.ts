import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as authService from './auth.service';
import { sendSuccess, sendError } from '../../utils/response';

// ─── Zod Schemas ─────────────────────────────────────────────────────────────
const signupSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters.').max(100),
    email: z.string().email('Invalid email address.'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters.')
        .max(72, 'Password too long.'),
});

const loginSchema = z.object({
    email: z.string().email('Invalid email address.'),
    password: z.string().min(1, 'Password is required.'),
});

// ─── Controllers ─────────────────────────────────────────────────────────────
export async function signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const parsed = signupSchema.safeParse(req.body);
        if (!parsed.success) {
            sendError(res, parsed.error.errors[0].message, 422);
            return;
        }

        const result = await authService.signup(parsed.data);
        sendSuccess(res, result, 'Account created successfully.', 201);
    } catch (err) {
        next(err);
    }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            sendError(res, parsed.error.errors[0].message, 422);
            return;
        }

        const result = await authService.login(parsed.data);
        sendSuccess(res, result, 'Logged in successfully.');
    } catch (err) {
        next(err);
    }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const user = await authService.getMe(req.user!.id);
        sendSuccess(res, user);
    } catch (err) {
        next(err);
    }
}
