import React, { useState, useMemo } from 'react';
import { TradingSignal, BotId } from '../../types';
import { apiService } from '../../services/apiService';

interface SignalFeedProps {
  signals: TradingSignal[];
  activeBotId: string | null;
}

export const SignalFeed: React.FC<SignalFeedProps> = ({ signals, activeBotId }) => {
  const [filter, setFilter] = useState('');

  // Apply Sorting (High to Low Accuracy) and Filtering
  const processedSignals = useMemo(() => {
    return [...signals]
      .filter(s => s.pair.toLowerCase().includes(filter.toLowerCase()))
      .sort((a, b) => (b.accuracy || 0) - (a.accuracy || 0));
  }, [signals, filter]);

  const handleManualExecute = (signal: TradingSignal) => {
    const targetBotId = activeBotId || signal.botId;
    apiService.sendCommand(targetBotId, 'manual_trade', {
      pair: signal.pair,
      type: signal.type === 'BUY' ? 'CALL' : 'PUT'
    });
  };

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-[2.5rem] p-6 flex flex-col h-full min-h-[400px] border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden relative">
      <div className="flex items-center justify-between mb-2 px-2 z-20">
        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">HFT Signal Stream</h2>
        <div className="flex gap-1 items-center">
          <span className="text-[8px] font-bold text-slate-400 mr-2 uppercase tracking-widest">{processedSignals.length} Active</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></span>
          <span className="text-[9px] font-bold text-emerald-500">LIVE</span>
        </div>
      </div>

      {/* 🔍 Search Filter */}
      <div className="px-2 mb-6 relative">
        <input
          type="text"
          placeholder="FILTER ASSETS..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-xl px-4 py-2 text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 focus:outline-none focus:border-blue-500/30 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
        />
        <span className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 text-[10px]">🔎</span>
      </div>

      <div className="overflow-y-auto pr-2 space-y-3 flex-1 no-scrollbar scroll-smooth">
        {processedSignals.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
            <span className="text-4xl mb-4 grayscale">📡</span>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-center px-8 leading-relaxed">
              {filter ? 'NO MATCHES FOUND' : 'Synthesizing Global Markets...'}
            </p>
          </div>
        ) : (
          processedSignals.map((signal) => (
            <div
              key={signal.id}
              className="group flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-100 dark:border-white/5 hover:border-blue-500/20 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all animate-in slide-in-from-bottom duration-500 relative overflow-hidden"
            >
              {/* Decorative accent for high accuracy signals */}
              {(signal.accuracy || 0) > 90 && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 blur-2xl pointer-events-none"></div>
              )}

              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black text-[9px] border transition-all ${signal.type === 'BUY'
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                  }`}>
                  <span className="text-sm shadow-sm">{signal.type === 'BUY' ? '▲' : '▼'}</span>
                  <span className="tracking-tighter uppercase">{signal.type === 'BUY' ? 'CALL' : 'PUT'}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 dark:text-white text-xs block leading-none tracking-tight">{signal.pair}</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-white/10 text-[7px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                      {signal.timeframe || '1m'}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono font-bold mt-1.5 block">
                    {new Date(signal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="text-right flex items-center gap-4">
                <div className="text-xs font-mono font-black text-slate-900 dark:text-white flex flex-col gap-0.5">
                  <span className="text-[8px] opacity-40 uppercase tracking-widest font-black mb-1 text-right">ACCURACY</span>
                  <span className={`text-[11px] ${(signal.accuracy || 0) >= 90 ? 'text-blue-500' : 'text-slate-900 dark:text-white'}`}>
                    {(signal.accuracy || 0).toFixed(1)}%
                  </span>
                </div>

                {/* 🔧 NEW: Interactive Manual Trade Button */}
                <button
                  onClick={() => handleManualExecute(signal)}
                  className={`px-3 py-2 rounded-xl font-black text-[8px] uppercase tracking-widest transition-all ${signal.type === 'BUY'
                      ? 'bg-emerald-500 text-white shadow-[0_5px_15px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95'
                      : 'bg-rose-500 text-white shadow-[0_5px_15px_rgba(244,63,94,0.3)] hover:scale-105 active:scale-95'
                    }`}
                >
                  {signal.type === 'BUY' ? 'CALL' : 'PUT'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white dark:from-[#0F172A] to-transparent z-10 pointer-events-none"></div>
    </div>
  );
};
