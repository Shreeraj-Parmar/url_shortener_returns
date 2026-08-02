import './instrument.js'
import express from 'express'
import dotenv from 'dotenv'
import router from './routes/index.js'
import { Logger } from './middlewares/log.js'
import * as Sentry from '@sentry/node'

dotenv.config()

const app = express()

export default app

const PORT = process.env.PORT || 8080

app.use(express.json())

// Common Middleware
app.use((req, res, next) => {
    Logger(req, res, next, {}, 'common')
})

// Demo route for sentry
app.get('/debug-sentry', function mainHandler(req, res) {
    Sentry.captureMessage('Something went wrong : fatal', 'fatal')
    Sentry.captureMessage('Something went wrong : error', 'error')
    Sentry.captureMessage('Something went wrong : log', 'log')
    Sentry.captureMessage('Something went wrong : info', 'info')
    Sentry.captureMessage('Something went wrong : debug', 'debug')
    throw new Error('My Seccond Error')
})

// Demo route for Cache-Control: private
app.get('/demo-private-cache', (req, res) => {
    // 1. Setting the Cache-Control header to private
    // We can also set a max-age (e.g., 60 seconds) so the browser caches it for 1 minute
    res.setHeader('Cache-Control', 'private, max-age=60')

    // 2. Sending personalized content (simulated)
    // Normally, this data would come from a database based on the user's session or cookie
    const simulatedUserId = req?.query?.userId || 'guest123'

    res.json({
        message: 'This is a private cache demo!',
        personalizedData: {
            userId: simulatedUserId,
            secretInfo: 'This data is only for this specific user and should not be stored in shared caches.'
        }
    })
})

// ---------------------------------------------------------
// NEW DEMOS FOR KITCHEN-SINK / CACHING CONCEPTS
// ---------------------------------------------------------

// Demo 1: no-store (The strict option - never cache anything)
app.get('/demo-no-store', (req, res) => {
    res.setHeader('Cache-Control', 'no-store')

    // We return the current time. 
    // Because of 'no-store', the time will ALWAYS update on every single request, 
    // even if you click the address bar and hit enter! The browser never saves it.
    res.json({
        message: 'This response will NEVER be cached.',
        time: new Date().toLocaleTimeString()
    })
})

// Demo 2: no-cache (You can cache it, but you MUST ask the server if it changed)
app.get('/demo-no-cache', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache')

    // Express automatically generates an "ETag" (a unique ID) for this data.
    // The browser saves this data and its ETag.
    // Next time, the browser asks: "Has the data for this ETag changed?"
    // Express sees it hasn't, and replies with 304 Not Modified.
    res.json({
        message: 'The browser caches this, but always asks the server if it changed.',
        staticData: "I am a static string, I don't change!"
    })
})



// Example of Response Header "Vary"
app.get('/demo-vary', (req, res) => {
    const lang = req.headers["accept-language"] || "";

    // Allow caching for 1 hour
    res.setHeader("Cache-Control", "public, max-age=3600");

    // Cache separately for each language
    res.setHeader("Vary", "Accept-Language");

    if (lang.startsWith("ja")) {
        res.end("こんにちは");
    } else {
        res.end("Hello");
    }
})



// Time taken middleware
app.use((req, res, next) => {
    const start = Date.now()
    const originalSend = res.send
    res.send = function (body) {
        const elapsed = Date.now() - start
        res.setHeader('X-Response-Time', `${elapsed}ms`)
        return originalSend.call(this, body)
    }
    next()
})

app.use(router)

// Error handling middleware
Sentry.setupExpressErrorHandler(app)

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Url Shortener Server is running on port ${PORT}`)
    })
}
