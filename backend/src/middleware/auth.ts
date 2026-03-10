import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sendError } from '../utils/response';
import { prisma } from '../config/prisma';

interface JwtPayload {
    id: string;
    email: string;
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        sendError(res, 'Access denied. No token provided.', 401);
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const secret = process.env.JWT_SECRET!;
        const decoded = jwt.verify(token, secret) as JwtPayload;

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true },
        });

        if (!user) {
            sendError(res, 'Invalid or expired token.', 401);
            return;
        }

        req.user = { id: user.id, email: user.email };
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
            sendError(res, 'Invalid or expired token.', 401);
            return;
        }

        next(error);
    }
}
