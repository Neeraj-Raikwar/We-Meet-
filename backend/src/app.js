import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { createServer } from "node:http";

// 1. Load environment variables first
dotenv.config({ path: "./.env" });

import passport from "./controllers/passportConfig.js";
import { connectToSocket } from "./controllers/socketManager.js";
import meetingRoutes from "./routes/meetings.routes.js";
import userRoutes from "./routes/users.routes.js";

const app = express();
const server = createServer(app);

// Initialize Socket.io connection manager
const io = connectToSocket(server);

// App configuration
const PORT = process.env.PORT || 8000;
app.set("port", PORT);

// Global Middlewares
app.use(cors({
    origin: "*", // Production me isko frontend domain par restrict kar sakte hain
    credentials: true
}));
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));
app.use(passport.initialize());

// Primary API Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/meetings", meetingRoutes);

// Basic Health Check Route
app.get("/", (req, res) => {
    res.status(200).json({ status: "OK", message: "WeMeet Backend API Server is running smoothly!" });
});

// 2. Start Database & Express Server Lifecycle
const start = async () => {
    try {
        if (!process.env.MONGO_URL) {
            throw new Error("MONGO_URL environment variable is missing in .env file!");
        }

        const connectionDB = await mongoose.connect(process.env.MONGO_URL);

        console.log(`Database Connected Successfully!`);
        console.log(`MONGO Connected DB Host: ${connectionDB.connection.host}`);

        server.listen(PORT, () => {
            console.log(`🚀 WeMeet Backend Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error("DB Connection / Server Startup Error:", err);
        process.exit(1); // Exit process on failure
    }
};

start();
