# 🏎️ k6 Load Testing Guide

This document provides a comprehensive guide on how to run performance and load tests for the URL Shortener API using **[k6](https://k6.io/)**.

---

## 📋 Table of Contents
- [What is k6?](#what-is-k6)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [k6 Command Flags](#k6-command-flags)
- [Easy Examples](#easy-examples)
- [Understanding the Test Script (`shorten-test.js`)](#understanding-the-test-script-shorten-testjs)
- [Understanding the k6 Output Metrics](#understanding-the-k6-output-metrics)

---

## ❓ What is k6?

`k6` is an open-source developer-centric load testing tool built in Go and scriptable in JavaScript. It helps measure API response times, throughput, and system limits under synthetic user traffic.

---

## 🛠️ Installation

### Linux (Ubuntu/Debian via Snap)
```bash
sudo snap install k6
```

### Linux (via Apt)
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### macOS (Homebrew)
```bash
brew install k6
```

### Windows (winget or Chocolatey)
```bash
winget install k6
# or
choco install k6
```

---

## 🚀 Quick Start

To run the default load test script (`shorten-test.js`) located at the root of the project:

```bash
k6 run shorten-test.js
```

---

## 🚩 k6 Command Flags

Command flags allow you to override settings defined inside the script without modifying the code.

| Flag | Short | Description | Example |
| :--- | :--- | :--- | :--- |
| `--vus <number>` | `-u` | Sets the number of concurrent Virtual Users (VUs). | `k6 run --vus 50 shorten-test.js` |
| `--duration <time>` | `-d` | Sets test duration (e.g. `10s`, `1m`, `5m`). | `k6 run --duration 1m shorten-test.js` |
| `--iterations <number>` | `-i` | Total number of request iterations across all VUs. | `k6 run --iterations 100 shorten-test.js` |
| `--http-debug` | N/A | Prints full HTTP request and response details. | `k6 run --http-debug shorten-test.js` |
| `--out json=<file>` | N/A | Saves raw test results to a JSON file. | `k6 run --out json=results.json shorten-test.js` |
| `--env KEY=VAL` | `-e` | Passes custom environment variables into the script. | `k6 run -e TARGET_URL=http://localhost:3000/shorten shorten-test.js` |

---

## 💡 Easy Examples

### 1. Simple Smoke / Sanity Test (1 User, 1 Iteration)
Test if the script runs once without any errors:
```bash
k6 run --vus 1 --iterations 1 shorten-test.js
```

### 2. Quick 10-Second Test with 5 Users
Run a short load test with 5 virtual users for 10 seconds:
```bash
k6 run --vus 5 --duration 10s shorten-test.js
```

### 3. High Concurrency Load Test (100 Users for 1 Minute)
Simulate heavy traffic with 100 concurrent users:
```bash
k6 run --vus 100 --duration 1m shorten-test.js
```

### 4. Debugging API Requests
Print full headers and payloads to inspect requests/responses:
```bash
k6 run --vus 1 --iterations 1 --http-debug shorten-test.js
```

### 5. Export Test Metrics to JSON
Save detailed metric logs for reports or analysis:
```bash
k6 run --vus 20 --duration 30s --out json=test-summary.json shorten-test.js
```

---

## 📜 Understanding the Test Script (`shorten-test.js`)

Here is how the test script is configured:

```javascript
import http from 'k6/http'

// Test options configuration
export const options = {
    vus: 10,                 // 10 concurrent Virtual Users
    duration: '30s',          // Run test for 30 seconds
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
}

export default function () {
    // Generate a unique random domain for each request
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
```

---

## 📊 Understanding the k6 Output Metrics

When a k6 test completes, a terminal summary is generated:

```text
  execution: local
     script: shorten-test.js
     output: -

  scenarios: (100.00%) 1 scenario, 10 vus, 30s max duration

     http_req_duration..............: avg=5.74ms min=2.1ms med=4.2ms max=19.1ms p(90)=10.3ms p(95)=12.6ms p(99)=19.1ms
     http_req_failed................: 0.00% ✓ 0 ✗ 1250
     http_reqs......................: 1250 41.66/s
     vus............................: 10 min=10 max=10
```

### Key Metric Descriptions:

- **`http_req_duration`**: Time taken for HTTP requests to complete.
  - `avg`: Average response time.
  - `med` (p50): Median response time (50% of requests were faster than this).
  - `p(90)` / `p(95)` / `p(99)`: 90%, 95%, and 99% of requests completed within this time.
- **`http_req_failed`**: Percentage of failed requests (e.g. status code 4xx/5xx or timeouts).
- **`http_reqs`**: Total HTTP requests completed and average requests per second (RPS).
- **`vus`**: Active virtual users during the run.
