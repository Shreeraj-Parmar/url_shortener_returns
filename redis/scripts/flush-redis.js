import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const clearRedis = async () => {
    console.log("Connecting to Redis...");
    const client = createClient({ url: process.env.REDIS_URL });

    client.on('error', (err) => console.log('Redis Client Error', err));

    await client.connect();

    try {
        console.log("Sending command to flush all data...");
        // flushAll clears all databases in the Redis instance
        await client.flushAll();
        console.log("✅ Successfully cleared all data from Redis!");
    } catch (err) {
        console.error("❌ Failed to clear Redis data:", err);
    } finally {
        await client.quit();
        process.exit(0);
    }
};

clearRedis();
