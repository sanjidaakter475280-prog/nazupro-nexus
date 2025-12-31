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
        const { command, value }: { command: string, value: any } = req.body;
        const io = req.app.get('io');

        if (!io) {
            return res.status(500).json({ error: 'Socket.io not available' });
        }

        // Fetch the bot for context, ensures it exists.
        const bot = await Bot.findOne({ id });
        if (!bot) {
            return res.status(404).json({ error: 'Bot not found' });
        }

        let payloadForPython = value;

        // --- Command-Specific Logic ---

        if (command === 'start_bot') {
            // Determine the pair to use: command > db.
            const pair = value?.pair || bot.selected_pair;
            
            if (!pair) {
                console.error(`[ERROR] Start command for bot ${id} failed: No pair selected.`);
                return res.status(400).json({ success: false, message: 'No pair has been selected for this bot.' });
            }

            // Update DB
            bot.status = 'active';
            bot.selected_pair = pair;
            await bot.save();
            
            // Set the payload for python, ensuring it has the correct pair.
            payloadForPython = { ...(typeof value === 'object' ? value : {}), pair: pair };

        } else if (command === 'stop_bot') {
            // Update DB
            bot.status = 'inactive';
            await bot.save();
            // No change to payload needed for python.

        } else if (command === 'fetch_historical_data') {
            const pair = value; // In this command, value is the pair string itself
            if (!pair || typeof pair !== 'string') {
                 return res.status(400).json({ error: 'Invalid pair provided for history fetch.' });
            }
            // Update DB with the new pair for consistency
            bot.selected_pair = pair;
            await bot.save();
            // No change to payload needed, python bot receives the pair string.

        } else if (command === 'manual_trade') {
            if (!value?.pair) {
                 return res.status(400).json({ error: 'No pair provided for manual trade.' });
            }
            // No DB state change needed, just forward the command.
        }

        // --- Emit Command to Python Bot ---
        io.emit('bot_command', {
            bot_id: id,
            cmd: command,
            val: payloadForPython
        });

        console.log(`📡 [SOCKET] Command sent to ${id}: ${command} with value:`, payloadForPython);
        res.json({ success: true, message: `Command '${command}' sent` });

    } catch (err) {
        const error = err as Error;
        console.error(`[ERROR] Failed to process command for bot ${req.params.id}:`, error.message);
        res.status(500).json({ error: 'Failed to process command', details: error.message });
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
