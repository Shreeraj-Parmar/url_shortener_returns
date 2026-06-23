import request from 'supertest'
import app from '../index.js'
import { prismaClient } from '../prismaClient.js'

const prisma = prismaClient

afterAll(async () => {
    await prisma.$disconnect()
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
