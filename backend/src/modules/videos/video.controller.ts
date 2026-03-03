import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { sendSuccess, sendError } from '../../utils/response';
import { uploadVideoSchema } from './video.service';
import * as videoService from './video.service';

const storage = multer.memoryStorage();

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
    try {
        const parsed = uploadVideoSchema.safeParse(req.body);
        if (!parsed.success) {
            sendError(res, parsed.error.errors[0].message, 422);
            return;
        }

        if (!req.file) {
            sendError(res, 'Video file is required.', 400);
            return;
        }

        // Robust content-based validation using file-type
        const { fileTypeFromBuffer } = await import('file-type');
        const detected = await fileTypeFromBuffer(req.file.buffer);

        if (!detected || !['video/mp4', 'video/quicktime'].includes(detected.mime)) {
            sendError(res, 'Only MP4 and QuickTime videos are allowed.', 400);
            return;
        }

        const video = await videoService.uploadVideo(req.user!.id, parsed.data, req.file);
        sendSuccess(res, video, 'Video uploaded successfully.', 201);
    } catch (err) {
        next(err);
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

