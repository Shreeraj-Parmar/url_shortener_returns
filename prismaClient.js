import 'dotenv/config'
import pg from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/prisma/index.js'

// Initialize the standard PostgreSQL connection pool
const poolConfig = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASS,
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
    };

export const pool = new pg.Pool(poolConfig)
const adapter = new PrismaPg(pool)

export const prisma = new PrismaClient({ adapter })

// Override $disconnect to also close the pool, so tests exit cleanly
const originalDisconnect = prisma.$disconnect.bind(prisma);
prisma.$disconnect = async () => {
    await originalDisconnect();
    await pool.end();
};

export const prismaClient = prisma
