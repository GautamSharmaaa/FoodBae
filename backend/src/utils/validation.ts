import { z } from 'zod';
import { InvalidIdError } from './errors';

const uuidSchema = z.string().uuid();

export function assertUuid(id: string): void {
    if (!uuidSchema.safeParse(id).success) {
        throw new InvalidIdError();
    }
}

export function encodeFeedCursor(createdAt: Date, id: string): string {
    return `${createdAt.toISOString()}::${id}`;
}

export function decodeFeedCursor(cursor: string): { createdAt: Date; id: string } {
    const [createdAtValue, id] = cursor.split('::');
    if (!createdAtValue || !id) {
        throw new InvalidIdError();
    }

    const createdAt = new Date(createdAtValue);
    if (Number.isNaN(createdAt.getTime())) {
        throw new InvalidIdError();
    }

    assertUuid(id);
    return { createdAt, id };
}
