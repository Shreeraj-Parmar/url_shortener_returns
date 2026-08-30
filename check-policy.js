import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    const client = createClient({ url: process.env.REDIS_URL });
    await client.connect();
    try {
        const info = await client.info('memory');
        console.log(info);
    } catch(e) { console.error(e) }
    await client.quit();
}
run();
