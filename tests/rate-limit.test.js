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


test('Rate limit checking......', async () => {
    const clientIp = '192.168.1.50';
    const apiKey = 'sk_test_3333333333333333';

    // 1. Send 100 requests concurrently in parallel
    const requests = Array.from({ length: 100 }).map(() =>
        request(app)
            .post('/shorten')
            .set('X-Forwarded-For', clientIp)
            .set('x-api-key', apiKey)
            .send({ url: 'https://example.com' })
    );

    const responses = await Promise.all(requests);

    // Verify none of the first 100 were rate limited
    responses.forEach(res => {
        expect(res.status).not.toBe(429);
    });

    // 2. Request #101 should immediately fail with 429
    const blockedRes = await request(app)
        .post('/shorten')
        .set('X-Forwarded-For', clientIp)
        .set('x-api-key', apiKey)
        .send({ url: 'https://example.com' });

    expect(blockedRes.status).toBe(429);
    expect(blockedRes.body.error).toBe('Too Many Requests. Please try again later.');
}, 10000);
