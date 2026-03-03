import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sendError } from '../utils/response';

interface JwtPayload {
    id: string;
    email: string;
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        sendError(res, 'Access denied. No token provided.', 401);
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const secret = process.env.JWT_SECRET!;
        const decoded = jwt.verify(token, secret) as JwtPayload;
        req.user = { id: decoded.id, email: decoded.email };
        next();
    } catch {
        sendError(res, 'Invalid or expired token.', 401);
    }
}
