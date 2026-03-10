import { Prisma } from '@prisma/client';
import { MulterError } from 'multer';
import { ZodError } from 'zod';

export class AppError extends Error {
    constructor(
        message: string,
        public readonly statusCode = 400
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export class InvalidIdError extends AppError {
    constructor() {
        super('Invalid ID format', 400);
        this.name = 'InvalidIdError';
    }
}

export function getErrorStatusAndMessage(error: unknown): { statusCode: number; message: string } {
    if (error instanceof AppError) {
        return { statusCode: error.statusCode, message: error.message };
    }

    if (error instanceof MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return { statusCode: 413, message: 'File too large' };
        }

        return { statusCode: 400, message: 'Invalid file upload' };
    }

    if (error instanceof ZodError) {
        return {
            statusCode: 422,
            message: error.errors[0]?.message ?? 'Validation failed',
        };
    }

    if (
        error instanceof Prisma.PrismaClientInitializationError ||
        error instanceof Prisma.PrismaClientRustPanicError ||
        error instanceof Prisma.PrismaClientUnknownRequestError
    ) {
        return { statusCode: 500, message: 'Internal Server Error' };
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
        return { statusCode: 400, message: 'Invalid request' };
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
            return { statusCode: 409, message: 'Resource already exists' };
        }

        if (error.code === 'P2025') {
            return { statusCode: 404, message: 'Resource not found' };
        }

        return { statusCode: 500, message: 'Internal Server Error' };
    }

    return { statusCode: 500, message: 'Internal Server Error' };
}
