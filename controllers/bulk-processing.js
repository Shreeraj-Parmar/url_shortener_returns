import { prisma } from '../prismaClient.js'
import { generateShortUrl } from '../utils/generateUrl.js'


/**
 * Handle bulk processing of URLs
 * @param {*} req 
 * @param {*} res 
 * @returns [{success: true/false, originalUrl: "", expireDate: "", code: "", message: ""}]
 */
export const handleBulkProcessing = async (req, res) => {
    try {

        // Auth
        const apiKey = req.headers['x-api-key']

        if (!apiKey) {
            return res.status(401).json({ error: 'API key is required' })
        }

        const user = await prisma.users.findUnique({
            where: {
                api_key: apiKey,
            },
            select: {
                id: true,
            },
        })

        if (!user) {
            return res.status(401).json({ error: 'Invalid API key' })
        }

        const userId = user.id

        // Extract all bulk urls object
        // it looks like [{url:"", expireDate:"", code:""}, {url:"", expireDate:"", code:""}]
        const bulkUrls = req.body.bulkUrls


        // Validate bulk urls
        if (!bulkUrls || !Array.isArray(bulkUrls)) {
            return res.status(400).json({ error: 'Invalid bulk urls' })
        }

        // Validate each url

        let resultArr = []; // {success: true/false, originalUrl: "", expireDate: "", code: "", message: "", shortCode: ""}



        for (const url of bulkUrls) {

            // Validate Inputs (validate url,expireDate,code) here expireDate and code is optioanl
            if (!url.url) {
                resultArr.push({ success: false, originalUrl: url.url, code: url.code, message: 'URL is required' })
                continue;
            }

            // Code validation if exists
            if (url?.code === '') {
                resultArr.push({ success: false, originalUrl: url.url, code: url.code, message: 'You cannot use empty string as a short code, please try another one' })
                continue;
            }

            if (url?.code) {
                // must contain only alphanumeric characters and hyphens
                const codeRegex = /^[a-zA-Z0-9-]+$/
                if (!codeRegex.test(url.code)) {
                    resultArr.push({ success: false, originalUrl: url.url, code: url.code, message: 'Code must contain only alphanumeric characters and hyphens' })
                    continue;
                }

                // must not exist in db
                const existingCode = await prisma.url_shortener.findUnique({
                    where: {
                        short_code: url.code,
                    },
                })

                if (existingCode) {
                    resultArr.push({ success: false, originalUrl: url.url, code: url.code, message: 'You cannot use this short code, please try another one' })
                    continue;
                }
            }

            let expire_at = null

            if (url?.expireDate) {
                const date_res = new Date(url.expireDate)
                if (isNaN(date_res.getTime())) {
                    resultArr.push({ success: false, originalUrl: url.url, code: url?.code, message: 'Invalid date' })
                    continue;
                }

                // If past date then return error
                if (date_res < new Date()) {
                    resultArr.push({ success: false, originalUrl: url.url, code: url?.code, message: 'Please provide future date' })
                    continue;
                }

                expire_at = date_res
            }


            // Is valid url
            const urlRegex = /^(http|https):\/\/[^ "\s]+\.[^ "\s]+$/
            if (!urlRegex.test(url.url)) {
                resultArr.push({ success: false, originalUrl: url.url, code: url.code, message: 'Invalid URL' })
                continue;
            }



            // Generate short url if code is not provided
            let shortUrl = null
            if (url?.code) {
                shortUrl = url.code
            } else {
                shortUrl = generateShortUrl()
            }


            try {
                const prisma_res = await prisma.url_shortener.create({
                    data: {
                        original_url: url.url,
                        short_code: shortUrl,
                        user_id: userId,
                        expire_at: expire_at,
                    },
                })

                resultArr.push({ success: true, originalUrl: url.url, code: prisma_res.short_code, expireDate: prisma_res.expire_at, message: 'URL shortened successfully' })
            } catch (error) {
                console.error('Error shortening URL:', error)
                resultArr.push({ success: false, originalUrl: url.url, code: url.code, message: error?.message || 'Failed to shorten URL' })
            }

        }

        // If one of url is success then send status 200 else 400
        const success = resultArr.some((item) => item.success)
        if (success) {
            res.status(200).json({ resultArr })
        } else {
            res.status(400).json({ resultArr })
        }

    } catch (error) {
        console.error('Error shortening bulk URLs:', error)
        res.status(500).json({ error: 'Failed to shorten bulk URLs' })
    }
}
