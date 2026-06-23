# URL Shortener API

- Uses **Node.js**
- Uses **PostgreSQL** database
- Uses **Express.js** framework for building the server
- Uses **dotenv** for environment variable imports

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

- `tests/redirect.test.js`

## 🚀 Running the Tests

To run the automated test suite and view the results, execute the following command in your terminal:

```bash
npm test
```

## 🏎️ Load Testing (k6)

For traffic and load testing, we use **k6**. The load test script simulates multiple virtual users to stress-test the URL shortening endpoint.

### 📂 Load Test Structure

- `shorten-test.js` (Located at the root folder)

### 🚀 Running Load Tests

Ensure you have **k6** installed on your machine. If not installed, you can install it using snap:

```bash
sudo snap install k6
```

To run the load test, use the following command:

```bash
k6 run shorten-test.js
```

### 📊 Scalability Comparison (Local Testing)

As we increase the number of concurrent virtual users (VUs) testing against a local Node.js server, we can track how the system scales:

| Concurrent Users (VUs) | P50 (Median) | P90       | P95      | P99       | Status          |
| :--------------------- | :----------- | :-------- | :------- | :-------- | :-------------- |
| **10 VUs**             | 5.74 ms      | 10.33 ms  | 12.63 ms | 19.16 ms  | ✅ 100% Success |
| **100 VUs**            | 54.31 ms     | 81.56 ms  | 97.1 ms  | 139.03 ms | ✅ 100% Success |
| **1,000 VUs**          | 634.09 ms    | 884.73 ms | 1.04 s   | 2.76 s    | ✅ 100% Success |
| **10,000 VUs**         | --           | --        | --       | --        | ❌ **TIMEOUT**  |

### 📊 Scalability Comparison (Railway + Neon Cloud)

As we increase the number of concurrent virtual users (VUs) hitting the live cloud deployment, we can track how the system scales over a 30s duration:

| Concurrent Users (VUs) | P50 (Median) | P90       | P95      | P99       | Status          |
| :--------------------- | :----------- | :-------- | :------- | :-------- | :-------------- |
| **10 VUs**             | 552.59 ms    | 824.68 ms | 996.45 ms| 1.84 s    | ✅ 100% Success |
| **100 VUs**            | 3.92 s       | 4.42 s    | 4.66 s   | 4.87 s    | ✅ 100% Success |
| **1,000 VUs**          | 38.45 s      | 40.34 s   | 40.53 s  | 40.66 s   | ✅ 100% Success |
| **10,000 VUs**         | --           | --        | --       | --        | ❌ **Local Error** |

### 🔍 Why is the Cloud test so much slower than Local?

It seems shocking that the local computer handled 1,000 users in ~600ms, while the cloud took 38 seconds. This comes down to two major bottlenecks:

1. **The "Network Hop" Problem (Geographic Distance)**
   * **Local Test (~5ms):** The k6 load tester and the Node.js server are running on the exact same laptop. The request instantly hits the server with 0 network delay, and the server quickly asks the Neon database for the info.
   * **Cloud Test (~550ms):** When you run k6 locally in India, your laptop sends a request across the ocean to a Railway server in the USA or Europe. That Railway server then sends a request to your Neon database in AWS. Finally, the response travels all the way back across the ocean to India. The speed of light and fiber optic cables dictate that this round trip will take at least 300-500ms for *every single request*.

2. **The CPU Problem (Node.js is Single Threaded)**
   * **Local Test:** Your local computer has multiple CPU cores. When running tests locally, database connections and raw execution speed are blisteringly fast because network latency is 0ms.
   * **Cloud Test:** Even if you upgrade your Railway plan to have **8 vCPUs and 8GB of RAM**, Node.js is fundamentally **single-threaded**. Unless you explicitly use the `cluster` module or a process manager like `PM2`, your app will only ever run on **1 single CPU core**, completely ignoring the other 7! Because all 1,000 requests are being crammed into a single thread, and Prisma restricts database connections to protect the DB from crashing, 99% of your requests are forced to wait in a massive queue for over 30 seconds before that single core can process them.

3. **Why did the 10,000 VU test fail?**
   The 10,000 VU test failed instantly with `dial tcp: cannot assign requested address`. This means **your local computer actually crashed the test, not the server**. Operating systems have a hard limit on how many outgoing network ports they can open simultaneously. When you asked k6 to open 10,000 concurrent network requests to a live IP address, your laptop's network driver ran out of open ports and blocked the requests!

---

## Prisma ORM

This project uses **Prisma** as the ORM for database operations. Since we use **Neon DB** (a serverless PostgreSQL provider), Prisma alone is not enough — it requires additional adapter libraries to connect.

### Why do we need extra libraries?

Prisma v7 uses a **client engine** that no longer accepts a direct `datasourceUrl` in the constructor. Instead, it requires either an `adapter` or an `accelerateUrl`. Since Neon is a serverless database, we use the Neon-specific adapter which communicates over WebSockets.

The following libraries are required:

| Package                    | Purpose                                                   |
| :------------------------- | :-------------------------------------------------------- |
| `prisma`                   | Prisma CLI for schema management and client generation    |
| `@prisma/client`           | The Prisma Client for querying the database               |
| `@prisma/adapter-neon`     | Adapter that connects Prisma to Neon DB                   |
| `@neondatabase/serverless` | Neon's serverless driver (used internally by the adapter) |

### Environment Variable

Make sure your `.env` file contains the `DATABASE_URL` variable:

```
DATABASE_URL="postgresql://<user>:<password>@<host>/<database>?sslmode=require"
```

### Generate Prisma Client

After cloning the project, run the following to generate the Prisma client:

```bash
npx prisma generate
```

### Test Prisma Connection

You can test the Prisma + Neon connection by running the test file:

```bash
node test.prisma.js
```

This file (`test.prisma.js`) fetches the first 10 records from the `url_shortener` table using Prisma and prints them to the console.


