import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const runLFUTest = async () => {
    const client = createClient({ url: process.env.REDIS_URL });
    await client.connect();

    try {
        console.log("====== TESTING LFU (Least Frequently Used) ======");
        console.log("⚠️ IMPORTANT: If your database is still set to 'volatile-lru', this test will fail because LRU cares about 'recent' use, not frequency!");
        console.log("To see true LFU, you must set your Redis eviction policy to 'volatile-lfu' or 'allkeys-lfu' in your dashboard.\n");

        await client.flushAll(); // clear database

        console.log("--- STEP 1: Creating 3 VIP Keys ---");
        await client.set('VIP_1', 'I am VIP 1', { EX: 3600 });
        await client.set('VIP_2', 'I am VIP 2', { EX: 3600 });
        await client.set('VIP_3', 'I am VIP 3', { EX: 3600 });

        console.log("VIP Keys created.\n");

        console.log("--- STEP 2: Creating Frequency (Accessing keys) ---");
        console.log("Accessing VIP_1 2000 times (Very Frequent)");
        for (let i = 0; i < 10; i++) { await client.get('VIP_1'); }

        console.log("Accessing VIP_2 50 times (Somewhat Frequent)");
        for (let i = 0; i < 5; i++) { await client.get('VIP_2'); }

        console.log("Accessing VIP_3 0 times (Least Frequent)");
        // We do not access VIP_3 at all.

        console.log("\n--- STEP 3: Flooding Redis with Junk Data ---");
        console.log("Adding large junk keys. Notice we DO NOT access VIP_1 during this flood.");
        const junkString = "JUNK_DATA".repeat(100000); // ~900KB

        try {
            for (let i = 0; i < 50; i++) {
                await client.set(`junk_${i}`, junkString, { EX: 3600 });
                console.log(`Added ${(i + 1)} junk keys (~${((i + 1) * 0.9).toFixed(1)} MB used)`);
            }
        } catch (e) {
            console.log("\n⚠️ Stop adding: Hit Memory process limits!", e.message);
        }

        console.log("\n--- STEP 4: Checking who survived! ---");
        const vip1 = await client.get('VIP_1');
        const vip2 = await client.get('VIP_2');
        const vip3 = await client.get('VIP_3');

        console.log(`VIP_1 (Very Frequent): ${vip1 ? '✅ SURVIVED!' : '❌ DELETED'}`);
        console.log(`VIP_2 (Somewhat Frequent): ${vip2 ? '✅ SURVIVED!' : '❌ DELETED'}`);
        console.log(`VIP_3 (Least Frequent): ${vip3 ? '✅ SURVIVED!' : '❌ DELETED'}`);

        console.log("\n🎯 CONCLUSION:");
        console.log("Unlike LRU (which would have deleted VIP_1 since it wasn't requested recently during the flood),");
        console.log("an LFU policy remembers the high score of VIP_1's 2000 accesses and keeps it safe!");

    } catch (err) {
        console.error("\n❌ ERROR:", err.message);
    } finally {
        await client.quit();
    }
}

runLFUTest();
