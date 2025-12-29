
import React from 'react';
import { BotStatus, Asset } from '../../types';

interface BotCardProps {
  bot: BotStatus;
  assets: Asset[];
  onToggleStatus: (id: string) => void;
  onAssetChange: (id: string, symbol: string) => void;
}

export const BotCard: React.FC<BotCardProps> = ({ bot, onToggleStatus }) => {
  const isPositive = bot.pnl >= 0;
  
  return (
    <div className={`bg-slate-900/40 p-5 rounded-[2rem] flex flex-col gap-4 border border-white/5 transition-all relative overflow-hidden group hover:border-white/20`}
         style={{ borderLeft: `4px solid ${bot.color}` }}>
      
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xs font-black text-white tracking-tight leading-none mb-1">{bot.name}</h3>
          <p className="text-[9px] text-slate-500 font-mono font-bold uppercase tracking-widest">{bot.strategy}</p>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleStatus(bot.id); }}
          className={`group flex items-center gap-2 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${
            bot.status === 'active' 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
              : 'bg-slate-800 text-slate-500 border border-white/5'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${bot.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></span>
          {bot.status}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Precision</span>
          <span className="text-sm font-mono font-black text-nexus-cyan">{(bot.accuracy * 100).toFixed(0)}%</span>
        </div>
        <div className="text-right">
          <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest block">24h Gain</span>
          <span className={`text-sm font-mono font-black ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? '+' : ''}{bot.pnl.toFixed(1)}%
          </span>
        </div>
      </div>
      
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-nexus-cyan/40" style={{ width: `${bot.accuracy * 100}%` }}></div>
      </div>
    </div>
  );
};
