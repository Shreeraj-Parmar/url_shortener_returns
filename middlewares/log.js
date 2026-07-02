import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const logDir = path.join(__dirname, '..', 'logs')

const commonRequest = (req, res, fileName) => {
    const data = {
        timestamp: new Date().toISOString(),
        ip: req.ip,
        method: req.method,
        url: req.url,
        userAgent: req.get('user-agent'),
    }
    const logString = JSON.stringify(data) + '\n'

    // Create logs folder if it doesn't exist
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir)
    }

    // Append to common.log (this automatically creates the file if it doesn't exist)
    fs.appendFile(path.join(logDir, fileName), logString, (err) => {
        if (err) console.error('Error writing to log file:', err)
    })

    return data
}

export const Logger = (req, res, next, data, type) => {
    let fileName = 'common.log'
    switch (type) {
        case 'common':
            fileName = 'common.log'
            data = commonRequest(req, res, fileName)
            break

        default:
            fileName = 'common.log'
            data = commonRequest(req, res, fileName)
            break
    }

    next()
}
