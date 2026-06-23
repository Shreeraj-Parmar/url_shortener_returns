import { prisma } from '../prismaClient.js'

const generateShortUrl = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let shortUrl = ''
    for (let i = 0; i < 6; i++) {
        shortUrl += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return shortUrl
}

export const shortenUrl = async (req, res) => {
    const { url } = req.body

    if (!url) {
        return res.status(400).json({ error: 'URL is required' })
    }

    const shortUrl = generateShortUrl()

    try {
        // First check the URL is already is available? if yes then send short code from Db

        const existingUrl = await prisma.url_shortener.findFirst({
            where: {
                original_url: url,
            },
        })

        if (existingUrl) {
            return res.json({ short_code: existingUrl.short_code })
        }

        const prisma_res = await prisma.url_shortener.create({
            data: {
                original_url: url,
                short_code: shortUrl,
            },
        })

        console.log('----------------------------------------->', prisma_res)

        res.json({ short_code: shortUrl })
    } catch (error) {
        console.error('Error shortening URL:', error)
        res.status(500).json({ error: 'Failed to shorten URL' })
    }
}

export const redirectUrl = async (req, res) => {
    const { code } = req.query

    if (!code) {
        return res.status(400).json({ error: 'Code is required' })
    }

    try {
        const prisma_res = await prisma.url_shortener.findUnique({
            where: {
                short_code: code,
            },
        })

        if (!prisma_res) {
            return res.status(404).json({ error: 'URL not found' })
        }

        res.redirect(prisma_res.original_url)
    } catch (error) {
        console.error('Error redirecting URL:', error)
        res.status(500).json({ error: 'Failed to redirect URL' })
    }
}

export const softDeleteUrl = async (req, res) => {
    // Extract id from url params

    const shortCode = req.params.shortCode

    if (!shortCode) {
        return res.status(400).json({ error: 'shortCode is required' })
    }

    // Check id is available

    try {
        const dbRes = await prisma.url_shortener.findFirst({
            where: {
                short_code: shortCode,
                deleted_at: null,
            },
        })

        if (!dbRes) {
            return res.status(404).json({ error: 'URL not found' })
        }

        // Update db
        await prisma.url_shortener.update({
            where: {
                short_code: shortCode,
            },
            data: {
                deleted_at: new Date(),
            },
        })

        // Send response
        res.status(204).send()
    } catch (error) {
        console.error('Error soft deleting URL:', error)
        res.status(500).json({ error: 'Failed to delete URL' })
    }
}
