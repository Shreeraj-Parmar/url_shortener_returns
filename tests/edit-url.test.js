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


// Test:1 => If User has Tier is Hobby
test('Invalid User API KEY', async () => {
    // POST 
    const apiKey = 'sk_test_111111ddddddd1111111111'
    const expireDate = '2028-12-01' // in YYYY-MM-DD formet. make dure it is future date.
    const shortenResponse = await request(app).patch('/shorten/test-code-10').set('x-api-key', apiKey).send({
        expireDate: expireDate,
    })

    expect(shortenResponse.status).toBe(401)
    expect(shortenResponse.body.error).toBe('Invalid API key')
}, 10000)

// Test:2 => API key missing
test('API key missing', async () => {
    // POST 
    const expireDate = '2028-12-01' // in YYYY-MM-DD formet. make dure it is future date.
    const shortenResponse = await request(app).patch('/shorten/test-code-10').send({
        expireDate: expireDate,
    })

    expect(shortenResponse.status).toBe(400)
    expect(shortenResponse.body.error).toBe('API key is required')
})

// Test:3 => Invalid Short Code
test('Invalid Short Code', async () => {
    // POST 
    const apiKey = 'sk_test_1111111111111111'
    const expireDate = '2028-12-01' // in YYYY-MM-DD formet. make dure it is future date.
    const shortenResponse = await request(app).patch('/shorten/test-codesdsd-10').set('x-api-key', apiKey).send({
        expireDate: expireDate,
    })

    expect(shortenResponse.status).toBe(404)
    expect(shortenResponse.body.error).toBe('URL not found')
})

// Test:4 => Invalid Date
test('Invalid Date', async () => {
    // POST 
    const apiKey = 'sk_test_1111111111111111'
    const expireDate = '202s8-12-01' // in YYYY-MM-DD formet. make dure it is future date.
    const shortenResponse = await request(app).patch('/shorten/test-code-10').set('x-api-key', apiKey).send({
        expireDate: expireDate,
    })

    expect(shortenResponse.status).toBe(400)
    expect(shortenResponse.body.error).toBe('Invalid expireDate')
})

// Test:5 => No pass Date
test('No pass Date', async () => {
    // POST 
    const apiKey = 'sk_test_1111111111111111'
    const shortenResponse = await request(app).patch('/shorten/test-code-10').set('x-api-key', apiKey).send({
    })

    expect(shortenResponse.status).toBe(400)
    expect(shortenResponse.body.error).toBe('expireDate is required For Edit')
})

// Test:6 => No pass Short code
test('No pass Short code', async () => {
    // POST 
    const apiKey = 'sk_test_1111111111111111'
    const expireDate = '2028-12-01' // in YYYY-MM-DD formet. make dure it is future date.
    const shortenResponse = await request(app).patch('/shorten/').set('x-api-key', apiKey).send({
        expireDate: expireDate,
    })

    expect(shortenResponse.status).toBe(400)
    expect(shortenResponse.body.error).toBe('shortCode is required')
})


// Test 7 : DOne


test('GOOD', async () => {
    // POST 
    const apiKey = 'sk_test_3333333333333333'
    const expireDate = '2028-12-01' // in YYYY-MM-DD formet. make dure it is future date.
    const shortenResponse = await request(app).patch('/shorten/vir1TV').set('x-api-key', apiKey).send({
        expireDate: expireDate,
    })

    expect(shortenResponse.status).toBe(204);
})



// Test 8 : Empty Password


test('Empty Password', async () => {
    // POST 
    const apiKey = 'sk_test_3333333333333333'
    const expireDate = '2028-12-01' // in YYYY-MM-DD formet. make dure it is future date.
    const shortenResponse = await request(app).patch('/shorten/vir1TV').set('x-api-key', apiKey).send({
        expireDate: expireDate,
        password: ""
    })

    expect(shortenResponse.status).toBe(400);
    expect(shortenResponse.body.error).toBe('You cannot use empty string as a password, please try another one')
})

// Test : 9 => Edit Password


test('Edit Password', async () => {
    // POST 
    const apiKey = 'sk_test_3333333333333333'
    const expireDate = '2028-12-01' // in YYYY-MM-DD formet. make dure it is future date.
    const shortenResponse = await request(app).patch('/shorten/vir1TV').set('x-api-key', apiKey).send({
        expireDate: expireDate,
        password: "123456789"
    })

    expect(shortenResponse.status).toBe(204);
})