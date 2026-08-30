const REDIS_KEY_PREFIX = 'ratelimit:';
const MAX_REQUESTS = 100; // 100 requests per minute
const WINDOW = 60; // 1 minute
import redisClient from '../redis/config.js';
import { prisma } from '../prismaClient.js';


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

export const createRateLimiter = ({ maxRequests, windowSeconds, endpointName }) => {
    return async (req, res, next) => {
        try {
            const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;

            // Key format includes the endpoint name so counts stay separate
            const redisKey = `${REDIS_KEY_PREFIX}${endpointName}:${ip}`;

            const currentCount = await redisClient.incr(redisKey);

            if (currentCount === 1) {
                await redisClient.expire(redisKey, windowSeconds);
            }

            if (currentCount > maxRequests) {
                return res.status(429).json({
                    error: 'Too Many Requests. Please try again later.',
                });
            }

            next();
        } catch (error) {
            console.error('Rate limiting error:', error);
            next();
        }
    };
};


// Max 10 requests per 1 second for /shorten
export const shortenRateLimiter = createRateLimiter({
    maxRequests: 10,
    windowSeconds: 1,
    endpointName: 'shorten',
});

// Max 50 requests per 1 second for /redirect
export const redirectRateLimiter = createRateLimiter({
    maxRequests: 50,
    windowSeconds: 1,
    endpointName: 'redirect',
});

// Dynamic Rate Limiter based on User Tier
export const tierRateLimiter = async (req, res, next) => {
    try {
        const userId = req.userId;
        
        // If not authenticated, fallback to IP
        const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
        const identifier = userId ? `user:${userId}` : `ip:${ip}`;
        
        // 5 requests per 60 seconds for Free tier
        let maxRequests = 5; 
        let windowSeconds = 60;

        // If authenticated, check their tier from req.user
        if (req.user) {
            const userTier = req.user.tier;
            
            // Adjust limits for paying customers
            if (userTier === 'hobby') {
                maxRequests = 50; 
            } else if (userTier === 'enterprise') {
                maxRequests = 500;
            }
        }

        // Redis logic
        const redisKey = `${REDIS_KEY_PREFIX}tier:${identifier}`;
        const currentCount = await redisClient.incr(redisKey);

        if (currentCount === 1) {
            await redisClient.expire(redisKey, windowSeconds);
        }

        if (currentCount > maxRequests) {
            return res.status(429).json({
                error: 'Too Many Requests. Please upgrade your plan for higher limits.',
            });
        }

        next();
    } catch (error) {
        console.error('Tier rate limiting error:', error);
        next(); // Fail open so users aren't blocked if Redis goes down
    }
};

// -------------------------------------------------------------
// [BONUS] Rate Limiter that INJECTS X-RateLimit Headers
// -------------------------------------------------------------
export const createRateLimiterWithHeaders = ({ maxRequests, windowSeconds, endpointName }) => {
    return async (req, res, next) => {
        try {
            const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
            const redisKey = `${REDIS_KEY_PREFIX}headers:${endpointName}:${ip}`;

            const currentCount = await redisClient.incr(redisKey);
            let ttl = await redisClient.ttl(redisKey);

            if (currentCount === 1) {
                await redisClient.expire(redisKey, windowSeconds);
                ttl = windowSeconds;
            } else if (ttl === -1) {
                await redisClient.expire(redisKey, windowSeconds);
                ttl = windowSeconds;
            }

            // Calculate exact Unix timestamp for reset
            const resetTimestamp = Math.floor(Date.now() / 1000) + ttl;
            const remaining = Math.max(0, maxRequests - currentCount);

            // Set the headers on the response!
            res.setHeader('X-RateLimit-Limit', maxRequests);
            res.setHeader('X-RateLimit-Remaining', remaining);
            res.setHeader('X-RateLimit-Reset', resetTimestamp);

            if (currentCount > maxRequests) {
                return res.status(429).json({
                    error: 'Bonus Header Error: Too Many Requests.',
                });
            }

            next();
        } catch (error) {
            console.error('Rate limiting headers error:', error);
            next();
        }
    };
};
