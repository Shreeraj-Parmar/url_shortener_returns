import express from "express";
import dotenv from "dotenv";
import router from "./routes/index.js";

dotenv.config();

const app = express();

export default app;

const PORT = process.env.PORT || 8080;

app.use(express.json());

app.use(router);

if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => {
        console.log(`Url Shortener Server is running on port ${PORT}`);
    });
}