import request from "supertest";
import app from "../index.js";
import { prismaClient } from "../prismaClient.js";

const prisma = prismaClient;



// afterAll -> we tell Jest: "Once all these tests are done, close the database connection so the program can exit gracefully."


//Other common Jest Hooks:
// beforeAll: Runs once before any tests start (useful for setting up a database or seeding data).
// beforeEach: Runs before every single test (useful for resetting variables).
// afterEach: Runs after every single test (useful for clearing temporary files).


afterAll(async () => {
    await prisma.$disconnect();
});

test("shorten URL and redirect", async () => {
    // POST
    const shortenResponse = await request(app)
        .post("/shorten")
        .send({
            url: "https://01o4cqwelu.com/path/xu33ya"
        });

    const shortCode1 = shortenResponse.body.short_code;

    expect(shortenResponse.status).toBe(200);

    // Test dublicate url

    const shortenResponse2 = await request(app)
        .post("/shorten")
        .send({
            url: "https://01o4cqwelu.com/path/xu33ya"
        });

    expect(shortenResponse2.status).toBe(200);
    expect(shortenResponse2.body.short_code).not.toBe(shortCode1);
});