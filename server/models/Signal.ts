import mongoose, { Schema, Document } from 'mongoose';

export interface ISignal extends Document {
    id: string;
    botId: string;
    type: 'BUY' | 'SELL' | 'CALL' | 'PUT';
    pair: string;
    price: number;
    timestamp: number;
    confidence?: number;
    result?: 'WIN' | 'LOSS' | 'PENDING';
}

const SignalSchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    botId: { type: String, required: true },
    type: { type: String, required: true },
    pair: { type: String, required: true },
    price: { type: Number, required: true },
    timestamp: { type: Number, required: true },
    confidence: { type: Number },
    result: { type: String, default: 'PENDING' }
}, { timestamps: true });

export default mongoose.model<ISignal>('Signal', SignalSchema);
