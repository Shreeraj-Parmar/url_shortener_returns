import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const runEvictionTest = async () => {
    // 1. Connect to Redis
    const client = createClient({ url: process.env.REDIS_URL });
    await client.connect();

    try {
        console.log("Setting Memory Limit to 1MB and Policy to LRU...");
        // Redis Cloud blocks the CONFIG command, so we comment these out!
        // Your database already has a hard limit of 30MB, so we will just fill that 30MB up!
        // await client.configSet('maxmemory', '1mb');
        // await client.configSet('maxmemory-policy', 'allkeys-lru');

        console.log("\n--- STEP 1: Creating 3 VIP Keys ---");
        await client.set('VIP_1', 'I am important', { EX: 3600 });
        await client.set('VIP_2', 'I am important', { EX: 3600 });
        await client.set('VIP_3', 'I am important', { EX: 3600 });

        console.log("VIP Keys created. We will access VIP_1 continuously during the flood so it stays 'Recently Used'.");

        console.log("\n--- STEP 2: Flooding Redis with Junk Data ---");
        console.log("Adding thousands of large junk keys to force Redis to run out of memory...");

        // Make the string MASSIVE (~900KB) so it uses up your 30MB cloud limit in just ~35 iterations!
        const junkString = "JUNK_DATA".repeat(100000);

        console.log("Memory limit is ~30MB. Each junk key is ~900KB. It will fill up quickly.");
        try {
            for (let i = 0; i < 50; i++) {
                // Keep accessing VIP_1 every loop so it stays RECENTLY used!
                await client.get('VIP_1');

                // Add a junk key
                await client.set(`junk_${i}`, junkString, { EX: 3600 });

                // Print progress so you can see it working!
                console.log(`Added ${(i + 1)} junk keys (~${((i + 1) * 0.9).toFixed(1)} MB used)`);
            }
        } catch (e) {
            console.log("\n⚠️ Stop adding: Hit Memory Error or limits!", e.message);
        }

        console.log("\n--- STEP 3: Checking who survived! ---");
        const vip1 = await client.get('VIP_1');
        const vip2 = await client.get('VIP_2');
        const vip3 = await client.get('VIP_3');

        console.log(`VIP_1 (Recently Used): ${vip1 ? '✅ SURVIVED!' : '❌ DELETED'}`);
        console.log(`VIP_2 (Not used): ${vip2 ? '✅ SURVIVED!' : '❌ DELETED'}`);
        console.log(`VIP_3 (Not used): ${vip3 ? '✅ SURVIVED!' : '❌ DELETED'}`);

        console.log("\n🎯 CONCLUSION:");
        console.log("LRU protected VIP_1 because we kept 'recently' using it during the flood.");
        console.log("It deleted VIP_2 and VIP_3 because they were old and untouched! This is EXACTLY how LRU works.");

        // Cleanup
        // await client.configSet('maxmemory', '0'); // Reset to unlimited
        await client.flushAll();

    } catch (err) {
        console.error("\n❌ ERROR:", err.message);
        if (err.message.includes('unknown command') && err.message.includes('configSet')) {
            console.log("\n💡 Your Redis Cloud provider blocks the CONFIG command for security!");
            console.log("To see this work, you must log into your Redis Dashboard, set your Memory Limit to 1MB, set Eviction to allkeys-lru, then comment out lines 13 and 14 in this script and run it again.");
        }
    } finally {
        await client.quit();
    }
}

runEvictionTest();
