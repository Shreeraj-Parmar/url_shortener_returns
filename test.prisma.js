import 'dotenv/config'

import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from './generated/prisma/index.js'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
    const urls = await prisma.url_shortener.findMany({
        take: 10,
    })

    console.log(urls)
}

main()
