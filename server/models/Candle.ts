import mongoose, { Schema, Document } from 'mongoose';

export interface ICandleData {
    time: string; // ISO String or Timestamp
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
}

export interface ICandle extends Document {
    botId: string;
    pair: string;
    timeframe: string;
    lastUpdated: Date;
    data: ICandleData[];
}

const CandleSchema: Schema = new Schema({
    botId: { type: String, required: true },
    pair: { type: String, required: true },
    timeframe: { type: String, required: true }, // e.g., '1min'
    lastUpdated: { type: Date, default: Date.now },
    data: [{
        time: { type: Schema.Types.Mixed, required: true },
        open: { type: Number, required: true },
        high: { type: Number, required: true },
        low: { type: Number, required: true },
        close: { type: Number, required: true },
        volume: { type: Number, default: 0 }
    }]
}, { collection: 'candles', timestamps: true });

// Compound index for unique bucket per pair+timeframe
CandleSchema.index({ pair: 1, timeframe: 1 }, { unique: true });

export default mongoose.model<ICandle>('Candle', CandleSchema);
