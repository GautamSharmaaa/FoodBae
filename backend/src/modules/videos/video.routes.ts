import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { uploadVideo, getFeed, videoUpload } from './video.controller';

const router = Router();

// Protected upload route
router.post('/upload', authenticate, videoUpload.single('video'), uploadVideo);

// Public feed route
router.get('/feed', getFeed);

export default router;

