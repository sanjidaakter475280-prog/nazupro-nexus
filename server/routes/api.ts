import express from 'express';
import Bot from '../models/Bot';
import Signal from '../models/Signal';
import MarketData from '../models/MarketData';
import Candle from '../models/Candle';

const router = express.Router();

// --- BOTS ---

// GET /api/bots - Get all bots
router.get('/bots', async (req, res) => {
    try {
        const bots = await Bot.find({});
        res.json(bots);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch bots' });
    }
});

// GET /api/market-data - Get available assets
router.get('/market-data', async (req, res) => {
    try {
        const marketData = await MarketData.findOne({ doc_type: 'platform_state' });
        res.json(marketData ? marketData.availableAssets : []);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch market data' });
    }
});

// GET /api/candles - Get candles for a specific pair
router.get('/candles', async (req, res) => {
    try {
        const { pair, timeframe } = req.query;
        if (!pair || !timeframe) return res.status(400).json({ error: 'Missing pair or timeframe' });

        const candleData = await Candle.findOne({
            pair: String(pair),
            timeframe: String(timeframe)
        });

        // Return just the data array for the chart
        res.json(candleData ? candleData.data : []);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch candles' });
    }
});

// POST /api/bots/sync - Sync initial bots (Create if not exist)
router.post('/bots/sync', async (req, res) => {
    try {
        const { bots } = req.body;
        if (!bots || !Array.isArray(bots)) return res.status(400).json({ error: 'Invalid bots data' });

        const count = await Bot.countDocuments();
        if (count === 0) {
            await Bot.insertMany(bots);
            console.log(`✅ [DB] Synced ${bots.length} initial bots.`);
        }
        res.json({ success: true, message: 'Sync complete' });
    } catch (err) {
        res.status(500).json({ error: 'Sync failed' });
    }
});

// POST /api/bots/:id - Update a bot
router.post('/bots/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const bot = await Bot.findOneAndUpdate({ id }, { $set: updates }, { new: true });
        if (!bot) return res.status(404).json({ error: 'Bot not found' });

        res.json(bot);
    } catch (err) {
        res.status(500).json({ error: 'Update failed' });
    }
});

// POST /api/bots/:id/command - Send a command to the bot
router.post('/bots/:id/command', async (req, res) => {
    try {
        const { id } = req.params;
        const { command, value } = req.body;

        const io = req.app.get('io');
        if (io) {
            io.emit('bot_command', {
                bot_id: id,
                cmd: command,
                val: value
            });
            console.log(`📡 [SOCKET] Command sent to ${id}: ${command}`);
            res.json({ success: true, message: `Command ${command} sent` });
        } else {
            res.status(500).json({ error: 'Socket.io not available' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to send command' });
    }
});

// --- SIGNALS ---

// GET /api/signals - Get recent signals
router.get('/signals', async (req, res) => {
    try {
        const signals = await Signal.find({}).sort({ timestamp: -1 }).limit(50);
        res.json(signals);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch signals' });
    }
});

// POST /api/signals - Save a new signal
router.post('/signals', async (req, res) => {
    try {
        const signal = req.body;
        // Upsert to avoid duplicates if ID exists
        await Signal.findOneAndUpdate(
            { id: signal.id },
            signal,
            { upsert: true, new: true }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save signal' });
    }
});

export default router;
