# Redis: The Basics

## What is Redis?
Redis stands for **RE**mote **DI**ctionary **S**erver.
It is an incredibly fast, open-source, **in-memory** key-value data store. 
Unlike traditional databases (like PostgreSQL or MySQL) that save data on a slow hard drive, Redis saves everything in the computer's RAM (Memory). This makes reading and writing data almost instantaneous.

Because it runs as its own completely separate server process, **it survives when your Node.js application restarts.** If your Express app crashes and restarts, Redis is still running safely in the background holding all your cached data! This perfectly answers your Question 5!

## A Brief History (Who made it and why?)
Redis was created in 2009 by an Italian developer named **Salvatore Sanfilippo** (often known online by his nickname, **antirez**).

![alt text](image.png)

At the time, Salvatore was trying to build a real-time web analytics startup called **LLOOGG**. The tool showed a live feed of visitors on a website. 
He was using a traditional MySQL database, but MySQL was too slow to handle the constant, high-speed read/write operations required for real-time analytics. 

Frustrated by the limitations of traditional databases for this specific problem, Salvatore decided to write his own solution from scratch in the `C` programming language. He wanted a database that acted like a simple dictionary (Key-Value) but lived entirely in RAM for maximum speed. 

He open-sourced Redis in 2009, and it quickly exploded in popularity. Today, it is used by almost every major tech company in the world (Twitter, GitHub, Snapchat, Pinterest) as their primary caching layer.

## Fascinating Redis History & Drama

### The "Data Structure Server"
While Redis started as a simple Key-Value store (like a JavaScript object), Salvatore quickly realized it could be much more. He added complex data types like Lists, Sets, Hashes, and Sorted Sets. Because you could perform operations directly on these structures (like pushing to a list or intersecting sets) entirely in memory, it earned a new nickname: **The Data Structure Server**.

### The Benevolent Dictator Steps Down
For over 11 years, Salvatore maintained extreme control over the project, ensuring the codebase remained small, clean, and blazingly fast. However, maintaining software for the entire planet is exhausting. In June 2020, he famously stepped down as the "Benevolent Dictator for Life" (BDFL) of Redis, stating that he was tired of being a software maintainer and just wanted to go back to being an artist who writes code for fun.

### The 2024 Licensing Earthquake (The Birth of Valkey)
Redis was famous for having a very permissive open-source license (BSD). However, massive cloud companies (like Amazon AWS) were making billions of dollars by offering "Managed Redis" services, without giving much back to the creators.

In March 2024, the company behind Redis (Redis Ltd.) got fed up and changed the license. Redis was **no longer truly open-source**. 

This caused an absolute earthquake in the tech community. In response, a coalition of the biggest tech giants (AWS, Google, Oracle, Ericsson) joined the Linux Foundation and created a completely free, open-source clone of Redis called **Valkey**. Microsoft also released their own hyper-fast clone called **Garnet**. 

### Valkey (The True Heir)
Valkey is a direct fork of Redis 7.2.4 (the last truly free version). It is governed by the Linux Foundation, meaning no single corporation can ever hijack the license again. Best of all, it is a **drop-in replacement**. You do not have to change a single line of your Node.js code to use Valkey; it behaves exactly like Redis.

### Garnet (Microsoft's Speed Demon)
Garnet was built completely from scratch by Microsoft Research using C# / .NET. While Redis is famously single-threaded, Garnet was designed from the ground up to be **multi-threaded**. This allows it to take full advantage of modern servers with dozens of CPU cores, making it insanely fast for heavy workloads. Like Valkey, Microsoft made Garnet understand the exact same network commands as Redis, so it also acts as a drop-in replacement!

While Redis is still king today, the war for the future of caching has just begun. But don't worry: because Valkey and Garnet both speak the "Redis language," learning Redis today means you automatically know how to use all three!

---

## 4 Critical Facts Every Developer Must Know About Redis

