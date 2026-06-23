import request from "supertest";
import app from "../index.js";
import { prismaClient } from "../prismaClient.js";

const prisma = prismaClient;

afterAll(async () => {
    await prisma.$disconnect();
});

test("GET /hello", async () => {
    const response = await request(app)
        .get("/hello");

    expect(response.status).toBe(200);

    expect(response.body.message)
        .toBe("Hello World");
});