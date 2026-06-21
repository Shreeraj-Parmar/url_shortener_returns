import request from "supertest";
import app from "../index.js";
import { dbClient } from "../db.js";



// afterAll -> we tell Jest: "Once all these tests are done, close the database connection so the program can exit gracefully."


//Other common Jest Hooks:
// beforeAll: Runs once before any tests start (useful for setting up a database or seeding data).
// beforeEach: Runs before every single test (useful for resetting variables).
// afterEach: Runs after every single test (useful for clearing temporary files).


afterAll(async () => {
    await dbClient.end();
});

test("shorten URL and redirect", async () => {
    // POST
    const shortenResponse = await request(app)
        .post("/shorten")
        .send({
            url: "https://example79856985666.com"
        });

    const shortCode = shortenResponse.body.short_code;

    // GET
    const redirectResponse = await request(app)
        .get(`/redirect?code=${shortCode}`);

    // CHECK
    expect(redirectResponse.status).toBe(302);
    expect(redirectResponse.headers.location).toBe("https://example79856985666.com");
});