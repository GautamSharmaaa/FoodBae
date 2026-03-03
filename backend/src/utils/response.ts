import { Response } from 'express';

interface SuccessResponse<T> {
    success: true;
    data: T;
    message?: string;
}

interface ErrorResponse {
    success: false;
    message: string;
}

export function sendSuccess<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode = 200
): Response {
    const body: SuccessResponse<T> = { success: true, data };
    if (message) body.message = message;
    return res.status(statusCode).json(body);
}

export function sendError(
    res: Response,
    message: string,
    statusCode = 400
): Response {
    const body: ErrorResponse = { success: false, message };
    return res.status(statusCode).json(body);
}