### 1. The Single-Threaded Trap (`KEYS *` is evil)
Like Node.js, Redis (and Valkey) processes commands using a **single-threaded event loop**. This means it only executes one command at a time. While this makes it extremely fast (no thread-locking overhead), it introduces a massive danger: **If you run a slow command, you freeze the entire server.**
*   **The Golden Rule:** Never run the `KEYS *` command in production! It scans the entire database looking for matching keys. While it is doing this, *every other user on your website* is blocked from reading or writing to the cache! Use `SCAN` instead.

### 2. It's "In-Memory" but it still saves to Disk! (Persistence)
A common misconception is that because Redis runs in RAM, a power outage means all your data is permanently lost. This is mostly false! Redis has two built-in ways to save your data to a physical hard drive:
*   **RDB (Redis Database):** It takes a "snapshot" of your memory every few minutes and saves it as a file on your hard drive. 
*   **AOF (Append-Only File):** Every time you write data, Redis logs that exact command to a text file. If the server crashes, Redis just reads the text file from top to bottom to rebuild the memory exactly how it was!

### 3. What happens when the RAM gets full? (Eviction)
RAM is very expensive. If your server only has 2GB of RAM, and you try to shove 3GB of data into Redis, what happens? **It doesn't crash!** 
Redis has intelligent **Eviction Policies**. You can tell Redis: *"When you get full, start deleting the data that hasn't been requested in a long time."* This is called **LRU (Least Recently Used)**. Redis will automatically take out the trash so the cache never overflows.

### 4. It's not just a database, it's a Chat Room (Pub/Sub)
Redis has a feature called **Publish/Subscribe**. It allows your Node.js server to "broadcast" a message, and other servers can instantly "listen" and react to it. Because it lives in RAM, it is insanely fast. This is the secret weapon developers use to build real-time chat applications or multiplayer web games!

---

## Getting Started: Redis in Node.js

Because Redis is a completely separate server, using it in Node.js requires two things:
1. **Running a Redis Server** (The actual database).
2. **A Node.js Client** (An NPM package to talk to the database).

### 1. The Core Redis Commands
Redis stores everything as a **Key-Value** pair. Imagine it like a giant JavaScript object, but you interact with it using specific commands.

Here are the 4 commands you will use 99% of the time:
* **`SET key value`**: Saves data. *(e.g., `SET url:xyz https://google.com`)*
* **`GET key`**: Retrieves data. *(e.g., `GET url:xyz` returns `https://google.com`)*
* **`DEL key`**: Deletes data. *(e.g., `DEL url:xyz`)*
* **`EXPIRE key seconds`**: Tells Redis to automatically delete the data after X seconds. This is perfect for caching because you don't want old data sitting in RAM forever.

### 2. Implementation in Node.js
To talk to Redis from Node.js, install the official package:
`npm install redis`

Because your Node app has to send a message across the network to the Redis server and wait for the reply, **every Redis command is asynchronous (`async/await`)**.

```javascript
import { createClient } from 'redis';

// 1. Create and connect the client to the Redis server
const redisClient = createClient(); // By default, it connects to localhost:6379

redisClient.on('error', (err) => console.log('Redis Client Error', err));

await redisClient.connect();

// 2. Setting data
await redisClient.set('my_short_code_xyz', 'https://google.com');

// Pro-tip: Set data AND give it an expiration time (EX = seconds) in one line!
await redisClient.set('my_short_code_xyz', 'https://google.com', {
    EX: 3600 // Automatically deletes from cache after 1 hour (3600 seconds)
});

// 3. Getting data
const cachedUrl = await redisClient.get('my_short_code_xyz');
console.log(cachedUrl); // Outputs: "https://google.com" or null if it doesn't exist
```

### 3. Production Connections (Passwords & Hosts)
Using `createClient()` with no arguments only connects to an unprotected `localhost` server. When you deploy your app to a real server (like AWS or Render), your Redis database will be hosted remotely and protected by a password. 

There are two main ways to connect to a production server:

