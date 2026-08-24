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
