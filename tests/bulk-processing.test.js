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


// Test:1 => All is good

test('handle bulk processing of urls: All is good', async () => {
    // POST
    const apiKey = 'sk_test_3333333333333333'
    const expireDate = '2028-12-01' // in YYYY-MM-DD formet. make dure it is future date.
    const shortenResponse = await request(app).post('/shorten/bulk').set('x-api-key', apiKey).send({
        bulkUrls: [
            {
                url: 'https://01o4cqwselsdsdu.com/path/xu33ya',
                expireDate: expireDate,
                code: "test-code-30"
            },
            {
                url: 'https://01o4cqwselsdsdu.com/path/xu33ya',
                expireDate: expireDate,
                code: "test-code-40"
            },
        ],
    })

    expect(shortenResponse.status).toBe(200)

    const expectedRes = [
        {
            success: true,
            originalUrl: 'https://01o4cqwselsdsdu.com/path/xu33ya',
            expireDate: new Date(expireDate).toISOString(),
            code: 'test-code-30',
            message: 'URL shortened successfully',
        },
        {
            success: true,
            originalUrl: 'https://01o4cqwselsdsdu.com/path/xu33ya',
            expireDate: new Date(expireDate).toISOString(),
            code: 'test-code-40',
            message: 'URL shortened successfully',
        },
    ];

    expect(shortenResponse.body.resultArr).toEqual(expectedRes);



})



// Test:2 => when one of the code is already exists and one code is not exists

test('handle bulk processing of urls: when one of the code is already exists and one code is not exists', async () => {
    // POST
    const apiKey = 'sk_test_3333333333333333'
    const expireDate = '2028-12-01' // in YYYY-MM-DD formet. make dure it is future date.
    const shortenResponse = await request(app).post('/shorten/bulk').set('x-api-key', apiKey).send({
        bulkUrls: [
            {
                url: 'https://01o4cqwselsdsdu.com/path/xu33ya',
                expireDate: expireDate,
                code: "test-code-30"
            },
            {
                url: 'https://01o4cqwselsdsdu.com/path/xu33ya',
                expireDate: expireDate,
                code: "test-code-45"
            },
        ],
    })

    expect(shortenResponse.status).toBe(200)


    const expectedRes = [
        {
            success: false,
            originalUrl: 'https://01o4cqwselsdsdu.com/path/xu33ya',
            code: 'test-code-30',
            message: 'You cannot use this short code, please try another one',
        },
        {
            success: true,
            originalUrl: 'https://01o4cqwselsdsdu.com/path/xu33ya',
            expireDate: new Date(expireDate).toISOString(),
            code: 'test-code-45',
            message: 'URL shortened successfully',
        },
    ];

    expect(shortenResponse.body.resultArr).toEqual(expectedRes);

})


// -------------  Test:3 => when all the code is exist in DB --------------------- //

test('handle bulk processing of urls: when all the code is exist in DB', async () => {
    // POST
    const apiKey = 'sk_test_3333333333333333'
    const expireDate = '2028-12-01' // in YYYY-MM-DD formet. make dure it is future date.
    const shortenResponse = await request(app).post('/shorten/bulk').set('x-api-key', apiKey).send({
        bulkUrls: [
            {
                url: 'https://01o4cqwselsdsdu.com/path/xu33ya',
                expireDate: expireDate,
                code: "test-code-30"
            },
            {
                url: 'https://01o4cqwselsdsdu.com/path/xu33ya',
                expireDate: expireDate,
                code: "test-code-45"
            },
        ],
    })

    expect(shortenResponse.status).toBe(400)


    const expectedRes = [
        {
            success: false,
            originalUrl: 'https://01o4cqwselsdsdu.com/path/xu33ya',
            code: 'test-code-30',
            message: 'You cannot use this short code, please try another one',
        },
        {
            success: false,
            originalUrl: 'https://01o4cqwselsdsdu.com/path/xu33ya',
            code: 'test-code-45',
            message: 'You cannot use this short code, please try another one',

        },
    ];

    expect(shortenResponse.body.resultArr).toEqual(expectedRes);

})


// -------------  Test:4 => Valid case but without Expiry Date And Code --------------------- /

test('handle bulk processing of urls: Valid case but without Expiry Date And Code', async () => {
    // POST
    const apiKey = 'sk_test_3333333333333333'
    // const expireDate = '2028-12-01' // in YYYY-MM-DD formet. make dure it is future date.
    const shortenResponse = await request(app).post('/shorten/bulk').set('x-api-key', apiKey).send({
        bulkUrls: [
            {
                url: 'https://01o4cqwselsdsdu.com/path/xu33ya',
            },
            {
                url: 'https://01o4cqwselsdsdu.com/path/xu33ya',
            },
        ],
    })

    expect(shortenResponse.status).toBe(200)


    const expectedRes = [
        {
            success: true,
            originalUrl: 'https://01o4cqwselsdsdu.com/path/xu33ya',
            expireDate: null,
            code: expect.any(String),
            message: 'URL shortened successfully',
        },
        {
            success: true,
            originalUrl: 'https://01o4cqwselsdsdu.com/path/xu33ya',
            code: expect.any(String),
            expireDate: null,
            message: 'URL shortened successfully',

        },
    ];

    expect(shortenResponse.body.resultArr).toEqual(expectedRes);

})



