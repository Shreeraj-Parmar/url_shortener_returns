import request from 'supertest'
import app from '../index.js'
import { prismaClient } from '../prismaClient.js'

const prisma = prismaClient

afterAll(async () => {
    await prisma.$disconnect()
})

test('Delete url', async () => {
    const shortCode = 'rrrxWx' // that is available in DB // make sure change this otherwise test will fail.
    const apiKey = 'sk_test_3333333333333333'

    // Delete url
    const deleteResponse = await request(app).delete(`/shorten/${shortCode}`).set('x-api-key', apiKey)

    expect(deleteResponse.status).toBe(204)
    expect(deleteResponse.body).toEqual({})
})

test('shortCode is required', async () => {
    const deleteResponse = await request(app).delete(`/shorten/`)

    expect(deleteResponse.status).toBe(400)
    expect(deleteResponse.body.error).toBe('shortCode is required')
})

test('Delete url with empty api key', async () => {
    const shortCode = 'dLeIlU'
    const apiKey = ''

    const deleteResponse = await request(app).delete(`/shorten/${shortCode}`).set('x-api-key', apiKey)

    expect(deleteResponse.status).toBe(400)
    expect(deleteResponse.body.error).toBe('API key is required')
})

test('Delete url with invalid api key', async () => {
    const shortCode = 'dLeIlU'
    const apiKey = 'invalid'

    const deleteResponse = await request(app).delete(`/shorten/${shortCode}`).set('x-api-key', apiKey)

    expect(deleteResponse.status).toBe(401)
    expect(deleteResponse.body.error).toBe('Invalid API key')
})

test('Valid APi but temparig other user short url', async () => {
    const shortCode = 'YpY7Du' // user A's short url
    const apiKey = 'sk_test_1111111111111111' // user B's api key

    const deleteResponse = await request(app).delete(`/shorten/${shortCode}`).set('x-api-key', apiKey)

    expect(deleteResponse.status).toBe(404)
    expect(deleteResponse.body.error).toBe('URL not found')
})

test('Delete already deleted url', async () => {
    const shortCode = 'rrrxWx' // that is already deleted in DB
    const apiKey = 'sk_test_3333333333333333'

    const deleteResponse = await request(app).delete(`/shorten/${shortCode}`).set('x-api-key', apiKey)

    expect(deleteResponse.status).toBe(404)
    expect(deleteResponse.body.error).toBe('URL not found')
})
