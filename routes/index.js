import express from 'express'
import { shortenUrl, redirectUrl, softDeleteUrl } from '../controllers/url.js'

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

router.get('/redirect', redirectUrl)

router.delete('/shorten', softDeleteUrl)
router.delete('/shorten/:shortCode', softDeleteUrl)

export default router
