import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const blacklistFile = path.join(__dirname, '../config/blacklist.json')

/**
 * Authorization middleware for API key
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
export const isBlockedApiKey = async (req, res, next) => {
    try {
        // Extract API key from request headers
        const apiKey = req.headers['x-api-key']

        // If API key is not provided
        if (!apiKey) {
            return res.status(400).json({ error: 'API key is required' })
        }

        // Check API KEY is in Blocked List?

        const blackList = JSON.parse(fs.readFileSync(blacklistFile, 'utf8'))

        if (blackList.blockedApiKeys.includes(apiKey)) {
            return res.status(403).json({ error: 'API key is blocked' })
        }

        // Next
        next()
    } catch (error) {
        console.error('Blocked API key error:', error)
        return res.status(403).json({ error: 'API key is blocked' })
    }
}
