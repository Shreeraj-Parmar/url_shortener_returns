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

// Demo 2.5: max-age=0, must-revalidate (The outdated way to force revalidation)
// This behaves identically to no-cache, but is a relic of HTTP/1.0
app.get('/demo-must-revalidate', (req, res) => {
    res.setHeader('Cache-Control', 'max-age=0, must-revalidate')
    
    res.json({
        message: 'This behaves identically to no-cache in modern browsers.',
        staticData: "I am a static string too!"
    })
})

// Demo 2.6: no-cache, private (The MDN Recommended "Do Not Cache" / Privacy Solution)
// Use this instead of 'no-store' for sensitive data! It protects privacy but keeps the Back button fast.
app.get('/demo-sensitive-data', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, private')
    
    res.json({
        message: 'This data is protected from CDNs, but keeps the Back button fast!',
        bankBalance: "$1,000,000"
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

// =========================================================================
// 1. Last-Modified / If-Modified-Since (The "Time" Tool)
// =========================================================================
app.get('/demo-last-modified', (req, res) => {
    // Imagine this timestamp came from your database's "updated_at" column
    const lastUpdatedAt = new Date('2026-08-05T10:00:00Z'); 
    
    // Check what date the browser is asking about
    const clientDateString = req.headers['if-modified-since'];
    
    if (clientDateString) {
        const clientDate = new Date(clientDateString);
        // If the browser's date is equal to or newer than our last update...
        if (clientDate.getTime() >= lastUpdatedAt.getTime()) {
            console.log("Validation: Client has the latest version (Last-Modified)");
            return res.status(304).end(); // 304 Not Modified (Saves bandwidth!)
        }
    }

    // If the browser doesn't have it, or has an old one, send the data:
    console.log("Validation: Sending fresh data (Last-Modified)");
    res.setHeader('Last-Modified', lastUpdatedAt.toUTCString());
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.json({
        message: 'Here is the data, backed by a Last-Modified timestamp.',
        updatedAt: lastUpdatedAt.toUTCString()
    });
});

// =========================================================================
// 2. ETag / If-None-Match (The "Fingerprint" Tool)
// =========================================================================
app.get('/demo-etag', (req, res) => {
    // Turn off Express's automatic ETag generator just for this demo 
    // so we can see how to do it manually!
    app.set('etag', false);

    // Imagine this fingerprint is a hash of your data, or a strict version number
    const currentEtag = 'version-v1'; 
    
    // Check what ETag the browser is holding onto
    const clientEtag = req.headers['if-none-match'];

    // If the browser's ETag matches our current ETag...
    if (clientEtag === currentEtag) {
        console.log("Validation: Client has the exact matching ETag!");
        return res.status(304).end(); // 304 Not Modified
    }

    // If the browser doesn't have it, or it doesn't match, send new data:
    console.log("Validation: Sending fresh data with new ETag");
    res.setHeader('ETag', currentEtag);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.json({
        message: 'Here is the data, backed by a strong ETag.',
        version: currentEtag
    });
});



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

import { createRateLimiterWithHeaders } from './middlewares/rate-limiter.js';
import { slidingWindowRateLimiter } from './middlewares/sliding-window.js';

// Demo 3: [BONUS] Rate Limiting Headers
const demoRateLimiter = createRateLimiterWithHeaders({
    maxRequests: 5,
    windowSeconds: 60,
    endpointName: 'demo-rate-limit'
});

app.get('/demo-rate-limit', demoRateLimiter, (req, res) => {
    res.json({
        message: 'Success! Look at the Response Headers in Postman or Browser DevTools!',
        tip: 'Check for X-RateLimit-Remaining counting down to 0, then you will get blocked.'
    });
});

// Demo 4: Sliding Window Rate Limiter
// Only allows 2 requests every 10 seconds.
const slidingLimiter = slidingWindowRateLimiter({
    maxRequests: 2,
    windowSeconds: 10
});

app.get('/demo-sliding-window', slidingLimiter, (req, res) => {
    res.json({
        message: 'Success! You passed the sliding window rate limiter.',
        tip: 'Try refreshing more than 2 times in 10 seconds to see the block.'
    });
});

app.use(router)

// Error handling middleware
Sentry.setupExpressErrorHandler(app)

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Url Shortener Server is running on port ${PORT}`)
    })
}
