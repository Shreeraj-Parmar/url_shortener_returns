import express from 'express'
import dotenv from 'dotenv'
import router from './routes/index.js'
import { Logger } from './middlewares/log.js'
import './instrument.js'
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
