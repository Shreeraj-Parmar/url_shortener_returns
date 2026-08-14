import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL;

const redisClient = createClient({
    url: REDIS_URL
});



redisClient.on('connect', () => {
    console.log('Redis client connected');
});

redisClient.on('error', (err) => {
    console.log('Redis client error', err);
});

await redisClient.connect();

export default redisClient;
