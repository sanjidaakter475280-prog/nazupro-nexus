import mongoose, { Schema, Document } from 'mongoose';

export interface IBot extends Document {
    id: string; // Custom ID like 'Alpha'
    name: string;
    status: 'active' | 'inactive';
    isLinked: boolean;
    pnl: number;
    accuracy: number;
    color: string;
    strategy: string;
    assignedAssetSymbol: string;
    selectedTimeframe: string;
    investment: number;
    tradeAmount: number;
    expiry: number;
    payout: number;
    martingaleEnabled: boolean;
    martingaleSteps: number;
    minAccuracy: number;
    dailyStopLoss: number;
    dailyTakeProfit: number;
    tradingMode: 'passive' | 'semi' | 'auto';
    pairStatus: 'active' | 'paused';
    selected_pair: string;
}

const BotSchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    status: { type: String, default: 'inactive' },
    isLinked: { type: Boolean, default: false },
    pnl: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    color: { type: String },
    strategy: { type: String },
    assignedAssetSymbol: { type: String },
    selectedTimeframe: { type: String },
    investment: { type: Number },
    tradeAmount: { type: Number },
    expiry: { type: Number },
    payout: { type: Number },
    martingaleEnabled: { type: Boolean },
    martingaleSteps: { type: Number },
    minAccuracy: { type: Number },
    dailyStopLoss: { type: Number },
    dailyTakeProfit: { type: Number },
    tradingMode: { type: String },
    pairStatus: { type: String },
    selected_pair: { type: String, default: null }
}, { timestamps: true });

export default mongoose.model<IBot>('Bot', BotSchema);
