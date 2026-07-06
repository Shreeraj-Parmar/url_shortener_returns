/**
 * Time Traker Middlware
 * @param {string} name
 * @param {Function} middleware
 * @returns {Function}
 */
export const timeTracker = (name, middleware) => {
    return async (req, res, next) => {
        const start = process.hrtime.bigint()
        await middleware(req, res, next)
        const end = process.hrtime.bigint()
        const ms = Number(end - start) / 1_000_000
        console.log(`Middleware ${name} took ${ms}ms`)
    }
}

/**
 * Wraps an array of middlewares with timeTracker automatically.
 * @param  {...Function} middlewares 
 * @returns {Function[]}
 */
export const withTimeTracking = (...middlewares) => {
    return middlewares.map(middleware => timeTracker(middleware.name || 'anonymous', middleware))
}
