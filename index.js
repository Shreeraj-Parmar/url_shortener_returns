import express from 'express'
import dotenv from 'dotenv'
import router from './routes/index.js'
import { Logger } from './middlewares/log.js'

dotenv.config()

const app = express()

export default app

const PORT = process.env.PORT || 8080

app.use(express.json())

// Common Middleware
app.use((req, res, next) => {
    Logger(req, res, next, {}, 'common')
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

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Url Shortener Server is running on port ${PORT}`)
    })
}
