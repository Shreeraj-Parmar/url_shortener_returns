import { Client } from "pg"
import dotenv from "dotenv"

dotenv.config()

export const dbClient = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});

dbClient.connect()
    .then(() => console.log("Connected to PostgreSQL database"))
    .catch((err) => console.error("Failed to connect to database:", err));