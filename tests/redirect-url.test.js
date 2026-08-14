import request from 'supertest'
import app from '../index.js'
import { prismaClient } from '../prismaClient.js'
import redisClient from '../redis/config.js'

const prisma = prismaClient

afterAll(async () => {
    await prisma.$disconnect()
})

// Add this temporarily to wipe the broken database before tests run!
beforeAll(async () => {
    await redisClient.flushAll();
});


test('Valid Case for redirect URL with expiry Date is Null', async () => {
    const shortCode = 'lwRVZlit'

    const redirectResponse = await request(app).get(`/redirect?code=${shortCode}`)

    expect(redirectResponse.status).toBe(302)
    expect(redirectResponse.header.location).toBe('https://example.com/page/11')
})

test('Valid Case for redirect URL with expiry Date is expired', async () => {
    const shortCode = '1buBk2'

    const redirectResponse = await request(app).get(`/redirect?code=${shortCode}`)

    expect(redirectResponse.status).toBe(404)
    expect(redirectResponse.body.error).toBe('URL has expired')
})

test('Valid Case for redirect URL with expiry Date is future', async () => {
    const shortCode = 'bMQ0Sf'

    const redirectResponse = await request(app).get(`/redirect?code=${shortCode}`)

    expect(redirectResponse.status).toBe(302)
    expect(redirectResponse.header.location).toBe('https://01o4cqwselu.com/path/xu33ya')
})

test('404 Not Found', async () => {
    const shortCode = 'jhaksljdfhlaksjdhfajsdf' // that is not available in DB

    const redirectResponse = await request(app).get(`/redirect?code=${shortCode}`)

    expect(redirectResponse.status).toBe(404)
    expect(redirectResponse.body.error).toBe('URL not found')
})

test('Missing params', async () => {
    const redirectResponse = await request(app).get(`/redirect`)

    expect(redirectResponse.status).toBe(400)
    expect(redirectResponse.body.error).toBe('Code is required')
})

test('Invalid Password', async () => {
    const redirectResponse = await request(app).get(`/redirect?code=vir1TV&password=12345ss6789`)

    expect(redirectResponse.status).toBe(401)
    expect(redirectResponse.body.error).toBe('Invalid password')
})

test('Valid Password', async () => {
    const redirectResponse = await request(app).get(`/redirect?code=vir1TV&password=123456789`)

    expect(redirectResponse.status).toBe(302)
    expect(redirectResponse.header.location).toBe('https://01o4cqwelu.com/path/xu33ya')
})

test('Redirect Cache: Stores result on 1st call and returns cached result on 2nd call', async () => {
    const shortCode = 'jn85BvF6'

    // First request - populates cache
    const res1 = await request(app).get(`/redirect?code=${shortCode}`)
    expect(res1.status).toBe(302)

    // Check value is stored in tempCache
    expect(await redisClient.get(shortCode)).toBeDefined()

    // Second request - returns from cache
    const res2 = await request(app).get(`/redirect?code=${shortCode}`)
    expect(res2.status).toBe(302)
    expect(res2.header.location).toBe(JSON.parse(await redisClient.get(shortCode)).original_url)
})
