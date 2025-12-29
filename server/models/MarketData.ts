import mongoose, { Schema, Document } from 'mongoose';

export interface IMarketData extends Document {
    doc_type: string;
    last_updated_by: string;
    updatedAt: Date;
    availableAssets: Array<{
        name: string;
        payout: number;
        asset_type: string;
        active: boolean;
    }>;
}

const MarketDataSchema: Schema = new Schema({
    doc_type: { type: String, required: true, unique: true },
    last_updated_by: { type: String },
    updatedAt: { type: Date, default: Date.now },
    availableAssets: [{
        name: { type: String, required: true },
        payout: { type: Number },
        asset_type: { type: String },
        active: { type: Boolean }
    }]
}, { collection: 'market_data' });

export default mongoose.model<IMarketData>('MarketData', MarketDataSchema);
