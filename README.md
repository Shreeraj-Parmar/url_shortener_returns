# URL Shortener API

* Uses **Node.js**
* Uses **PostgreSQL** database
* Uses **Express.js** framework for building the server
* Uses **dotenv** for environment variable imports

## Database Connection

The application connects to PostgreSQL using the following environment variables:

1. `DB_USER`
2. `DB_HOST`
3. `DB_NAME`
4. `DB_PASS`
5. `DB_PORT`

You can check the `db.js` file for the database connection configuration.

## Database Table

Make sure you have created a PostgreSQL table with the following columns:

1. `id`
2. `original_url`
3. `short_code`
4. `created_at`
5. `updated_at`
6. `visit_count`

**Important:** The code uses the table name `url_shortener`. Please use this exact table name; otherwise, the application will not work correctly.

## Run the Project

1. `npm install`
2. `npm run dev`



# Testing Guide

This project uses **Jest** as the primary testing framework, combined with **Supertest** to handle and simulate HTTP requests (API calls).

## 📂 Test Structure

The main test suite, which focuses on testing redirects, is located here:
* `tests/redirect.test.js`

## 🚀 Running the Tests

To run the automated test suite and view the results, execute the following command in your terminal:

```bash
npm test
```

## 🏎️ Load Testing (k6)

For traffic and load testing, we use **k6**. The load test script simulates multiple virtual users to stress-test the URL shortening endpoint.

### 📂 Load Test Structure
* `shorten-test.js` (Located at the root folder)

### 🚀 Running Load Tests
Ensure you have **k6** installed on your machine. If not installed, you can install it using snap:

```bash
sudo snap install k6
```

To run the load test, use the following command:
### 📊 Scalability Comparison

As we increase the number of concurrent virtual users (VUs), we can track how the system scales:

| Concurrent Users (VUs) | P50 (Median) | P90 | P95 | P99 | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **10 VUs** | 5.74 ms | 10.33 ms | 12.63 ms | 19.16 ms | ✅ 100% Success |
| **100 VUs** | 54.31 ms | 81.56 ms | 97.1 ms | 139.03 ms | ✅ 100% Success |
| **1,000 VUs** | 634.09 ms | 884.73 ms | 1.04 s | 2.76 s | ✅ 100% Success |
| **10,000 VUs** | -- | -- | -- | -- | ❌ **TIMEOUT** |

### 🔍 Key Takeaways
1. **Linear Scaling**: Latency increases roughly 10x for every 10x increase in users. This suggests the database connection pool or the single-threaded nature of Node.js is the primary bottleneck.
2. **10k Failure**: The `10,000 VU` test failed due to `dial: i/o timeout`. This is caused by hitting the Operating System's limit for open sockets and the database's limit for concurrent queries. To handle this load, we would need horizontal scaling (multiple server instances) and a connection pooler like PgBouncer.

---