import { prisma } from '../prismaClient.js'

/**
 * Authentication middleware for API key
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
export const authMiddleware = async (req, res, next) => {
    try {
        // Extract API key from request headers
        const apiKey = req.headers['x-api-key']

        // If API key is not provided
        if (!apiKey) {
            return res.status(400).json({ error: 'API key is required' })
        }

        // Find User by API key
        const user = await prisma.users.findUnique({
            where: {
                api_key: apiKey,
            },
        })

        // If user is not found
        if (!user) {
            return res.status(401).json({ error: 'Invalid API key' })
        }

        // Set userId in request
        req.userId = user.id

        // Set user in request
        req.user = user

        // Next
        next()
    } catch (error) {
        console.error('Authentication error:', error)
        return res.status(401).json({ error: 'Unauthorized' })
    }
}
