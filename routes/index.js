import express from 'express'
import { shortenUrl, redirectUrl, softDeleteUrl, editUrl, getAllUrlsOfUser } from '../controllers/url.js'
import { getAnalyticsReport } from '../controllers/analytics.js'
import { handleBulkProcessing } from '../controllers/bulk-processing.js'
import { checkHealth } from '../controllers/health.js'
import { authMiddleware } from '../middlewares/authentication.js'
import { isEnterpriseUser } from '../middlewares/subscription.js'
import { isBlockedApiKey } from '../middlewares/blocked-api-key.js'
import { withTimeTracking } from '../middlewares/time-tracker.js'
import { rateLimiter, redirectRateLimiter, tierRateLimiter } from '../middlewares/rate-limiter.js'

const router = express.Router()

// Health Checking
router.get('/', (req, res) => {
    res.send('Url Shortener Server is running')
})

// POST
router.post('/shorten', ...withTimeTracking(isBlockedApiKey, authMiddleware, tierRateLimiter, shortenUrl))

// Bulk processing
router.post('/shorten/bulk', ...withTimeTracking(rateLimiter, isBlockedApiKey, authMiddleware, isEnterpriseUser, handleBulkProcessing))

// Edit
router.patch('/shorten', ...withTimeTracking(rateLimiter, isBlockedApiKey, authMiddleware, editUrl))
router.patch('/shorten/:shortCode', ...withTimeTracking(rateLimiter, isBlockedApiKey, authMiddleware, editUrl))

// Redirect
router.get('/redirect', ...withTimeTracking(redirectRateLimiter, redirectUrl))

// Delete
router.delete('/shorten', ...withTimeTracking(rateLimiter, isBlockedApiKey, authMiddleware, softDeleteUrl))
router.delete('/shorten/:shortCode', ...withTimeTracking(rateLimiter, isBlockedApiKey, authMiddleware, softDeleteUrl))

router.get('/health', ...withTimeTracking(rateLimiter, checkHealth))

router.get('/urls', ...withTimeTracking(rateLimiter, isBlockedApiKey, authMiddleware, getAllUrlsOfUser))

// Admin Route
router.get('/analytics', ...withTimeTracking(rateLimiter, getAnalyticsReport))

export default router
