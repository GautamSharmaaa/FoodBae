const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { once } = require('node:events');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'integration-secret';
process.env.CLOUDINARY_CLOUD_NAME = 'foodbae';
process.env.CLOUDINARY_API_KEY = 'key';
process.env.CLOUDINARY_API_SECRET = 'secret';
process.env.ALLOWED_ORIGINS = 'http://localhost:8081';

const app = require('../dist/app').default;
const { prisma } = require('../dist/config/prisma');
const { cloudinary } = require('../dist/config/cloudinary');

const users = [];
const restaurants = [];
const videos = [];

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function resetData() {
    users.length = 0;
    restaurants.length = 0;
    videos.length = 0;
}

function setupMocks() {
    prisma.user.findUnique = async ({ where, select }) => {
        const user = where.email
            ? users.find((item) => item.email === where.email)
            : users.find((item) => item.id === where.id);
        if (!user) {
            return null;
        }

        if (!select) {
            return clone(user);
        }

        return Object.fromEntries(
            Object.keys(select)
                .filter((key) => select[key])
                .map((key) => [key, user[key]])
        );
    };

    prisma.user.create = async ({ data, select }) => {
        const user = {
            id: crypto.randomUUID(),
            email: data.email,
            password: data.password,
            name: data.name,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        users.push(user);

        return Object.fromEntries(
            Object.keys(select)
                .filter((key) => select[key])
                .map((key) => [key, user[key]])
        );
    };

    prisma.restaurant.create = async ({ data, select }) => {
        const restaurant = {
            id: crypto.randomUUID(),
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        restaurants.push(restaurant);
        return serializeRestaurant(restaurant, select);
    };

    prisma.restaurant.findUnique = async ({ where, select }) => {
        const restaurant = restaurants.find((item) => item.id === where.id);
        if (!restaurant) {
            return null;
        }

        if (!select) {
            return clone(restaurant);
        }

        return serializeRestaurant(restaurant, select);
    };

    prisma.restaurant.findMany = async ({ where, select, orderBy, skip = 0, take }) => {
        let result = restaurants.filter((item) => !where?.ownerId || item.ownerId === where.ownerId);
        result = sortByCreatedAtAndId(result, orderBy);
        result = result.slice(skip, take ? skip + take : undefined);
        return result.map((item) => serializeRestaurant(item, select));
    };

    prisma.restaurant.count = async () => restaurants.length;
    prisma.$transaction = async (operations) => Promise.all(operations);

    prisma.video.create = async ({ data, include }) => {
        const video = {
            id: crypto.randomUUID(),
            ...data,
            createdAt: new Date(),
        };
        videos.push(video);
        return serializeVideo(video, include);
    };

    prisma.video.findMany = async ({ where, include, select, take, orderBy }) => {
        let result = videos.filter((item) => !where?.restaurantId || item.restaurantId === where.restaurantId);

        if (where?.OR) {
            result = result.filter((item) =>
                where.OR.some((clause) => {
                    if (clause.createdAt?.lt) {
                        return item.createdAt < clause.createdAt.lt;
                    }

                    if (clause.createdAt && clause.id?.lt) {
                        return (
                            item.createdAt.getTime() === clause.createdAt.getTime() &&
                            item.id < clause.id.lt
                        );
                    }

                    return false;
                })
            );
        }

        result = sortByCreatedAtAndId(result, orderBy);
        if (take) {
            result = result.slice(0, take);
        }

        return result.map((item) => {
            if (select) {
                return serializeVideoSelect(item, select);
            }

            return serializeVideo(item, include);
        });
    };

    cloudinary.uploader.upload = async () => ({
        secure_url: 'https://cdn.foodbae.test/reel.mp4',
        public_id: 'foodbae/reels/test',
        duration: 12.5,
    });
}

function sortByCreatedAtAndId(collection, orderBy) {
    const sortable = [...collection];
    if (!orderBy) {
        return sortable;
    }

    return sortable.sort((left, right) => {
        const createdAtDelta = right.createdAt.getTime() - left.createdAt.getTime();
        if (createdAtDelta !== 0) {
            return createdAtDelta;
        }

        return right.id.localeCompare(left.id);
    });
}

function serializeRestaurant(restaurant, select) {
    const payload = {
        id: restaurant.id,
        name: restaurant.name,
        description: restaurant.description ?? null,
        address: restaurant.address,
        latitude: restaurant.latitude ?? null,
        longitude: restaurant.longitude ?? null,
        averagePrice: restaurant.averagePrice ?? null,
        popularDishes: restaurant.popularDishes ?? [],
        bestTimeToVisit: restaurant.bestTimeToVisit ?? null,
        ownerId: restaurant.ownerId,
        createdAt: restaurant.createdAt,
        updatedAt: restaurant.updatedAt,
        owner: { id: restaurant.ownerId, name: users.find((item) => item.id === restaurant.ownerId)?.name ?? 'Owner' },
        _count: { videos: videos.filter((item) => item.restaurantId === restaurant.id).length },
        videos: videos
            .filter((item) => item.restaurantId === restaurant.id)
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 10)
            .map((item) => ({
                id: item.id,
                title: item.title,
                url: item.url,
                thumbnailUrl: item.thumbnailUrl,
                duration: item.duration,
                createdAt: item.createdAt,
            })),
    };

    if (!select) {
        return clone(payload);
    }

    return Object.fromEntries(
        Object.keys(select)
            .filter((key) => select[key])
            .map((key) => [key, payload[key]])
    );
}

function serializeVideo(video, include) {
    const payload = {
        ...video,
        restaurant: include?.restaurant
            ? {
                  id: video.restaurantId,
                  name: restaurants.find((item) => item.id === video.restaurantId)?.name ?? 'Restaurant',
              }
            : undefined,
    };

    return clone(payload);
}

function serializeVideoSelect(video, select) {
    const payload = {
        id: video.id,
        title: video.title,
        description: video.description,
        url: video.url,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        createdAt: video.createdAt,
    };

    return Object.fromEntries(
        Object.keys(select)
            .filter((key) => select[key])
            .map((key) => [key, payload[key]])
    );
}

async function startTestServer() {
    const server = app.listen(0);
    await once(server, 'listening');
    const address = server.address();
    return {
        server,
        baseUrl: `http://127.0.0.1:${address.port}/api`,
    };
}

async function jsonRequest(baseUrl, pathname, options = {}) {
    const response = await fetch(`${baseUrl}${pathname}`, options);
    const body = await response.json();
    return { response, body };
}

test.beforeEach(() => {
    resetData();
    setupMocks();
});

test('backend integration flow covers signup, login, create restaurant, upload video, and feed', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'foodbae-test-'));
    const videoPath = path.join(tempDir, 'sample.mp4');
    fs.writeFileSync(
        videoPath,
        Buffer.from('000000206674797069736f6d0000020069736f6d69736f32617663316d703431', 'hex')
    );

    const { server, baseUrl } = await startTestServer();

    try {
        const signup = await jsonRequest(baseUrl, '/auth/signup', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                name: 'Audit User',
                email: 'audit@example.com',
                password: 'StrongPass123',
            }),
        });

        assert.equal(signup.response.status, 201);
        assert.equal(signup.body.success, true);
        assert.ok(signup.body.data.token);

        const login = await jsonRequest(baseUrl, '/auth/login', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                email: 'audit@example.com',
                password: 'StrongPass123',
            }),
        });

        assert.equal(login.response.status, 200);
        assert.equal(login.body.success, true);

        const token = login.body.data.token;
        const restaurant = await jsonRequest(baseUrl, '/restaurants', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                name: 'Test Restaurant',
                address: '123 Test Street',
                popularDishes: ['Pizza'],
            }),
        });

        assert.equal(restaurant.response.status, 201);
        assert.equal(restaurant.body.success, true);

        const formData = new FormData();
        formData.append('restaurantId', restaurant.body.data.id);
        formData.append('title', 'A reel');
        formData.append('description', 'Great food');
        formData.append('video', await fs.openAsBlob(videoPath, { type: 'video/mp4' }), 'sample.mp4');

        const upload = await jsonRequest(baseUrl, '/videos/upload', {
            method: 'POST',
            headers: { authorization: `Bearer ${token}` },
            body: formData,
        });

        assert.equal(upload.response.status, 201);
        assert.equal(upload.body.success, true);
        assert.equal(upload.body.data.restaurant.id, restaurant.body.data.id);

        const feed = await jsonRequest(baseUrl, '/videos/feed?limit=10');
        assert.equal(feed.response.status, 200);
        assert.equal(feed.body.success, true);
        assert.equal(feed.body.data.videos.length, 1);
        assert.ok(typeof feed.body.data.nextCursor === 'string' || feed.body.data.nextCursor === null);
    } finally {
        await new Promise((resolve) => server.close(resolve));
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
});
