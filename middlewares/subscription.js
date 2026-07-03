/**
 * Authorization middleware for API key
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
export const isEnterpriseUser = async (req, res, next) => {
    try {
        // Extract user from request
        const { tier } = req.user

        //if type is enterprize then check user tier is enterprize
        if (tier !== 'enterprise') {
            return res.status(403).json({ error: 'Only enterprise tier users are allowed to use this API' })
        }

        // Next
        next()
    } catch (error) {
        console.error('Authentication error:', error)
        return res.status(401).json({ error: 'Unauthorized' })
    }
}
