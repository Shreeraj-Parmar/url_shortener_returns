import 'dotenv/config'
import { prisma } from './prismaClient.js'

async function main() {
    const urls = await prisma.url_shortener.findMany({
        take: 10,
    })

    console.log(urls)
}

main()
