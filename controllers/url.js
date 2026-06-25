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
    const { url, expireDate } = req.body

    const apiKey = req.headers['x-api-key']

    if (!url || !apiKey) {
        return res.status(400).json({ error: 'URL and API key are required' })
    }

    let expire_at = null

    if (expireDate) {
        const date_res = new Date(expireDate)
        if (isNaN(date_res.getTime())) {
            return res.status(400).json({ error: 'Invalid date' })
        }

        // If past date then return error
        if (date_res < new Date()) {
            return res.status(400).json({ error: 'Please provide future date' })
        }

        expire_at = date_res
    }

    // Is valid url
    const urlRegex = /^(http|https):\/\/[^ "\s]+\.[^ "\s]+$/
    if (!urlRegex.test(url)) {
        return res.status(400).json({ error: 'Invalid URL' })
    }

    const user = await prisma.users.findUnique({
        where: {
            api_key: apiKey,
        },
        select: {
            id: true,
        },
    })

    if (!user) {
        return res.status(401).json({ error: 'Invalid API key' })
    }

    const userId = user.id

    const shortUrl = generateShortUrl()

    try {
        const prisma_res = await prisma.url_shortener.create({
            data: {
                original_url: url,
                short_code: shortUrl,
                user_id: userId,
                expire_at: expire_at,
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
            select: {
                id: true,
                visit_count: true,
                original_url: true,
                last_accessed_at: true,
                expire_at: true,
            },
        })

        if (!prisma_res) {
            return res.status(404).json({ error: 'URL not found' })
        }

        // If expire_at is set and it is less than current date time
        if (prisma_res.expire_at && prisma_res.expire_at < new Date()) {
            return res.status(404).json({ error: 'URL has expired' })
        }

        console.log('----------------------------------------->', prisma_res)

        // Increment visit_count field by 1
        await prisma.url_shortener.update({
            where: {
                id: prisma_res.id,
            },
            data: {
                visit_count: {
                    increment: 1,
                },
                last_accessed_at: new Date(),
            },
        })

        res.redirect(prisma_res.original_url)
    } catch (error) {
        console.error('Error redirecting URL:', error)
        res.status(500).json({ error: 'Failed to redirect URL' })
    }
}

export const softDeleteUrl = async (req, res) => {
    // Extract id from url params

    const shortCode = req?.params?.shortCode

    const apiKey = req.headers['x-api-key']

    if (!shortCode) {
        return res.status(400).json({ error: 'shortCode is required' })
    }

    if (!apiKey) {
        return res.status(400).json({ error: 'API key is required' })
    }

    const user = await prisma.users.findUnique({
        where: {
            api_key: apiKey,
        },
        select: {
            id: true,
        },
    })

    if (!user) {
        return res.status(401).json({ error: 'Invalid API key' })
    }

    const userId = user.id

    // Check id is available

    try {
        const dbRes = await prisma.url_shortener.findFirst({
            where: {
                short_code: shortCode,
                deleted_at: null,
                user_id: userId,
            },
            select: {
                id: true,
            },
        })

        if (!dbRes) {
            return res.status(404).json({ error: 'URL not found' })
        }

        // Update db
        const update_db = await prisma.url_shortener.update({
            where: {
                id: dbRes.id,
            },
            data: {
                deleted_at: new Date(),
            },
        })

        console.log('----------------------------------------->', update_db)

        // Send response
        res.status(204).send()
    } catch (error) {
        console.error('Error soft deleting URL:', error)
        res.status(500).json({ error: 'Failed to delete URL' })
    }
}
