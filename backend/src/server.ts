import 'dotenv/config';
import app from './app';
import { ensureDatabaseConnection } from './config/prisma';
import { ensureCloudinaryConfig } from './config/cloudinary';

const PORT = parseInt(process.env.PORT || '3000', 10);

let server: ReturnType<typeof app.listen>;

async function startServer(): Promise<void> {
    try {
        await ensureDatabaseConnection();
    } catch (error) {
        console.error('Database connection failed. Verify DATABASE_URL.');
        console.error(error);
        process.exit(1);
    }

    try {
        ensureCloudinaryConfig();
    } catch (error) {
        console.error('Cloudinary configuration failed.');
        console.error(error);
        process.exit(1);
    }

    server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log('Database connected');
        console.log('Cloudinary configured');
    });
}

void startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    if (!server) {
        process.exit(0);
    }
    server?.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    if (!server) {
        process.exit(0);
    }
    server?.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});
