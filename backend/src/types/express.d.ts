// Augment Express Request to include authenticated user payload
export { };

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
            };
        }
    }
}
