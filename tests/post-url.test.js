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

test('shorten URL and redirect With Expiry Date (Happy Path)', async () => {
    // POST
    const apiKey = 'sk_test_3333333333333333'
    const expireDate = '2028-12-01' // in YYYY-MM-DD formet. make dure it is future date.
    const shortenResponse = await request(app).post('/shorten').set('x-api-key', apiKey).send({
        url: 'https://01o4cqwselu.com/path/xu33ya',
        expireDate: expireDate,
    })

    const shortCode1 = shortenResponse.body.short_code

    expect(shortenResponse.status).toBe(200)

    // Test dublicate url

    const shortenResponse2 = await request(app).post('/shorten').set('x-api-key', apiKey).send({
        url: 'https://01o4cqwelu.com/path/xu33ya',
    })

    expect(shortenResponse2.status).toBe(200)
    expect(shortenResponse2.body.short_code).not.toBe(shortCode1)
})

test('shorten URL and redirect Without Expiry Date', async () => {
    // POST
    const apiKey = 'sk_test_3333333333333333'
    const shortenResponse = await request(app).post('/shorten').set('x-api-key', apiKey).send({
        url: 'https://01o4cqwselu.com/path/xu33ya',
    })

    expect(shortenResponse.status).toBe(200)
})

test('shorten URL and redirect With Past Expiry Date', async () => {
    // POST
    const apiKey = 'sk_test_3333333333333333'
    const expireDate = new Date('2022-12-01')
    const shortenResponse = await request(app).post('/shorten').set('x-api-key', apiKey).send({
        url: 'https://01o4cqwselu.com/path/xu33ya',
        expireDate: expireDate,
    })

    expect(shortenResponse.status).toBe(400)
    expect(shortenResponse.body.error).toBe('Please provide future date')
})

test('Api Key is missing', async () => {
    // POST
    const shortenResponse = await request(app).post('/shorten').send({
        url: 'https://01o4cqwelu.com/path/xu33ya',
    })

    expect(shortenResponse.status).toBe(400)
    expect(shortenResponse.body.error).toBe('URL and API key are required')
})

test('Api is invalid', async () => {
    // POST
    const apiKey = 'invalid'
    const shortenResponse = await request(app).post('/shorten').set('x-api-key', apiKey).send({
        url: 'https://01o4cqwelu.com/path/xu33ya',
    })

    expect(shortenResponse.status).toBe(401)
    expect(shortenResponse.body.error).toBe('Invalid API key')
})

test('Url is missing', async () => {
    // POST
    const shortenResponse = await request(app).post('/shorten').send({
        url: 'https://01o4cqwelu.com/path/xu33ya',
    })

    expect(shortenResponse.status).toBe(400)
    expect(shortenResponse.body.error).toBe('URL and API key are required')
})

test('Url is invalid', async () => {
    // POST
    const apiKey = 'sk_test_3333333333333333'
    const shortenResponse = await request(app).post('/shorten').set('x-api-key', apiKey).send({
        url: 'invalid',
    })

    expect(shortenResponse.status).toBe(400)
    expect(shortenResponse.body.error).toBe('Invalid URL')
})

test('Empty string', async () => {
    // POST
    const apiKey = 'sk_test_3333333333333333'
    const shortenResponse = await request(app).post('/shorten').set('x-api-key', apiKey).send({
        url: '',
    })

    expect(shortenResponse.status).toBe(400)
    expect(shortenResponse.body.error).toBe('URL and API key are required')
})

test('Api Key is empty string', async () => {
    // POST
    const apiKey = ''
    const shortenResponse = await request(app).post('/shorten').set('x-api-key', apiKey).send({
        url: 'https://01o4cqwelu.com/path/xu33ya',
    })

    expect(shortenResponse.status).toBe(400)
    expect(shortenResponse.body.error).toBe('URL and API key are required')
})
