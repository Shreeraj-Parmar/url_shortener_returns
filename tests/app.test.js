import request from "supertest";
import app from "../index.js";
import { dbClient } from "../db.js";

afterAll(async () => {
    await dbClient.end();
});

test("GET /hello", async () => {
    const response = await request(app)
        .get("/hello");

    expect(response.status).toBe(200);

    expect(response.body.message)
        .toBe("Hello World");
});