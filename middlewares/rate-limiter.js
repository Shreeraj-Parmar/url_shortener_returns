
const REDIS_KEY_PREFIX = 'ratelimit:';
const MAX_REQUESTS = 100; // 100 requests per minute
const WINDOW = 60; // 1 minute
import redisClient from '../redis/config.js';

export const rateLimiter = async (req, res, next) => {
    try {
        const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
        const redisKey = `${REDIS_KEY_PREFIX}${ip}`;

        // Try to get current request count for this IP
        const currentCount = await redisClient.incr(redisKey);

        // If this is the first request in the window, set the expiry
        if (currentCount === 1) {
            await redisClient.expire(redisKey, WINDOW);
        }

        // If request count exceeds limit, reject the request
        if (currentCount > MAX_REQUESTS) {
            return res.status(429).json({
                error: 'Too Many Requests. Please try again later.',
            });
        }

        // Attach rate limit info to request (optional)
        req.rateLimit = {
            currentCount,
            maxRequests: MAX_REQUESTS,
            windowMs: WINDOW,
        };

        next();
    } catch (error) {
        console.error('Rate limiting error:', error);
        // In case of Redis error, we can choose to allow the request or deny it.
        // Here we choose to allow it to avoid failing正常 requests due to Redis issues.
        next();
    }
}