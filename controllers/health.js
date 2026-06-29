import { prisma } from '../prismaClient.js'

export const checkHealth = async (req, res) => {
    try {
        // 1. Verify Database Connectivity
        await prisma.$queryRaw`SELECT 1`
        // 2. Respond indicating both Server & DB are healthy
        res.status(200).json({
            status: 'success',
            message: 'Server is up and database is connected',
        })
    } catch (error) {
        // Respond indicating Server is up, but DB failed
        console.error('Health check failed:', error)
        res.status(500).json({
            status: 'error',
            message: 'Database connection failed',
            error: error.message,
        })
    }
}
