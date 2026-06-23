import http from 'k6/http'

export const options = {
    vus: 10,
    duration: '30s',
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
}

export default function () {
    // Generate a completely random domain string for every request
    const randomDomain = Math.random().toString(36).substring(2, 12)
    const randomPath = Math.random().toString(36).substring(2, 8)

    const payload = JSON.stringify({
        url: `https://${randomDomain}.com/path/${randomPath}`,
    })

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    }

    http.post('https://urlshortenerreturns-production.up.railway.app/shorten', payload, params)
}
