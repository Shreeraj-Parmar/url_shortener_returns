import express from 'express'
import { shortenUrl, redirectUrl, softDeleteUrl, editUrl } from '../controllers/url.js'
import { getAnalyticsReport } from '../controllers/analytics.js'
import { handleBulkProcessing } from '../controllers/bulk-processing.js'

const router = express.Router()

router.get('/', (req, res) => {
    res.send('Url Shortener Server is running')
})

router.get('/hello', (req, res) => {
    res.json({
        message: 'Hello World',
    })
})

router.post('/shorten', shortenUrl)

// Bulk processing
router.post('/shorten/bulk', handleBulkProcessing)

// Edit 
router.patch('/shorten', editUrl)
router.patch('/shorten/:shortCode', editUrl)

router.get('/redirect', redirectUrl)

router.delete('/shorten', softDeleteUrl)
router.delete('/shorten/:shortCode', softDeleteUrl)




router.get('/analytics', getAnalyticsReport)

export default router
