
export type BotId = 'Alpha' | 'Beta' | 'Gamma' | 'Delta' | 'Epsilon';

export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1D';

export type AppView =
  | 'dashboard'
  | 'bots'
  | 'trading'
  | 'control'
  | 'settings'
  | 'wallet'
  | 'assets'
  | 'portfolio'
  | 'signals'
  | 'dca'
  | 'grid'
  | 'terminal'
  | 'marketplace'
  | 'orders'
  | 'subscription';

export interface Asset {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  payout: number;
  marketType: 'Forex' | 'OTC' | 'Crypto';
  bestTimeframe: Timeframe;
}

export interface TradingSignal {
  id: string;
  botId: BotId;
  type: 'BUY' | 'SELL';
  pair: string;
  price: number;
  timeframe: string;
  accuracy: number;
  timestamp: number;
}

export interface BotStatus {
  id: BotId;
  name: string;
  status: 'active' | 'inactive';
  isLinked: boolean; // Track if the neural link is established
  pnl: number;
  accuracy: number;
  color: string;
  strategy: string;
  selected_pair: string;
  selectedTimeframe: Timeframe;
  investment: number;
  amount: number;
  expiration: number;
  payout: number;

  // Advanced Config
  martingaleEnabled: boolean;
  martingaleSteps: number;
  minAccuracy: number;
  dailyStopLoss: number;
  dailyTakeProfit: number;
  trading_mode: 'passive' | 'semi' | 'auto';
  pairStatus: 'active' | 'paused';
}

export interface PricePoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface MarketInsight {
  summary: string;
  prediction: string;
  recommendations: string[];
}

export interface MarketAsset {
  name: string;
  payout: number;
  asset_type: string;
  active: boolean;
}

export interface SharedCandle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}
