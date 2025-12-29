import express from 'express';
import Candle from '../models/Candle';

const router = express.Router();

// POST /api/history/sync
// Bulk insert/update history
router.post('/sync', async (req, res) => {
    try {
        const { botId, pair, timeframe, candles } = req.body;

        if (!botId || !pair || !timeframe || !Array.isArray(candles)) {
            return res.status(400).json({ error: "Invalid data format" });
        }

        console.log(`📥 [HISTORY] Received ${candles.length} candles for ${botId}/${pair} (${timeframe})`);

        const operations = candles.map(candle => ({
            updateOne: {
                filter: { botId, pair, timeframe, time: candle.time },
                update: {
                    $set: {
                        botId,
                        pair,
                        timeframe,
                        time: candle.time,
                        open: candle.open,
                        high: candle.high,
                        low: candle.low,
                        close: candle.close,
                        volume: candle.volume || 1
                    }
                },
                upsert: true
            }
        }));

        if (operations.length > 0) {
            await Candle.bulkWrite(operations);
        }

        res.json({ success: true, message: `Synced ${candles.length} candles` });

    } catch (err) {
        console.error("❌ [HISTORY] Sync failed:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET /api/history/:pair/:timeframe
router.get('/:pair/:timeframe', async (req, res) => {
    try {
        const { pair, timeframe } = req.params;
        const botId = req.query.botId as string || 'alpha'; // Default to alpha if not specified
        const limit = parseInt(req.query.limit as string) || 1000;

        const candles = await Candle.find({ botId, pair, timeframe })
            .sort({ time: -1 }) // Newest first
            .limit(limit)
            .lean();

        // Return oldest first for charting
        res.json(candles.reverse());
    } catch (err) {
        res.status(500).json({ error: "Fetch failed" });
    }
});

export default router;
