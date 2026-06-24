import { prisma } from '../prismaClient.js'

export const getAnalyticsReport = async (req, res) => {
    try {
        // validation if limit is not number send error
        if (req.query.limit && isNaN(parseInt(req.query.limit))) {
            return res.status(400).json({ error: 'Invalid limit parameter' })
        }
        // validation if skip is not number send error
        if (req.query.skip && isNaN(parseInt(req.query.skip))) {
            return res.status(400).json({ error: 'Invalid skip parameter' })
        }

        const limitAmount = parseInt(req.query.limit) || 10
        const skipAmount = parseInt(req.query.skip) || 0

        const prisma_res = await prisma.url_shortener.findMany({
            where: {
                deleted_at: null,
            },
            take: limitAmount,
            skip: skipAmount,
            select: {
                original_url: true,
            },
            orderBy: {
                created_at: 'desc',
            },
        })

        res.status(200).json({
            latest_10_urls: prisma_res,
            message: 'Analytics report retrieved successfully',
        })
    } catch (error) {
        console.error('Error getting analytics report:', error)
        res.status(500).json({ error: 'Failed to get analytics report' })
    }
}
