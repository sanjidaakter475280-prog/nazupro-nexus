
import React, { useState } from 'react';
import { BotStatus, BotId, Timeframe } from '../../types';

interface SignalTacticalViewProps {
  bot: BotStatus;
  onToggleStatus: (id: string) => void;
  onUpdateBot: (id: string, updates: Partial<BotStatus>) => void;
}

export const SignalTacticalView: React.FC<SignalTacticalViewProps> = ({ 
  bot, 
  onToggleStatus, 
  onUpdateBot 
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleHistorySync = () => {
    setToastMessage("Updating Global Vars & Config.json...");
    setTimeout(() => {
        setToastMessage("Fetching Historical Data...");
        setTimeout(() => {
            setToastMessage("Data Synchronization Complete");
            setTimeout(() => setToastMessage(null), 1000);
        }, 1500);
    }, 1500);
  };

  return (
    <div className="max-w-md mx-auto animate-in fade-in zoom-in-95 duration-500 relative">
      {/* Custom Toast Notification */}
      {toastMessage && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] animate-in zoom-in-95 duration-200 pointer-events-none">
           <div className="bg-slate-900/95 text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md flex items-center gap-3">
              <span className="animate-spin text-xl">⏳</span>
              <span className="font-bold text-xs uppercase tracking-wider">{toastMessage}</span>
           </div>
        </div>
      )}

      {/* Tactical Panel Container */}
      <div className="bg-[#0B1222] border border-white/5 rounded-[3rem] p-8 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] space-y-8">
        
        {/* Header Section */}
        <div className="flex items-center gap-4">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-2xl"
            style={{ backgroundColor: bot.color, boxShadow: `0 15px 30px -5px ${bot.color}44` }}
          >
            {bot.id[0]}
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-none mb-1">{bot.name}</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">OPERATIONAL ID: {bot.id}-772</p>
          </div>
        </div>

        {/* Manual Execution Section */}
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Manual Execution</p>
          <div className="grid grid-cols-2 gap-4">
            <button className="group relative py-6 bg-[#10B981] hover:bg-[#059669] text-white rounded-[1.8rem] font-black text-sm uppercase tracking-widest shadow-[0_10px_30px_-5px_rgba(16,185,129,0.4)] active:scale-95 transition-all">
              <span className="relative z-10 flex items-center justify-center gap-2">
                CALL <span className="text-lg">▲</span>
              </span>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.8rem]"></div>
            </button>
            <button className="group relative py-6 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-[1.8rem] font-black text-sm uppercase tracking-widest shadow-[0_10px_30px_-5px_rgba(239,68,68,0.4)] active:scale-95 transition-all">
              <span className="relative z-10 flex items-center justify-center gap-2">
                PUT <span className="text-lg">▼</span>
              </span>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.8rem]"></div>
            </button>
          </div>
        </div>

        {/* Accuracy Slider */}
        <div className="bg-[#111827] p-6 rounded-[2rem] border border-white/5 space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signal Accuracy Threshold</p>
            <span className="text-sm font-black text-blue-400 font-mono">{bot.minAccuracy}%</span>
          </div>
          <div className="relative flex items-center h-4">
             <input 
                type="range" 
                min="50" 
                max="99" 
                value={bot.minAccuracy}
                onChange={(e) => onUpdateBot(bot.id, { minAccuracy: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 custom-slider"
             />
          </div>
        </div>

        {/* Advanced Config Section */}
        <div className="space-y-6">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Advanced Config</p>
          
          <div className="bg-[#111827] p-6 rounded-[2rem] border border-white/5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-200">Martingale Setup</span>
              <span className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">Multiplier Recovery</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-[#0B1222] px-4 py-2 rounded-xl border border-white/10 text-white font-black font-mono text-sm">
                {bot.martingaleSteps}
              </div>
              <button 
                onClick={() => onUpdateBot(bot.id, { martingaleEnabled: !bot.martingaleEnabled })}
                className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${bot.martingaleEnabled ? 'bg-blue-500' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${bot.martingaleEnabled ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#111827] p-6 rounded-[2rem] border border-white/5 space-y-2">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Daily Stop Loss</p>
              <div className="flex items-center gap-2">
                <span className="text-rose-500 font-bold">$</span>
                <span className="text-lg font-black text-white font-mono">{bot.dailyStopLoss}</span>
              </div>
              <div className="w-full h-[1px] bg-slate-800 border-b border-dashed border-slate-700"></div>
            </div>
            <div className="bg-[#111827] p-6 rounded-[2rem] border border-white/5 space-y-2">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Daily Take Profit</p>
              <div className="flex items-center gap-2">
                <span className="text-[#10B981] font-bold">$</span>
                <span className="text-lg font-black text-white font-mono">{bot.dailyTakeProfit}</span>
              </div>
              <div className="w-full h-[1px] bg-slate-800 border-b border-dashed border-slate-700"></div>
            </div>
          </div>
        </div>

        {/* History Data Sync Button (At the absolute bottom of the tactical card) */}
        <button 
          onClick={handleHistorySync}
          className="w-full py-5 bg-blue-600/5 hover:bg-blue-600/10 text-blue-400 border border-blue-600/20 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
        >
          <span className="text-lg">🔄</span> HISTORY DATA
        </button>
      </div>

      <style>{`
        .custom-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          background: #3B82F6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.6);
        }
      `}</style>
    </div>
  );
};
