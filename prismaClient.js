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

const pool = new pg.Pool(poolConfig)
const adapter = new PrismaPg(pool)

export const prisma = new PrismaClient({ adapter })
export const prismaClient = prisma