// -------------  Test:4 => Invalid Code --------------------- //

test('handle bulk processing of urls: Invalid Code', async () => {
    // POST
    const apiKey = 'sk_test_3333333333333333'
    // const expireDate = '2028-12-01' // in YYYY-MM-DD formet. make dure it is future date.
    const shortenResponse = await request(app).post('/shorten/bulk').set('x-api-key', apiKey).send({
        bulkUrls: [
            {
                url: 'https://01o4cqwselsdsdu.com/path/xu33ya',
                code: "test-code-300@#$"
            }
        ],
    })

    expect(shortenResponse.status).toBe(400)


    const expectedRes = [
        {
            success: false,
            originalUrl: 'https://01o4cqwselsdsdu.com/path/xu33ya',
            code: 'test-code-300@#$',
            message: 'Code must contain only alphanumeric characters and hyphens',
        }
    ];

    expect(shortenResponse.body.resultArr).toEqual(expectedRes);

})

// -------------  Test:5 => Invalid API KEY --------------------- //

test('handle bulk processing of urls: Invalid API KEY', async () => {
    // POST
    const apiKey = 'sk_test_333333333323232333333'
    // const expireDate = '2028-12-01' // in YYYY-MM-DD formet. make dure it is future date.
    const shortenResponse = await request(app).post('/shorten/bulk').set('x-api-key', apiKey).send({
        bulkUrls: [
            {
                url: 'https://01o4cqwselsdsdu.com/path/xu33ya',
                code: "test-code-300@#$"
            }
        ],
    })

    expect(shortenResponse.status).toBe(401)
    expect(shortenResponse.body.error).toBe('Invalid API key')

})


// -------------  Test:6 => Invalid Date --------------------- //

test('handle bulk processing of urls: Invalid Date', async () => {
    // POST
    const apiKey = 'sk_test_3333333333333333'
    const expireDate = '2022-12-01' // in YYYY-MM-DD formet. make dure it is future date.
    const shortenResponse = await request(app).post('/shorten/bulk').set('x-api-key', apiKey).send({
        bulkUrls: [
            {
                url: 'https://01o4cqwselsdsdu.com/path/xu33ya',
                expireDate: expireDate
            }
        ],
    })

    expect(shortenResponse.status).toBe(400)


    const expectedRes = [
        {
            success: false,
            originalUrl: 'https://01o4cqwselsdsdu.com/path/xu33ya',
            message: 'Please provide future date',
        }
    ];

    expect(shortenResponse.body.resultArr).toEqual(expectedRes);

})

// -------------  Test:7 => Invalid URL --------------------- //

test('handle bulk processing of urls: Invalid URL', async () => {
    // POST
    const apiKey = 'sk_test_3333333333333333'
    const expireDate = '2028-12-01' // in YYYY-MM-DD formet. make dure it is future date.
    const shortenResponse = await request(app).post('/shorten/bulk').set('x-api-key', apiKey).send({
        bulkUrls: [
            {
                url: 'https: //01o4cqwselsdsdu.com/path/xu33ya',
                expireDate: expireDate
            }
        ],
    })

    expect(shortenResponse.status).toBe(400)


    const expectedRes = [
        {
            success: false,
            originalUrl: 'https: //01o4cqwselsdsdu.com/path/xu33ya',
            message: 'Invalid URL',
        }
    ];

    expect(shortenResponse.body.resultArr).toEqual(expectedRes);

})

// -------------  Test:8 => Invalid URL , Invalid Date , Invalide Code , Valid Thing --------------------- //

test('handle bulk processing of urls: Invalid URL , Invalid Date , Invalide Code, Valid Thing', async () => {
    // POST
    const apiKey = 'sk_test_3333333333333333'
    const shortenResponse = await request(app).post('/shorten/bulk').set('x-api-key', apiKey).send({
        bulkUrls: [
            {
                url: 'https://01o4cqwselsdsdu.com/path/xu33ya',
                expireDate: "2022-12-01",
            },
            {
                url: 'https://01o4 cqwselsdsdu.com/path/xu33ya',
            },
            {
                url: 'https://01o4cqwselsdsdu.com/path/xu33ya',
                code: "test-code-300@#$"
            },
            {
                url: 'https://01o4cqwselsdsdu.com/path/xu33ya',
                expireDate: "2028-12-01",
                code: "test-code-3232"
            }
        ],
    })

    expect(shortenResponse.status).toBe(200)


    const expectedRes = [
        {
            success: false,
            originalUrl: 'https://01o4cqwselsdsdu.com/path/xu33ya',
            message: 'Please provide future date',
        },
        {
            success: false,
            originalUrl: 'https://01o4 cqwselsdsdu.com/path/xu33ya',
            message: 'Invalid URL',
        },
        {
            success: false,
            originalUrl: 'https://01o4cqwselsdsdu.com/path/xu33ya',
            message: 'Code must contain only alphanumeric characters and hyphens',
            code: "test-code-300@#$"
        },
        {
            success: true,
            originalUrl: 'https://01o4cqwselsdsdu.com/path/xu33ya',
            expireDate: new Date('2028-12-01').toISOString(),
            code: 'test-code-3232',
            message: 'URL shortened successfully',
        }
    ];

    expect(shortenResponse.body.resultArr).toEqual(expectedRes);

})
