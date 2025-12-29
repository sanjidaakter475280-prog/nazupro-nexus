import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import path from 'path';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || "*",
        methods: ["GET", "POST"]
    }
});

// Attach io to app for use in routes
app.set('io', io);

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());

// Serve Static Frontend Files (For Docker/Production)
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// API Routes
import apiRouter from './routes/api';
import authRouter from './routes/auth';

app.use('/api', apiRouter);
app.use('/api/auth', authRouter);

import historyRouter from './routes/history';
app.use('/api/history', historyRouter);

// Basic Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Catch-all route to serve the frontend for any non-API routes
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

// Initialization Logs (For User Visibility)
console.log("\n🚀 [SYSTEM] Initializing Nazupro Nexus Backend...");

// 1. Website (Socket.io) Connection Initialization
io.on('connection', (socket) => {
    console.log(`📡 [SOCKET] Node connected: ${socket.id}`);

    // Handle bot status updates from Python bot
    socket.on('bot_status', async (status) => {
        try {
            const Bot = mongoose.model('Bot');
            const { bot_id, running, balance, selected_pair, trading_mode, amount, timeframe } = status;

            await Bot.findOneAndUpdate(
                { id: bot_id },
                {
                    $set: {
                        isLinked: true,
                        status: running ? 'active' : 'inactive',
                        assignedAssetSymbol: selected_pair,
                        selectedTimeframe: timeframe,
                        tradeAmount: amount,
                        tradingMode: trading_mode,
                        // Update other fields as needed
                    }
                },
                { upsert: true }
            );
            // console.log(`📋 [DB] Updated status for bot: ${bot_id}`);
        } catch (err) {
            console.error("❌ [DB] Failed to update bot status:", err);
        }
    });

    socket.on('disconnect', () => {
        console.log(`🔌 [SOCKET] Node disconnected: ${socket.id}`);
    });
});

console.log("📡 [SOCKET] Real-time signal system ready.");

// 2. Database (MongoDB Atlas) Connection
if (!MONGODB_URI) {
    console.warn("⚠️ [DATABASE] MONGODB_URI is not defined. Database features will be limited.");
} else {
    console.log("🔗 [DATABASE] Attempting connection to MongoDB Atlas...");
    mongoose.connect(MONGODB_URI)
        .then(() => {
            console.log("✅ [DATABASE] Connected to MongoDB Atlas successfully!");
        })
        .catch((err) => {
            console.error("❌ [DATABASE] MongoDB connection error:", err);
        });
}

// Start Server
server.listen(PORT, () => {
    console.log(`🌍 [SERVER] Express server running on port: ${PORT}`);
    console.log("✅ [SYSTEM] Full system initialization complete.\n");
});
