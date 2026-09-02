import redisClient from '../redis/config.js';

export const leakyBucketRateLimiter = ({ capacity, leakRatePerSecond }) => {
    return async (req, res, next) => {
        try {
            const identifier = req.ip || 'unknown';
            const key = `ratelimit:leaky:${identifier}`;
            const now = Date.now();

            const bucket = await redisClient.hGetAll(key);

            let water = 0;
            let lastLeak = now;

            if (Object.keys(bucket).length === 0) {
                console.log("\n=== LEAKY BUCKET: FIRST VISIT ===");
                console.log("Bucket is totally empty! Starting with 0 water.");
            } else {
                console.log("\n=== LEAKY BUCKET: RETURN VISIT ===");
                water = parseFloat(bucket.water);
                lastLeak = parseInt(bucket.lastLeak);
                console.log(`1. Your bucket had ${water.toFixed(2)} drops of water in it.`);

                const secondsPassed = (now - lastLeak) / 1000;
                console.log(`2. You waited ${secondsPassed.toFixed(2)} seconds.`);

                // Calculate how much water drained out of the hole while they waited
                const leakedWater = secondsPassed * leakRatePerSecond;
                console.log(`3. While you waited, ${leakedWater.toFixed(2)} drops leaked out of the hole at the bottom.`);

                // Water can't go below 0 (an empty bucket is just empty)
                water = Math.max(0, water - leakedWater);
                console.log(`4. You now have ${water.toFixed(2)} drops sitting in your bucket.`);
                lastLeak = now;
            }

            // Can the bucket hold 1 more drop of water (their current request)?
            if (water < capacity) {
                console.log(`-> RESULT: ALLOWED! Bucket is not full (Limit is ${capacity}).`);
                water += 1; // Pour their request into the bucket
                console.log(`-> Adding 1 drop... Bucket now holds ${water.toFixed(2)} drops.`);
                
                const multi = redisClient.multi();
                multi.hSet(key, { 
                    water: water.toString(), 
                    lastLeak: lastLeak.toString() 
                });
                multi.expire(key, 120); 
                await multi.exec();
                
                next();
            } else {
                console.log(`-> RESULT: BLOCKED! Bucket overflowed! (Max is ${capacity}).`);
                
                await redisClient.hSet(key, { 
                    water: water.toString(), 
                    lastLeak: lastLeak.toString() 
                });
                
                return res.status(429).json({
                    error: 'Too Many Requests',
                    message: `Leaky Bucket: The bucket overflowed! It drains at ${leakRatePerSecond} drops per second. Please wait.`
                });
            }
        } catch (error) {
            console.error('Leaky Bucket Error:', error);
            next();
        }
    };
};
