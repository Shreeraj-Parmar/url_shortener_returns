import request from 'supertest'
import app from '../index.js'
import { prismaClient } from '../prismaClient.js'
import redisClient from '../redis/config.js'


// jest.setTimeout(15000);

const prisma = prismaClient

afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    await prisma.$disconnect();
    await redisClient.quit();
})

// Add this temporarily to wipe the broken database before tests run!
beforeAll(async () => {
    await redisClient.flushAll();
});


test('Rate limit /shorten (Max 10 req/sec)', async () => {
    const clientIp = '192.168.1.100';
    const apiKey = 'sk_test_3333333333333333';

    // Send 11 requests concurrently in one batch
    const requests = Array.from({ length: 11 }).map(() =>
        request(app)
            .post('/shorten')
            .set('X-Forwarded-For', clientIp)
            .set('x-api-key', apiKey)
            .send({ url: 'https://example.com' })
    );

    const responses = await Promise.all(requests);

    // Count how many requests passed vs how many were rate limited (429)
    const allowed = responses.filter(res => res.status !== 429);
    const blocked = responses.filter(res => res.status === 429);

    // because they are in hobby plan.
    expect(allowed.length).toBe(11);
    expect(blocked.length).toBe(0);
}, 10000);

test('Rate limit /redirect (Max 50 req/sec)', async () => {
    const clientIp = '192.168.1.200';

    // Send 51 requests concurrently in one batch
    const requests = Array.from({ length: 51 }).map(() =>
        request(app)
            .get('/redirect?code=testcode')
            .set('X-Forwarded-For', clientIp)
    );

    const responses = await Promise.all(requests);

    // Count how many requests passed vs how many were rate limited (429)
    const allowed = responses.filter(res => res.status !== 429);
    const blocked = responses.filter(res => res.status === 429);

    expect(allowed.length).toBe(50);
    expect(blocked.length).toBe(1);
    expect(blocked[0].body.error).toBe('Too Many Requests. Please try again later.');
}, 10000);

test('Tier Rate limit /shorten (Free Tier - Max 5 req/60sec)', async () => {
    // 1. Create a free user in the DB
    const freeUser = await prisma.users.create({
        data: {
            email: 'free_test_tier@example.com',
            name: 'Free User',
            api_key: 'sk_test_free_tier_key',
            tier: 'free'
        }
    });

    try {
        // Send 6 requests concurrently in one batch (5 allowed, 1 blocked)
        const requests = Array.from({ length: 6 }).map(() =>
            request(app)
                .post('/shorten')
                .set('x-api-key', freeUser.api_key)
                .send({ url: 'https://example.com' })
        );

        const responses = await Promise.all(requests);

        const allowed = responses.filter(res => res.status !== 429);
        const blocked = responses.filter(res => res.status === 429);

        expect(allowed.length).toBe(5);
        expect(blocked.length).toBe(1);
        expect(blocked[0].body.error).toBe('Too Many Requests. Please upgrade your plan for higher limits.');
    } finally {
        await prisma.users.delete({ where: { id: freeUser.id } });
    }
}, 10000);

test('Tier Rate limit /shorten (Hobby Tier - Max 50 req/60sec)', async () => {
    // 1. Create a hobby user in the DB
    const hobbyUser = await prisma.users.create({
        data: {
            email: 'hobby_test_tier@example.com',
            name: 'Hobby User',
            api_key: 'sk_test_hobby_tier_key',
            tier: 'hobby'
        }
    });

    try {
        // Send 51 requests concurrently in one batch (50 allowed, 1 blocked)
        const requests = Array.from({ length: 51 }).map(() =>
            request(app)
                .post('/shorten')
                .set('x-api-key', hobbyUser.api_key)
                .send({ url: 'https://example.com' })
        );

        const responses = await Promise.all(requests);

        const allowed = responses.filter(res => res.status !== 429);
        const blocked = responses.filter(res => res.status === 429);

        expect(allowed.length).toBe(50);
        expect(blocked.length).toBe(1);
        expect(blocked[0].body.error).toBe('Too Many Requests. Please upgrade your plan for higher limits.');
    } finally {
        await prisma.users.delete({ where: { id: hobbyUser.id } });
    }
}, 10000);
