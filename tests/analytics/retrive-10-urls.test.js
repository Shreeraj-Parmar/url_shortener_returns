import request from 'supertest'
import { prismaClient } from '../../prismaClient.js'
import app from '../../index.js'

const prisma = prismaClient

afterAll(async () => {
    await prisma.$disconnect()
})

test('retrive 10 urls', async () => {
    const analyticsResponse = await request(app).get(`/analytics?limit=10&skip=0`)

    expect(analyticsResponse.status).toBe(200)
})

test('invalid limit parameter', async () => {
    const analyticsResponse = await request(app).get(`/analytics?limit=skdfjhaskdf&skip=0`)

    expect(analyticsResponse.status).toBe(400)
    expect(analyticsResponse.body.error).toBe('Invalid limit parameter')
})

test('invalid skip parameter', async () => {
    const analyticsResponse = await request(app).get(`/analytics?limit=10&skip=skdfjhaskdf`)

    expect(analyticsResponse.status).toBe(400)
    expect(analyticsResponse.body.error).toBe('Invalid skip parameter')
})

test('invalid limit parameter and invalid skip parameter', async () => {
    const analyticsResponse = await request(app).get(`/analytics?limit=skdfjhaskdf&skip=skdfjhaskdf`)

    expect(analyticsResponse.status).toBe(400)
    expect(analyticsResponse.body.error).toBe('Invalid limit parameter')
})
