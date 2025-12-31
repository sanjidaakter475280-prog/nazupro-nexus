
import React, { useState, useMemo, useEffect } from 'react';
import { BotStatus, Asset, Timeframe } from '../types';
import { BOT_KEYS } from '../constants';
import { apiService } from '../services/apiService';
import { socketService } from '../services/socketService';

interface BotCommandCenterProps {
  bot: BotStatus;
  availableAssets: Asset[];
  onToggleStatus: (id: string) => void | Promise<void>;
  onAssetChange: (id: string, symbol: string) => void | Promise<void>;
  onTimeframeChange: (id: string, timeframe: Timeframe) => void | Promise<void>;
  onUpdateBot: (id: string, updates: Partial<BotStatus>) => void | Promise<void>;
}

export const BotCommandCenter: React.FC<BotCommandCenterProps> = ({
  bot,
  availableAssets,
  onToggleStatus,
  onAssetChange,
  onTimeframeChange,
  onUpdateBot
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [canStartTrading, setCanStartTrading] = useState(false);
  const [filter, setFilter] = useState('');

  // ⚖️ Filter and Sort Assets (High to Low Payout)
  const processedAssets = useMemo(() => {
    return [...availableAssets]
      .filter(a => a.symbol.toLowerCase().includes(filter.toLowerCase()))
      .sort((a, b) => b.payout - a.payout);
  }, [availableAssets, filter]);

  // 🔧 NEW: Listen for bot initialization (like Telegram success message)
  useEffect(() => {
    socketService.onBotInitialized((data) => {
      setConnectionStatus('connected');
      setToastMessage("🤖 Bot Connected Successfully!");
      setTimeout(() => setToastMessage(null), 3000);
    });

    socketService.onCommandResponse((data) => {
      if (data.success) {
        setToastMessage(`✅ ${data.message}`);
      } else {
        setToastMessage(`❌ ${data.message}`);
      }
      setTimeout(() => setToastMessage(null), 3000);
    });

    socketService.onError((data) => {
      setToastMessage(`❌ Error: ${data.message || data.data?.message || 'Unknown error'}`);
      setTimeout(() => setToastMessage(null), 4000);
    });

    return () => {
      socketService.off('bot_initialized');
      socketService.off('command_response');
      socketService.off('error');
    };
  }, []);

  // 🔧 NEW: Check if trading can start (pair must be selected and bot linked)
  useEffect(() => {
    setCanStartTrading(!!bot.selected_pair && bot.isLinked);
  }, [bot.selected_pair, bot.isLinked]);

  // 🔧 NEW: Enhanced START BOT handler with validation
  const handleStartBot = async () => {
    if (bot.status === 'active') {
      setToastMessage("🛑 Stopping trading...");
      apiService.sendCommand(bot.id, 'stop_bot');
    } else {
      if (!bot.selected_pair) {
        setToastMessage("❌ Please select a pair first!");
        setTimeout(() => setToastMessage(null), 3000);
        return;
      }
      setToastMessage("🚀 Starting trading...");
      apiService.sendCommand(bot.id, 'start_bot', { pair: bot.selected_pair });
    }
  };

  const handleAssetClick = (symbol: string) => {
    // Instant selection change (UI Only)
    onAssetChange(bot.id, symbol);
  };

  const handleHistorySync = () => {
    if (!bot.selected_pair) {
      setToastMessage("❌ Select a pair first!");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    setToastMessage("Initiating Historical Data Fetch...");
    apiService.sendCommand(bot.id, 'fetch_historical_data', bot.selected_pair);

    setTimeout(() => {
      setToastMessage("Syncing Global Vars...");
      setTimeout(() => {
        setToastMessage("Training Neural Models...");
        setTimeout(() => setToastMessage(null), 2000);
      }, 1500);
    }, 1500);
  };

  const tradingModes: Array<'passive' | 'semi' | 'auto'> = ['passive', 'semi', 'auto'];

  return (
    <div className="space-y-8 relative max-w-md mx-auto animate-in fade-in zoom-in-95 duration-500">
      {toastMessage && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] animate-in zoom-in-95 duration-200 pointer-events-none">
          <div className="bg-slate-900/95 text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md flex items-center gap-3">
            <span className="animate-spin text-xl">⏳</span>
            <span className="font-bold text-[10px] uppercase tracking-wider">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Tactical Panel */}
      <div className="bg-[#0B1222] border border-white/5 rounded-[3rem] p-8 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] space-y-8">

        {/* Bot Identity Header */}
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-2xl"
            style={{ backgroundColor: bot.color, boxShadow: `0 15px 30px -5px ${bot.color}44` }}
          >
            {bot.id[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-black text-white uppercase tracking-tight leading-none">{bot.name}</h2>
              {bot.isLinked ? (
                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-[8px] font-black text-emerald-500 animate-pulse">
                  ✅ CONNECTED
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-md text-[8px] font-black text-amber-500">
                  ⏳ CONNECTING
                </span>
              )}
            </div>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">OPERATIONAL ID: {bot.id}-772</p>
          </div>
        </div>

        {/* 🚀 MASTER SYSTEM CONTROL (TOP PRIORITY) */}
        <div className="space-y-4">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 italic">Main System Link</p>
          <button
            onClick={handleStartBot}
            className={`w-full flex items-center justify-center gap-4 py-7 rounded-[2rem] text-[13px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-95 ${bot.status === 'active'
              ? 'bg-red-500 text-white shadow-red-500/40 hover:bg-red-600'
              : bot.selected_pair
                ? 'bg-[#10B981] text-white shadow-emerald-500/30 hover:bg-emerald-600'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed grayscale opacity-30'
              }`}
          >
            <span className="text-2xl">{bot.status === 'active' ? '🛑' : '🚀'}</span>
            <span>
              {bot.status === 'active'
                ? 'STOP TRADING'
                : bot.selected_pair
                  ? `START ${bot.selected_pair}`
                  : 'SELECT PAIR FIRST'}
            </span>
          </button>
        </div>

        {/* Section 2: Manual Execution */}
        <div className="space-y-4">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Manual Execution</p>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                if (!bot.selected_pair) {
                  setToastMessage("❌ Select a pair first!");
                  setTimeout(() => setToastMessage(null), 3000);
                  return;
                }
                setToastMessage("⚡ Sending CALL Command...");
                apiService.sendCommand(bot.id, 'manual_trade', { pair: bot.selected_pair, type: 'CALL' });
              }}
              className="group relative py-5 bg-[#10B981] hover:bg-[#059669] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_10px_30px_-5px_rgba(16,185,129,0.3)] active:scale-95 transition-all"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                CALL <span className="text-lg">▲</span>
              </span>
            </button>
            <button
              onClick={() => {
                if (!bot.selected_pair) {
                  setToastMessage("❌ Select a pair first!");
                  setTimeout(() => setToastMessage(null), 3000);
                  return;
                }
                setToastMessage("⚡ Sending PUT Command...");
                apiService.sendCommand(bot.id, 'manual_trade', { pair: bot.selected_pair, type: 'PUT' });
              }}
              className="group relative py-5 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_10px_30px_-5px_rgba(239,68,68,0.3)] active:scale-95 transition-all"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                PUT <span className="text-lg">▼</span>
              </span>
            </button>
          </div>
        </div>

        {/* Section 3: Accuracy Threshold */}
        <div className="bg-[#111827] p-6 rounded-[2rem] border border-white/5 space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Signal Accuracy Threshold</p>
            <span className="text-xs font-black text-blue-400 font-mono">{bot[BOT_KEYS.MIN_ACCURACY]}%</span>
          </div>
          <div className="relative flex items-center h-4">
            <input
              type="range"
              min="50"
              max="99"
              value={bot[BOT_KEYS.MIN_ACCURACY]}
              onChange={(e) => onUpdateBot(bot.id, { [BOT_KEYS.MIN_ACCURACY]: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 custom-slider"
            />
          </div>
        </div>

        {/* Section 4: Advanced Config */}
        <div className="space-y-4">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Risk Management</p>

          <div className="bg-[#111827] p-5 rounded-2xl border border-white/5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-200">Martingale</span>
              <span className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">Multiplier Strategy</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-[#0B1222] px-3 py-1.5 rounded-xl border border-white/10 text-white font-black font-mono text-sm">
                {bot[BOT_KEYS.MARTINGALE_STEPS]}
              </div>
              <button
                onClick={() => onUpdateBot(bot.id, { [BOT_KEYS.MARTINGALE_ENABLED]: !bot[BOT_KEYS.MARTINGALE_ENABLED] })}
                className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${bot[BOT_KEYS.MARTINGALE_ENABLED] ? 'bg-blue-500' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${bot[BOT_KEYS.MARTINGALE_ENABLED] ? 'left-5.5' : 'left-0.5'}`}></div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#111827] p-5 rounded-2xl border border-white/5 space-y-2 text-center">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Stop Loss</p>
              <p className="text-base font-black text-rose-500 font-mono">${bot.dailyStopLoss}</p>
            </div>
            <div className="bg-[#111827] p-5 rounded-2xl border border-white/5 space-y-2 text-center">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Take Profit</p>
              <p className="text-base font-black text-emerald-500 font-mono">${bot.dailyTakeProfit}</p>
            </div>
          </div>
        </div>

        {/* Section 5: Trading Mode Selector */}
        <div className="bg-[#111827] p-1.5 rounded-2xl border border-white/5 flex gap-1">
          {tradingModes.map((mode) => (
            <button
              key={mode}
              onClick={() => onUpdateBot(bot.id, { [BOT_KEYS.TRADING_MODE]: mode })}
              className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${bot[BOT_KEYS.TRADING_MODE] === mode
                ? 'bg-[#1E293B] text-white shadow-lg border border-white/10'
                : 'text-slate-500 hover:text-slate-300'
                }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Section 6: Logs & History Grid */}
        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 py-5 bg-[#1F2937] text-slate-300 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#374151] transition-all">
            📊 VIEW LOGS
          </button>
          <button
            onClick={handleHistorySync}
            className="flex items-center justify-center gap-2 py-5 bg-blue-600/10 text-blue-400 border border-blue-600/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600/20 transition-all"
          >
            🔄 HISTORICAL DATA
          </button>
        </div>
      </div>

      {/* Available Pairs Section */}
      <div className="bg-[#0B1222] rounded-[3rem] p-8 border border-white/5 space-y-6">
        <div className="text-center">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-1">AVAILABLE ASSETS</h3>
          <p className="text-[9px] text-slate-600 font-bold">Encrypted Nexus Live Stream</p>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Filter Assets..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-[#111827] border border-white/5 rounded-xl px-10 py-3 text-[10px] font-black uppercase tracking-widest text-slate-300 focus:outline-none focus:border-blue-500/30 transition-all placeholder:text-slate-700"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 text-[10px]">🔎</span>
        </div>

        <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto no-scrollbar pb-4">
          {processedAssets.length === 0 ? (
            <div className="col-span-2 py-10 text-center opacity-20">
              <p className="text-[9px] font-black uppercase tracking-widest">No Matches</p>
            </div>
          ) : (
            processedAssets.map((asset) => (
              <div
                key={asset.symbol}
                onClick={() => handleAssetClick(asset.symbol)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col items-center gap-1 group ${bot.selected_pair === asset.symbol ? 'bg-blue-600/10 border-blue-600/40' : 'bg-[#111827] border-white/5 hover:border-white/10'
                  }`}
              >
                <p className={`text-[10px] font-black transition-colors ${bot.selected_pair === asset.symbol ? 'text-blue-400' : 'text-slate-300 group-hover:text-white'}`}>{asset.symbol}</p>
                <p className="text-[9px] font-black text-emerald-500">{asset.payout}%</p>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        .custom-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: #3B82F6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </div>
  );
};
