import redisClient from '../redis/config.js';

export const tokenBucketRateLimiter = ({ maxTokens, refillRatePerSecond }) => {
    return async (req, res, next) => {
        try {
            // 1. Identify the user
            const identifier = req.ip || 'unknown';
            const key = `ratelimit:token:${identifier}`;
            const now = Date.now();

            // 2. Look inside the user's bucket in Redis
            const bucket = await redisClient.hGetAll(key);

            let tokens;
            let lastRefill;

            // If the bucket is completely empty (first time visiting)
            if (Object.keys(bucket).length === 0) {
                console.log("\n=== TOKEN BUCKET: FIRST VISIT ===");
                console.log(`No bucket found in Redis. Giving you a full bucket of ${maxTokens} hearts!`);
                tokens = maxTokens; // Give them a full bucket of hearts!
                lastRefill = now;
            } else {
                console.log("\n=== TOKEN BUCKET: RETURN VISIT ===");
                // They visited before. Read how many tokens they had left.
                tokens = parseFloat(bucket.tokens);
                lastRefill = parseInt(bucket.lastRefill);
                console.log(`1. You had ${tokens.toFixed(2)} hearts left from your last visit.`);

                // Calculate how many seconds have passed since their last visit
                const secondsPassed = (now - lastRefill) / 1000;
                console.log(`2. You were gone for ${secondsPassed.toFixed(2)} seconds.`);

                // Give them their free tokens based on how long they waited
                const earnedTokens = secondsPassed * refillRatePerSecond;
                console.log(`3. Because you were gone, you earned ${earnedTokens.toFixed(2)} free hearts!`);

                // Add the earned tokens to their bucket, but NEVER go over the max limit
                tokens = Math.min(maxTokens, tokens + earnedTokens);
                console.log(`4. After adding your free hearts (capping at max ${maxTokens}), you now have ${tokens.toFixed(2)} hearts.`);
                lastRefill = now;
            }

            // 3. Do they have enough tokens to play?
            if (tokens >= 1) {
                console.log("-> RESULT: ALLOWED! You have at least 1 heart.");
                // Yes! Spend 1 token (Heart)
                tokens -= 1;
                console.log(`-> Spending 1 heart... You now have ${tokens.toFixed(2)} hearts saved in Redis.`);

                // Save the updated bucket back to Redis
                const multi = redisClient.multi();
                multi.hSet(key, {
                    tokens: tokens.toString(),
                    lastRefill: lastRefill.toString()
                });
                // Make sure the database cleans up if they don't return for a long time
                multi.expire(key, 120);
                await multi.exec();

                // Let them in!
                next();
            } else {
                // No tokens left! Block them.
                console.log("-> RESULT: BLOCKED! You do not have enough hearts to play.");

                // We still save the bucket so it remembers the time they checked
                await redisClient.hSet(key, {
                    tokens: tokens.toString(),
                    lastRefill: lastRefill.toString()
                });

                return res.status(429).json({
                    error: 'Too Many Requests',
                    message: `Token Bucket: You are out of Hearts! You earn ${refillRatePerSecond} heart(s) every second. Please wait.`
                });
            }

        } catch (error) {
            console.error('Token Bucket Error:', error);
            // If Redis crashes, let them through so the website doesn't break
            next();
        }
    };
};
