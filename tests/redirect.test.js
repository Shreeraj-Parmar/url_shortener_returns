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

test('shorten URL and redirect', async () => {
    // POST
    const shortenResponse = await request(app).post('/shorten').send({
        url: 'https://example79856985666.com',
    })

    const shortCode = shortenResponse.body.short_code

    // GET
    const redirectResponse = await request(app).get(`/redirect?code=${shortCode}`)

    // CHECK
    expect(redirectResponse.status).toBe(302)
    expect(redirectResponse.headers.location).toBe('https://example79856985666.com')
})

test('Invalid URL:1', async () => {
    // POST
    const shortenResponse = await request(app).post('/shorten').send({
        url: 'example79856985666.com',
    })

    expect(shortenResponse.status).toBe(400)
    expect(shortenResponse.body.error).toBe('Invalid URL')
})

test('Invalid URL:2', async () => {
    // POST
    const shortenResponse = await request(app).post('/shorten').send({
        url: 'httpsss://example79856985666.com',
    })

    expect(shortenResponse.status).toBe(400)
    expect(shortenResponse.body.error).toBe('Invalid URL')
})

test('Invalid URL:3', async () => {
    // POST
    const shortenResponse = await request(app).post('/shorten').send({
        url: 'https://example79856985666com/sdhf',
    })

    expect(shortenResponse.status).toBe(400)
    expect(shortenResponse.body.error).toBe('Invalid URL')
})


test('Empty Stripng', async () => {
    // POST
    const shortenResponse = await request(app).post('/shorten').send({
        url: '',
    })

    expect(shortenResponse.status).toBe(400)
    expect(shortenResponse.body.error).toBe('URL is required')
})

test('null', async () => {
    // POST
    const shortenResponse = await request(app).post('/shorten').send({
        url: null,
    })

    expect(shortenResponse.status).toBe(400)
    expect(shortenResponse.body.error).toBe('URL is required')
})


test('URL includes spaces', async () => {
    // POST
    const shortenResponse = await request(app).post('/shorten').send({
        url: 'https://sdfasdf sdfsdf.com',
    })

    expect(shortenResponse.status).toBe(400)
    expect(shortenResponse.body.error).toBe('Invalid URL')
})