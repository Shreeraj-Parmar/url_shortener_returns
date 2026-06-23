import request from 'supertest'
import app from '../index.js'
import { prismaClient } from '../prismaClient.js'

const prisma = prismaClient

afterAll(async () => {
    await prisma.$disconnect()
})

test('Delete url', async () => {
    const shortCode = 'wTKPNqvA' // that is available in DB // make sure change this otherwise test will fail.

    const deleteResponse = await request(app).delete(`/shorten/${shortCode}`)

    expect(deleteResponse.status).toBe(204)
    expect(deleteResponse.body).toEqual({})
})
test('shortCode is required', async () => {
    const deleteResponse = await request(app).delete(`/shorten/`)

    expect(deleteResponse.status).toBe(400)
    expect(deleteResponse.body.error).toBe('shortCode is required')
})

test('Delete non-exist url', async () => {
    const shortCode = 'hhy9lmsxeeeeeeeeeee' // that is not available in DB

    const deleteResponse = await request(app).delete(`/shorten/${shortCode}`)

    expect(deleteResponse.status).toBe(404)
    expect(deleteResponse.body.error).toBe('URL not found')
})