#### Technique A: The Connection String (Recommended)
This puts all the connection details into one single string (a Redis URL). This is the cleanest method because you can store the entire string in your `.env` file!

**Format:** `redis://[username]:[password]@[host]:[port]`

```javascript
// Using a hardcoded string (Not recommended for security)
const redisClient = createClient({
    url: 'redis://default:mySuperSecretPassword123@redis-12345.cloud.redislabs.com:12345'
});

// Using an Environment Variable (Best Practice)
const redisClient = createClient({
    url: process.env.REDIS_URL
});
```
*(Note: If your server uses a secure TLS connection, the URL will start with `rediss://` instead of `redis://`)*

#### Technique B: The Configuration Object
If your hosting provider gives you the host, port, and password separately, you can pass them as an object. This is useful if you want fine-grained control over connection settings (like retries).

```javascript
const redisClient = createClient({
    password: 'mySuperSecretPassword123',
    socket: {
        host: 'redis-12345.cloud.redislabs.com',
        port: 12345,
        tls: true // Use this if your provider requires a secure TLS connection
    }
});
```

---

## The Hardest Problem in Computer Science: Cache Invalidation

*"There are 2 hard problems in computer science: cache invalidation, naming things, and off-by-1 errors."*

### The Problem: Stale Data
Imagine you are studying for a test. You read a heavy **textbook** (your Postgres Database). Because the textbook takes a long time to read, you write down the most important notes on a quick **cheat sheet** (your Redis Cache).

Now, imagine the teacher updates the textbook, but you forget to update your cheat sheet. The next time you take a test, you look at your cheat sheet and give the wrong answer! This is called **"Stale Data"**.

When data changes in your database (e.g., a user edits a password or deletes a URL), the cache is still holding the *old* data. If you don't do anything, users will get the old, stale data from Redis.

### The 2 Solutions
To fix this, you must **invalidate** or update the cache whenever you update the database. There are two primary ways to do this:

#### Way 1: Update Both (The Proactive Way)
When you edit a row in your database, immediately take the new data and push it into Redis using `redisClient.set()`.
* **Pros:** The next time someone visits, the cache is already warm and ready!
* **Cons:** It requires writing slightly more code, and you might update the cache for an item that no one ever visits again (wasting memory).

#### Way 2: Delete it from the Cache (The Lazy/Best Way)
When you edit or delete data in your database, simply delete the key from Redis using `redisClient.del()`. 
* **Why this is awesome:** The next time someone requests that data, your app will check Redis and find nothing. Because it finds nothing, it will be forced to ask Postgres for the fresh data, and then it will automatically save that fresh data back into Redis! It fixes itself on the fly.

---

## Negative Caching & Cache Penetration

### The Danger: Cache Penetration Attacks
Imagine a hacker (or a malicious bot) wants to crash your Postgres database. 
They realize that if they request a valid, popular short code (like `bQ5Cn2Dk`), your fast Redis cache handles it, and Postgres is completely safe.

So, instead, the bot writes a script to request 10,000 completely random, fake short codes every second:
* `GET /redirect?code=fake123`
* `GET /redirect?code=apple99`
* `GET /redirect?code=zxcvbnm`

If you **do not** cache the fact that these codes don't exist, here is what happens:
1. The request hits Redis. Redis says "I don't have `fake123`." (This is a Cache Miss)
2. The request is sent to Postgres. Postgres searches the entire database and says "I don't have it either."
3. You return a 404 to the user.

Because the bot is sending 10,000 of these requests per second, **every single request bypasses Redis and hits your Postgres database directly.** Your Postgres database will overload, run out of connections, and crash almost instantly! This vulnerability is called **Cache Penetration**.

### The Solution: Negative Caching
To protect your database, you must use a technique called **Negative Caching**. 

If Postgres searches the database and finds nothing, you should immediately save that "nothingness" into Redis!
```javascript
// Saving a negative result into Redis with a short 5-minute expiration
await redisClient.set('fake123', 'NOT_FOUND', { EX: 300 });
```

