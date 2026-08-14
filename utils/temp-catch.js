import redisClient from "../redis/config.js";

export const storeCacheRes = async (key, value) => {
    // Store in temp cache
    // Expiration passed as an object: { EX: seconds }
    await redisClient.set(key, JSON.stringify(value), { EX: 60 * 60 * 24 });
}

export const getCacheRes = async (key) => {
    // Get from temp cache
    console.log('FROM CATCHE')

    const catch_response = await redisClient.get(key);

    // Redis returns a STRING. We must parse it back into a Javascript Object!
    if (!catch_response) {
        return null;
    }

    return JSON.parse(catch_response);
}
