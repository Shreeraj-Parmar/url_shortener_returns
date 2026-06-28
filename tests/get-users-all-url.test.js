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


// Test:1 => Invalid API key
test('Invalid User API KEY', async () => {
    // GET 
    const apiKey = 'sk_test_111111ddddddd1111111111'
    const shortenResponse = await request(app).get('/urls').set('x-api-key', apiKey)

    expect(shortenResponse.status).toBe(401)
    expect(shortenResponse.body.error).toBe('Invalid API key')
}, 10000)


// Test:2 => API key is missing
test('API key is missing', async () => {
    // GET 
    const shortenResponse = await request(app).get('/urls')

    expect(shortenResponse.status).toBe(400)
    expect(shortenResponse.body.error).toBe('API key is required')
})


// Test:3 => Valid API key
test('Valid API key', async () => {
    // GET 
    const apiKey = 'sk_test_3333333333333333'
    const shortenResponse = await request(app).get('/urls').set('x-api-key', apiKey)

    expect(shortenResponse.status).toBe(200)
    expect(shortenResponse.body).toBeInstanceOf(Array)
})
