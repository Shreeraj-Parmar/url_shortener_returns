import pg from "pg";
const { Pool } = pg;
import dotenv from "dotenv";

dotenv.config();

export const dbClient = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});

// With Pool, we don't need to call .connect() manually.
// It will connect automatically when the first query is made.
dbClient.query("SELECT NOW()")
    .then(() => console.log("PostgreSQL Database connected successfully"))
    .catch((err) => console.error("Database connection failed:", err));