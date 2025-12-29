import { BotStatus, TradingSignal } from '../types';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

const getHeaders = () => ({
    'Content-Type': 'application/json',
});

export const apiService = {
    getBots: async (): Promise<BotStatus[]> => {
        try {
            const res = await fetch(`${API_URL}/api/bots`, {
                headers: getHeaders()
            });
            return await res.json();
        } catch (err) {
            console.error("Failed to fetch bots", err);
            return [];
        }
    },

    syncInitialBots: async (bots: BotStatus[]) => {
        try {
            await fetch(`${API_URL}/api/bots/sync`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ bots })
            });
        } catch (err) {
            console.error("Failed to sync bots", err);
        }
    },

    updateBot: async (id: string, updates: Partial<BotStatus>) => {
        try {
            await fetch(`${API_URL}/api/bots/${id}`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(updates)
            });
        } catch (err) {
            console.error("Failed to update bot", err);
        }
    },

    getSignals: async (): Promise<TradingSignal[]> => {
        try {
            const res = await fetch(`${API_URL}/api/signals`, {
                headers: getHeaders()
            });
            return await res.json();
        } catch (err) {
            console.error("Failed to fetch signals", err);
            return [];
        }
    },

    saveSignal: async (signal: TradingSignal) => {
        try {
            await fetch(`${API_URL}/api/signals`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(signal)
            });
        } catch (err) {
            console.error("Failed to save signal", err);
        }
    },

    sendCommand: async (id: string, command: string, value?: any) => {
        try {
            await fetch(`${API_URL}/api/bots/${id}/command`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ command, value })
            });
        } catch (err) {
            console.error("Failed to send command", err);
        }
    },

    getMarketData: async (): Promise<import('../types').MarketAsset[]> => {
        try {
            const res = await fetch(`${API_URL}/api/market-data`, {
                headers: getHeaders()
            });
            return await res.json();
        } catch (err) {
            console.error("Failed to fetch market data", err);
            return [];
        }
    },

    getCandles: async (pair: string, timeframe: string): Promise<import('../types').SharedCandle[]> => {
        try {
            const res = await fetch(`${API_URL}/api/candles?pair=${pair}&timeframe=${timeframe}`, {
                headers: getHeaders()
            });
            return await res.json();
        } catch (err) {
            console.error("Failed to fetch candles", err);
            return [];
        }
    },

    loginBot: async (botId: string, username: string, accessKey: string, pocketEmail?: string, pocketPassword?: string): Promise<boolean> => {
        try {
            const res = await fetch(`${API_URL}/api/auth/pocket-login`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ botId, username, accessKey, pocketEmail, pocketPassword })
            });
            return res.ok;
        } catch (err) {
            console.error("Bot login failed", err);
            return false;
        }
    },

    logoutBot: async (botId: string): Promise<boolean> => {
        try {
            await fetch(`${API_URL}/api/auth/logout`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ botId })
            });
            return true;
        } catch (err) {
            console.error("Logout failed", err);
            return false;
        }
    }
};