Now, when the bot requests `fake123` again a millisecond later, Redis will intercept the request. It will see the `NOT_FOUND` flag, remember that Postgres already said it doesn't exist, and return a 404 immediately. 

Postgres never even knows the follow-up requests happened, and your database effortlessly survives the attack!

---

## Rate Limiting using Redis

### What is Rate Limiting?
Rate limiting controls how many HTTP requests a client can make to your server within a given timeframe (e.g., maximum 100 requests per minute). It protects your server from being overwhelmed by spam, DDoS attacks, or runaway client scripts.

### Why use Redis for Rate Limiting?
Because Redis operates in-memory with near-instantaneous `INCR` operations and built-in key expirations (`EXPIRE`), it can track and throttle thousands of requests per second without adding database overhead.

### How it Works (Fixed Window Pattern):
1. **Identify the Client**: Extract the client's IP address from `req.headers['x-forwarded-for']` or `req.ip`.
2. **Increment Counter**: Run `INCR ratelimit:<IP>`.
3. **Set Expiration**: If `currentCount === 1` (the first request in the window), set a TTL expiration (e.g., 60 seconds) using `EXPIRE ratelimit:<IP> 60`.
4. **Throttle**: If `currentCount > MAX_REQUESTS`, reject the request with HTTP status `429 Too Many Requests`.

### Express Middleware Example:
```javascript
import redisClient from '../redis/config.js';

const REDIS_KEY_PREFIX = 'ratelimit:';
const MAX_REQUESTS = 100;
const WINDOW_SECONDS = 60; // 1 minute window

export const rateLimiter = async (req, res, next) => {
    try {
        const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
        const redisKey = `${REDIS_KEY_PREFIX}${ip}`;

        // 1. Increment request count for this IP
        const currentCount = await redisClient.incr(redisKey);

        // 2. Set expiry window on the first request
        if (currentCount === 1) {
            await redisClient.expire(redisKey, WINDOW_SECONDS);
        }

        // 3. Throttle if request count exceeds max allowed limit
        if (currentCount > MAX_REQUESTS) {
            return res.status(429).json({
                error: 'Too Many Requests. Please try again later.',
            });
        }

        next();
    } catch (error) {
        console.error('Rate limiting error:', error);
        // Fail-open: allow request to proceed if Redis has an issue
        next();
    }
};
```

### [Bonus] Rate-Limit Headers
When you rate-limit a client, it is a professional best-practice to send standard HTTP headers in your response indicating their limits. This acts as a "scoreboard" so the client application knows exactly how many requests they can make before getting hit with a `429 Too Many Requests` error.

Here is what these headers look like:
```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 100         # Max allowance per window.
X-RateLimit-Remaining: 5       # Requests left in this window.
X-RateLimit-Reset: 1678900000  # Unix timestamp for when the window resets.
```

To add this in Express, you simply modify your middleware to calculate the remaining requests and the reset time, and use `res.setHeader()` to attach them to every response!

---

### Advanced: The Sliding Window Pattern
The fixed window pattern (shown above) has a flaw: if your limit is 100 requests per minute, a user could make 100 requests at 1:00:59, and another 100 requests at 1:01:00. They just made 200 requests in 2 seconds!

To fix this, we use the **Sliding Window** pattern using Redis Sorted Sets (`zset`). 

#### The "Coffee Receipt" Analogy
Imagine your rule is **"I can only buy 2 coffees every 10 minutes."** 
To track this, you keep a metal spike on your desk. Every time you buy a coffee, you take the paper receipt, write the exact time on it, and stab it onto the spike. When you want a new coffee:

1. **`zRemRangeByScore` (The Trash Can):** You look at your spike and pull off any receipts older than 10 minutes. You throw them in the trash.
2. **`zAdd` (The Pen):** You write a brand new receipt for the coffee you want right now with the current time, and you stab it onto the top of the spike.
3. **`zCard` (The Counting Finger):** You count how many receipts are left on the spike. If there are 3, you broke the rule and cannot drink the coffee!

