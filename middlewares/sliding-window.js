import redisClient from '../redis/config.js';

export const slidingWindowRateLimiter = ({ maxRequests, windowSeconds }) => {
    return async (req, res, next) => {
        try {
            // 1. Identify the user (using IP address for this demo)
            const identifier = req.ip || 'unknown';
            const key = `ratelimit:sliding:${identifier}`;

            // 2. Get current time in milliseconds
            const now = Date.now();
            const windowStart = now - (windowSeconds * 1000);

            // 3. We use a Redis "Pipeline" to run multiple commands at once fast
            const multi = redisClient.multi();

            // Step A: Remove all old requests outside our sliding window (older than windowStart)
            multi.zRemRangeByScore(key, 0, windowStart);

            // Step B: Add the current request. We need a unique string, so we use time + random number
            const uniqueMember = `${now}-${Math.random()}`;
            multi.zAdd(key, [{ score: now, value: uniqueMember }]);

            // Step C: Count how many requests are inside the window right now
            multi.zCard(key);

            // Step D: Set an expiration time on the key so it cleans itself up if the user stops visiting
            multi.expire(key, windowSeconds + 1);

            // 4. Run all the commands!
            const results = await multi.exec();
            
            console.log("=== REDIS MULTI RESULTS ===");
            console.log("Command 1 (zRemRangeByScore):", results[0], "<- Items deleted");
            console.log("Command 2 (zAdd):", results[1], "<- Items added");
            console.log("Command 3 (zCard):", results[2], "<- Total items in window now");
            console.log("Command 4 (expire):", results[3], "<- Expire time set");
            console.log("===========================");

            // The result of zCard (counting) is the 3rd command (index 2)
            const requestCount = results[2];

            // 5. Check if they have too many requests
            if (requestCount > maxRequests) {
                return res.status(429).json({
                    error: 'Too Many Requests',
                    message: `Sliding Window: You can only make ${maxRequests} requests every ${windowSeconds} seconds. Please wait.`
                });
            }

            // 6. If they are under the limit, let them through
            next();
        } catch (error) {
            console.error('Sliding Window Rate Limiter Error:', error);
            // If redis fails, let them through (fail open)
            next();
        }
    };
};
