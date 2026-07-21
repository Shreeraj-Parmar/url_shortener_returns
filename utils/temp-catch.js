export const storeCacheRes = (key, value) => {
    if (!global.tempCache) {
        global.tempCache = {}
    }

    // Store in temp cache

    global.tempCache[key] = value
}

export const getCacheRes = (key) => {
    // Get from temp cache

    console.log('FROM CATCHE')

    const catch_response = global?.tempCache?.[key]

    return catch_response
}
