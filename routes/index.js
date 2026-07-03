import express from 'express'
import { shortenUrl, redirectUrl, softDeleteUrl, editUrl, getAllUrlsOfUser } from '../controllers/url.js'
import { getAnalyticsReport } from '../controllers/analytics.js'
import { handleBulkProcessing } from '../controllers/bulk-processing.js'
import { checkHealth } from '../controllers/health.js'
import { authMiddleware } from '../middlewares/authentication.js'
import { isEnterpriseUser } from '../middlewares/subscription.js'
import { isBlockedApiKey } from '../middlewares/blocked-api-key.js'

const router = express.Router()

// Health Checking
router.get('/', (req, res) => {
    res.send('Url Shortener Server is running')
})

// POST
router.post('/shorten', isBlockedApiKey, authMiddleware, shortenUrl)

// Bulk processing
router.post('/shorten/bulk', isBlockedApiKey, authMiddleware, isEnterpriseUser, handleBulkProcessing)

// Edit
router.patch('/shorten', isBlockedApiKey, authMiddleware, editUrl)
router.patch('/shorten/:shortCode', isBlockedApiKey, authMiddleware, editUrl)

// Redirect
router.get('/redirect', redirectUrl)

// Delete
router.delete('/shorten', isBlockedApiKey, authMiddleware, softDeleteUrl)
router.delete('/shorten/:shortCode', isBlockedApiKey, authMiddleware, softDeleteUrl)

router.get('/health', checkHealth)

router.get('/urls', isBlockedApiKey, authMiddleware, getAllUrlsOfUser)

// Admin Route
router.get('/analytics', getAnalyticsReport)

export default router
