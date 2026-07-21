import { check } from 'k6'
import http from 'k6/http'
import { Rate } from 'k6/metrics'

// Custom metric to track Cache Hit Ratio in k6 summary
export const cacheHitRatio = new Rate('cache_hit_ratio')

export const options = {
    vus: 1,           // 1 Virtual User
    iterations: 100,  // Exactly 100 total API calls
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)'],
}

// Hardcoded configuration
const BASE_URL = 'http://localhost:8080'
const WITH_CACHE = true // Change to false to test WITHOUT CACHE

export default function () {
    // If WITH_CACHE = true: use same code 'lwRVZlit' every time -> 1 DB call + 99 Cache Hits
    // If WITH_CACHE = false: generate unique random code every time -> 100 DB calls (0 Hits)
    const shortCode = WITH_CACHE 
        ? 'iT7CFin6' 
        : `random_${Math.random().toString(36).substring(2, 10)}`

    const url = `${BASE_URL}/redirect?code=${shortCode}`

    const res = http.get(url, { redirects: 0 })

    // Track hit vs miss ratio
    if (WITH_CACHE) {
        cacheHitRatio.add(__ITER > 0) // Iteration 0 = Miss (DB query), Iterations 1..99 = Cache Hit
    } else {
        cacheHitRatio.add(false)      // Unique code each time = 100% Miss
    }
}
