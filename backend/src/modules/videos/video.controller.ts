import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import fs from 'node:fs/promises';
import path from 'node:path';
import { sendSuccess, sendError } from '../../utils/response';
import { uploadVideoSchema } from './video.service';
import * as videoService from './video.service';
import { assertUuid } from '../../utils/validation';

const uploadDirectory = path.resolve(process.cwd(), 'tmp', 'uploads');

const storage = multer.diskStorage({
    destination: async (_req, _file, cb) => {
        try {
            await fs.mkdir(uploadDirectory, { recursive: true });
            cb(null, uploadDirectory);
        } catch (error) {
            cb(error as Error, uploadDirectory);
        }
    },
    filename: (_req, file, cb) => {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, `${Date.now()}-${safeName}`);
    },
});

export const videoUpload = multer({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
    },
});

export async function uploadVideo(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    let filePathToCleanup: string | undefined;
    try {
        const parsed = uploadVideoSchema.safeParse(req.body);
        if (!parsed.success) {
            sendError(res, parsed.error.errors[0].message, 422);
            return;
        }

        assertUuid(parsed.data.restaurantId);

        if (!req.file) {
            sendError(res, 'Video file is required.', 400);
            return;
        }

        filePathToCleanup = req.file.path;

        // Robust content-based validation using file-type
        const { fileTypeFromFile } = await import('file-type');
        const detected = await fileTypeFromFile(req.file.path);

        if (!detected || !['video/mp4', 'video/quicktime'].includes(detected.mime)) {
            sendError(res, 'Only MP4 and QuickTime videos are allowed.', 400);
            return;
        }

        const video = await videoService.uploadVideo(req.user!.id, parsed.data, req.file);
        sendSuccess(res, video, 'Video uploaded successfully.', 201);
    } catch (err) {
        next(err);
    } finally {
        if (filePathToCleanup) {
            await fs.unlink(filePathToCleanup).catch(() => undefined);
        }
    }
}

export async function getFeed(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const limit = Math.min(
            50,
            Math.max(1, parseInt((req.query.limit as string) || '10', 10))
        );
        const cursor = (req.query.cursor as string) || undefined;
        const result = await videoService.getFeed(limit, cursor);
        sendSuccess(res, result);
    } catch (err) {
        next(err);
    }
}
