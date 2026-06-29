import request from 'supertest'
import app from '../index.js'
import { prismaClient } from '../prismaClient.js'

const prisma = prismaClient

// afterAll -> we tell Jest: "Once all these tests are done, close the database connection so the program can exit gracefully."

//Other common Jest Hooks:
// beforeAll: Runs once before any tests start (useful for setting up a database or seeding data).
// beforeEach: Runs before every single test (useful for resetting variables).
// afterEach: Runs after every single test (useful for clearing temporary files).

afterAll(async () => {
    await prisma.$disconnect()
})

// Test:1 => Health Is Okay
test('Health Is Okay', async () => {
    // GET
    const shortenResponse = await request(app).get('/health')

    expect(shortenResponse.status).toBe(200)
    expect(shortenResponse.body.message).toBe('Server is up and database is connected')
    expect(shortenResponse.body.status).toBe('success')
}, 10000)
