import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const runFIFOTest = async () => {
    const client = createClient({ url: process.env.REDIS_URL });
    await client.connect();

    try {
        console.log("====== TESTING FIFO (First-In, First-Out) ======");
        console.log("💡 IMPORTANT FACT: Redis DOES NOT have a built-in 'FIFO' memory eviction policy when memory gets full! (It only has LRU, LFU, Random, and TTL).");
        console.log("To achieve FIFO in Redis, developers use a 'Redis List' (an array). You push items to the right, and pop them off the left.\n");

        await client.flushAll(); // clear database

        console.log("--- STEP 1: Pushing Data to our FIFO Queue ---");
        console.log("We are adding Customer 1, then Customer 2, then Customer 3 in that exact order.");

        // RPUSH pushes to the right end (tail) of the list
        await client.rPush('my_fifo_queue', 'Customer_1 (Oldest)');
        await client.rPush('my_fifo_queue', 'Customer_2');
        await client.rPush('my_fifo_queue', 'Customer_3 (Newest)');

        // Let's see what the queue looks like
        const queueList = await client.lRange('my_fifo_queue', 0, -1);
        console.log("\nCurrent Queue Lineup (Left to Right):", queueList);

        console.log("\n--- STEP 2: Processing (Evicting) Data ---");

        // LPOP pops from the left end (head) of the list
        let handledUser1 = await client.lPop('my_fifo_queue');
        console.log(`Served and Removed: ${handledUser1}`);

        let handledUser2 = await client.lPop('my_fifo_queue');
        console.log(`Served and Removed: ${handledUser2}`);

        console.log("\n--- STEP 3: Checking what is left! ---");
        const remainingQueue = await client.lRange('my_fifo_queue', 0, -1);
        console.log("Remaining in Queue:", remainingQueue);

        console.log("\n🎯 CONCLUSION:");
        console.log("Because it's a FIRST-IN-FIRST-OUT system, Customer 1 was the first to arrive (Oldest), so they were the first to get processed and 'evicted' from the queue!");

    } catch (err) {
        console.error("\n❌ ERROR:", err.message);
    } finally {
        await client.quit();
    }
}

runFIFOTest();
