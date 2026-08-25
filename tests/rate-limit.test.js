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

    expect(allowed.length).toBe(10);
    expect(blocked.length).toBe(1);
    expect(blocked[0].body.error).toBe('Too Many Requests. Please try again later.');
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