*Note: When we `zAdd`, we save the exact timestamp as the "score" (so Redis keeps them in order), and a string combining the timestamp + a random number as the "value" (so Redis knows every click is unique).*

#### Express Middleware Example (Sliding Window):
```javascript
import redisClient from '../redis/config.js';

export const slidingWindowRateLimiter = ({ maxRequests, windowSeconds }) => {
    return async (req, res, next) => {
        try {
            const identifier = req.ip || 'unknown';
            const key = `ratelimit:sliding:${identifier}`;

            const now = Date.now();
            const windowStart = now - (windowSeconds * 1000);

            // Open a pipeline to send all commands at once for maximum speed
            const multi = redisClient.multi();

            // 1. (The Trash Can) Remove timestamps older than our allowed window
            multi.zRemRangeByScore(key, 0, windowStart);

            // 2. (The Pen) Add the current timestamp to the stack
            const uniqueMember = `${now}-${Math.random()}`;
            multi.zAdd(key, [{ score: now, value: uniqueMember }]);

            // 3. (The Finger) Count how many timestamps are left
            multi.zCard(key);

            // 4. Set an expiration so the list auto-deletes if they leave
            multi.expire(key, windowSeconds + 1);

            // Run the pipeline!
            const results = await multi.exec();
            
            // The result of zCard (counting) is the 3rd command (index 2)
            const requestCount = results[2];

            if (requestCount > maxRequests) {
                return res.status(429).json({ error: 'Too Many Requests' });
            }

            next();
        } catch (error) {
            console.error('Sliding Window Rate Limiter Error:', error);
            next();
        }
    };
};
```

#### Pros and Cons of Sliding Window

**Pros:**
* **Perfectly Accurate:** It completely fixes the "Boundary Flaw" of the Fixed Window. It is impossible to cheat the limit by spamming requests exactly when the minute rolls over.
* **Smooths Traffic:** It prevents sudden huge bursts of traffic from overwhelming your server because the window is constantly sliding millisecond by millisecond.

**Cons:**
* **High Memory (RAM) Usage:** Because you must store a unique string and timestamp for *every single request* a user makes, it uses vastly more RAM. (If your limit is 10,000 requests per minute, you must store 10,000 strings per user!)
* **Higher CPU Usage:** Redis has to do more work on every request (scanning the list, removing old items, adding new ones, and counting) compared to just incrementing a simple number (`INCR`).

---

### Advanced: The Token Bucket Pattern (The Industry Standard)
This is the most popular rate-limiting algorithm in the world (used by giants like Amazon AWS and Stripe). It is famous because it is incredibly memory-efficient and allows for "bursts" of traffic.

#### The "Candy Crush Hearts" Analogy
Think about a mobile game like **Candy Crush**.
1. You have a maximum of **5 Hearts** at the top of your screen.
2. Every time you want to play a level (make a request), it costs you **1 Heart**.
3. If you have **0 Hearts**, the game blocks you and says "Please wait!" You cannot play.
4. The game slowly gives you **1 free Heart every 30 minutes** (the refill rate) until you are back up to the maximum of 5.

If a user doesn't visit your website for a whole day, their bucket fills up to the maximum. When they finally return, they can click around and make 5 requests incredibly fast (a "burst")! But once they spend those 5 hearts, they are forced to slow down to your refill rate. 

