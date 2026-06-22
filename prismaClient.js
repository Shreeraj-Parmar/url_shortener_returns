import 'dotenv/config'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from './generated/prisma/index.js'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })

export const prisma = new PrismaClient({ adapter })
export const prismaClient = prisma
