import { dbClient } from "../db.js";

const generateShortUrl = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let shortUrl = "";
    for (let i = 0; i < 6; i++) {
        shortUrl += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return shortUrl;
};

export const shortenUrl = async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: "URL is required" });
    }

    const shortUrl = generateShortUrl();

    console.log(shortUrl);

    try {
        const result = await dbClient.query("INSERT INTO url_shortener (original_url, short_code) VALUES ($1, $2)", [url, shortUrl]);
        res.json({ short_code: shortUrl });
    } catch (error) {
        console.error("Error shortening URL:", error);
        res.status(500).json({ error: "Failed to shorten URL" });
    }
};

export const redirectUrl = async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).json({ error: "Code is required" });
    }

    try {
        const result = await dbClient.query("SELECT original_url FROM url_shortener WHERE short_code = $1", [code]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "URL not found" });
        }
        res.redirect(result.rows[0].original_url);
    } catch (error) {
        console.error("Error redirecting URL:", error);
        res.status(500).json({ error: "Failed to redirect URL" });
    }
};
