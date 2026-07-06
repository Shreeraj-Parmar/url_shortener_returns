import express from 'express'
import { shortenUrl, redirectUrl, softDeleteUrl, editUrl, getAllUrlsOfUser } from '../controllers/url.js'
import { getAnalyticsReport } from '../controllers/analytics.js'
import { handleBulkProcessing } from '../controllers/bulk-processing.js'
import { checkHealth } from '../controllers/health.js'
import { authMiddleware } from '../middlewares/authentication.js'
import { isEnterpriseUser } from '../middlewares/subscription.js'
import { isBlockedApiKey } from '../middlewares/blocked-api-key.js'
import { withTimeTracking } from '../middlewares/time-tracker.js'

const router = express.Router()

// Health Checking
router.get('/', (req, res) => {
    res.send('Url Shortener Server is running')
})

// POST
router.post('/shorten', ...withTimeTracking(isBlockedApiKey, authMiddleware, shortenUrl))

// Bulk processing
router.post('/shorten/bulk', ...withTimeTracking(isBlockedApiKey, authMiddleware, isEnterpriseUser, handleBulkProcessing))

// Edit
router.patch('/shorten', ...withTimeTracking(isBlockedApiKey, authMiddleware, editUrl))
router.patch('/shorten/:shortCode', ...withTimeTracking(isBlockedApiKey, authMiddleware, editUrl))

// Redirect
router.get('/redirect', ...withTimeTracking(redirectUrl))

// Delete
router.delete('/shorten', ...withTimeTracking(isBlockedApiKey, authMiddleware, softDeleteUrl))
router.delete('/shorten/:shortCode', ...withTimeTracking(isBlockedApiKey, authMiddleware, softDeleteUrl))

router.get('/health', ...withTimeTracking(checkHealth))

router.get('/urls', ...withTimeTracking(isBlockedApiKey, authMiddleware, getAllUrlsOfUser))

// Admin Route
router.get('/analytics', ...withTimeTracking(getAnalyticsReport))

export default router