#### Express Middleware Example (Token Bucket):
```javascript
import redisClient from '../redis/config.js';

export const tokenBucketRateLimiter = ({ maxTokens, refillRatePerSecond }) => {
    return async (req, res, next) => {
        try {
            const identifier = req.ip || 'unknown';
            const key = `ratelimit:token:${identifier}`;
            const now = Date.now();

            // Fetch the user's bucket from Redis (using hGetAll for a Hash)
            const bucket = await redisClient.hGetAll(key);

            let tokens;
            let lastRefill;

            if (Object.keys(bucket).length === 0) {
                // First visit! Give them a full bucket.
                tokens = maxTokens; 
                lastRefill = now;
            } else {
                // Return visit. Read their saved stats.
                tokens = parseFloat(bucket.tokens);
                lastRefill = parseInt(bucket.lastRefill);

                // Calculate how much time passed, and give them their earned free tokens
                const secondsPassed = (now - lastRefill) / 1000;
                const earnedTokens = secondsPassed * refillRatePerSecond;

                // Add the earned tokens, but NEVER go over the max limit
                tokens = Math.min(maxTokens, tokens + earnedTokens);
                lastRefill = now;
            }

            // Do they have at least 1 token to spend?
            if (tokens >= 1) {
                tokens -= 1; // Spend 1 token
                
                // Save the new token count and timestamp back to Redis
                const multi = redisClient.multi();
                multi.hSet(key, { 
                    tokens: tokens.toString(), 
                    lastRefill: lastRefill.toString() 
                });
                multi.expire(key, 120); 
                await multi.exec();
                
                next(); // Allow them in!
            } else {
                // Blocked! Out of tokens.
                await redisClient.hSet(key, { 
                    tokens: tokens.toString(), 
                    lastRefill: lastRefill.toString() 
                });
                
                return res.status(429).json({ error: 'Too Many Requests' });
            }
        } catch (error) {
            console.error('Token Bucket Error:', error);
            next(); // Fail open
        }
    };
};
```

#### Pros and Cons of Token Bucket

**Pros:**
* **Allows Bursts:** It allows users to make a quick burst of legitimate requests if they haven't used the API recently, creating a smoother user experience.
* **Extremely Memory Efficient:** Unlike the Sliding Window which stores every single timestamp, the Token Bucket only stores **two** tiny numbers (the remaining tokens and the last refill time) per user. It uses almost zero RAM.

**Cons:**
* **Tricky to Tune:** You have to carefully balance two different parameters: the Bucket Capacity (burst size) and the Refill Rate. If the bucket is too large, hackers can still overwhelm your server with a massive burst before running out of tokens.
* **Race Conditions:** In a true massive-scale production environment, if a user sends 5 requests at the exact same millisecond, the Node.js math above can have a "Race Condition" and accidentally allow all 5 through before it saves the new total to Redis. (To fix this in production, developers write a small "Lua Script" that runs the math directly inside the Redis server).

---

### Advanced: The Leaky Bucket Pattern
If the Token Bucket is a bucket full of rewards (hearts), the Leaky Bucket is a bucket full of water. It is the exact opposite. It absolutely forbids "bursts" of traffic and forces a steady, constant stream.

#### The "Funnel" Analogy
Imagine a literal plastic bucket, but someone drilled a tiny hole in the bottom. 
1. **Pouring water in:** When users visit your website, they pour a drop of water into the top of the bucket.
2. **Leaking water out:** The hole in the bottom drips water out at a **perfectly constant, steady rate** (e.g., exactly 1 drop per second). This represents your server processing the requests.
3. **The Overflow:** If users pour water in faster than it drips out, the water level starts to rise. If the bucket fills all the way to the top, and someone tries to pour more water in, it splashes on the floor. (The user is Blocked with "Too Many Requests").

