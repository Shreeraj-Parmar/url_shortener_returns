import express from 'express'
import { shortenUrl, redirectUrl, softDeleteUrl, editUrl, getAllUrlsOfUser } from '../controllers/url.js'
import { getAnalyticsReport } from '../controllers/analytics.js'
import { handleBulkProcessing } from '../controllers/bulk-processing.js'
import { checkHealth } from '../controllers/health.js'
import { authMiddleware } from '../middlewares/authentication.js'

const router = express.Router()

// Health Checking
router.get('/', (req, res) => {
    res.send('Url Shortener Server is running')
})

// POST
router.post('/shorten', authMiddleware, shortenUrl)

// Bulk processing
router.post('/shorten/bulk', authMiddleware, handleBulkProcessing)

// Edit
router.patch('/shorten', authMiddleware, editUrl)
router.patch('/shorten/:shortCode', authMiddleware, editUrl)

// Redirect
router.get('/redirect', redirectUrl)

// Delete
router.delete('/shorten', authMiddleware, softDeleteUrl)
router.delete('/shorten/:shortCode', authMiddleware, softDeleteUrl)

router.get('/health', checkHealth)

router.get('/urls', authMiddleware, getAllUrlsOfUser)

// Admin Route
router.get('/analytics', getAnalyticsReport)

export default router