#### Express Middleware Example (Leaky Bucket):
```javascript
import redisClient from '../redis/config.js';

export const leakyBucketRateLimiter = ({ capacity, leakRatePerSecond }) => {
    return async (req, res, next) => {
        try {
            const identifier = req.ip || 'unknown';
            const key = `ratelimit:leaky:${identifier}`;
            const now = Date.now();

            const bucket = await redisClient.hGetAll(key);

            let water = 0;
            let lastLeak = now;

            if (Object.keys(bucket).length !== 0) {
                water = parseFloat(bucket.water);
                lastLeak = parseInt(bucket.lastLeak);

                // Calculate how much water leaked out of the hole while they waited
                const secondsPassed = (now - lastLeak) / 1000;
                const leakedWater = secondsPassed * leakRatePerSecond;

                // Water can't go below 0 (an empty bucket is just empty)
                water = Math.max(0, water - leakedWater);
                lastLeak = now;
            }

            // Can the bucket hold 1 more drop of water?
            if (water < capacity) {
                water += 1; // Pour their request into the bucket
                
                const multi = redisClient.multi();
                multi.hSet(key, { water: water.toString(), lastLeak: lastLeak.toString() });
                multi.expire(key, 120); 
                await multi.exec();
                
                next(); // Allowed!
            } else {
                // Blocked! Bucket Overflowed.
                await redisClient.hSet(key, { water: water.toString(), lastLeak: lastLeak.toString() });
                return res.status(429).json({ error: 'Bucket Overflowed!' });
            }
        } catch (error) {
            next(); // Fail open
        }
    };
};
```

#### Pros and Cons of Leaky Bucket

**Pros:**
* **Perfectly Smooth Traffic:** It guarantees a strict, absolutely constant output rate. This is fantastic for protecting incredibly fragile old servers that will crash if they receive 10 requests at once. It forces traffic into a single-file line.

**Cons:**
* **No Bursts Allowed:** It is very punishing to normal users. If the bucket is currently full, and a completely new, valid user tries to visit the site, they will be blocked simply because the bucket hasn't drained yet. 
* **Same Race Conditions:** Just like Token Bucket, doing the math in Node.js instead of a Lua Script inside Redis can lead to race conditions under heavy concurrent load.

---

## Eviction Policies (What happens when Redis runs out of memory?)

When your Redis server is full, it has to decide which data to delete to make room for new data. This is called an **Eviction Policy**.

### The "T-Shirt Closet" Analogy
Imagine a closet that can only hold exactly 3 T-shirts.
You own 4 shirts: a **Google** shirt, an **Apple** shirt, an **Amazon** shirt, and a **Netflix** shirt.
Because the closet only holds 3 shirts, whenever you buy a new one, you must throw one in the trash. *How do you decide which one to throw away?*

### 1. The LRU Way (Least *Recently* Used)
**Rule:** "Throw away the shirt I haven't worn in the longest amount of time." (It only cares about the DATE).

* For an entire year, you wear the **Google** shirt every single day. (You've worn it 365 times! It's your favorite!).
* This weekend, you decide to wear the **Apple** shirt on Friday, the **Amazon** shirt on Saturday, and the **Netflix** shirt on Sunday. Your closet is now full. 
* On Monday, you buy a new shirt. **LRU looks at the dates.** It sees you haven't worn the Google shirt since Thursday. Because the Google shirt is the "oldest" one you wore, **LRU throws your favorite Google shirt in the trash!**

*The flaw:* Just because you didn't wear it this weekend, LRU deleted your favorite shirt.

### 2. The LFU Way (Least *Frequently* Used)
**Rule:** "Throw away the shirt I have worn the fewest number of times." (It only cares about the COUNTER).

* It tracks a scoreboard:
  * Google Shirt = 365 wears
  * Apple Shirt = 1 wear
  * Amazon Shirt = 1 wear
  * Netflix Shirt = 1 wear
* On Monday, you buy a new shirt. Your closet is full.
* **LFU looks at the scoreboard.** It sees the Google shirt has 365 wears. It says, *"Wow, you love this shirt, I will never throw this away!"* Instead, it throws away the Apple shirt because it only has a score of 1.

### Which is best for a URL Shortener?
* **Best Choice: LFU (Least Frequently Used)**
* The **Google shirt** is a viral YouTube link that has been clicked 1,000,000 times.
* The **Apple shirt** is a random link someone created to test your app, clicked exactly 1 time today.

If you use **LRU**, and a bot clicks random test links today, Redis will delete your viral YouTube link from the cache just because no one clicked it in the last 24 hours!

If you use **LFU**, Redis tracks that the YouTube link has 1,000,000 clicks. It will protect that link forever, and it will quickly delete all the random 1-click test links instead.
