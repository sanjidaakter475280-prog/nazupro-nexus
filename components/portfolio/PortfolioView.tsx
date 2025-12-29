
import React, { useState, useEffect } from 'react';
import { BotStatus, Asset } from '../../types';

interface PortfolioViewProps {
  bots: BotStatus[];
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({ bots }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [scanProgress, setScanProgress] = useState(0);

  const handleLogin = () => {
    setIsLoading(true);
    // Simulate biometric/encryption scan
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setIsAuthenticated(true);
          setIsLoading(false);
        }, 500);
      }
      setScanProgress(progress);
    }, 200);
  };

  const totalEquity = bots.reduce((acc, bot) => acc + bot.investment, 0);
  const totalPnL = bots.reduce((acc, bot) => acc + (bot.investment * (bot.pnl / 100)), 0);

  if (!isAuthenticated) {
    return (
      <div className="h-[calc(100vh-140px)] flex items-center justify-center animate-in fade-in duration-700">
        <div className="w-full max-w-md relative">
          {/* Ambient Glows */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] animate-pulse"></div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px] animate-pulse delay-700"></div>

          <div className="relative bg-white/80 dark:bg-[#0B1121]/90 backdrop-blur-2xl border border-slate-200 dark:border-white/10 p-8 rounded-[2.5rem] shadow-2xl overflow-hidden">
            
            {/* Security Header */}
            <div className="text-center mb-10">
              <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-slate-200 dark:border-white/10 shadow-inner">
                <span className="text-3xl">🛡️</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Secure Vault</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Multi-Signature Access Required</p>
            </div>

            {/* The 5 Bot Security Nodes */}
            <div className="flex justify-center gap-3 mb-8">
              {bots.map((bot, idx) => (
                <div key={bot.id} className="flex flex-col items-center gap-2">
                   <div 
                      className={`w-2 h-2 rounded-full transition-all duration-500 ${isLoading ? 'animate-ping' : ''}`}
                      style={{ 
                        backgroundColor: scanProgress > (idx * 20) ? bot.color : '#334155',
                        animationDelay: `${idx * 100}ms`
                      }} 
                   />
                   <span className={`text-[8px] font-mono uppercase ${scanProgress > (idx * 20) ? 'text-slate-900 dark:text-white' : 'text-slate-600'}`}>
                      {bot.id.charAt(0)}
                   </span>
                </div>
              ))}
            </div>

            {/* Login Form */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2">Neural Key ID</label>
                <div className="relative">
                  <input 
                    type="password" 
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-center text-sm font-bold tracking-[0.5em] focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 text-slate-900 dark:text-white"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className={`w-2 h-2 rounded-full ${accessCode.length > 0 ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-2">
                   <div className="h-12 w-full bg-slate-100 dark:bg-black/20 rounded-xl overflow-hidden relative border border-slate-200 dark:border-white/5">
                      <div 
                        className="h-full bg-blue-600 transition-all duration-200 ease-out flex items-center justify-end px-3"
                        style={{ width: `${scanProgress}%` }}
                      >
                         <span className="text-[9px] font-black text-white/50 animate-pulse uppercase">Decrypting</span>
                      </div>
                      {/* Grid overlay for tech feel */}
                      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                   </div>
                   <div className="flex justify-between text-[8px] font-mono text-slate-400">
                      <span>HANDSHAKE_PROTOCOL_V4</span>
                      <span>{scanProgress.toFixed(0)}%</span>
                   </div>
                </div>
              ) : (
                <button 
                  onClick={handleLogin}
                  className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-500/5 relative overflow-hidden group"
                >
                  <span className="relative z-10">Initialize Uplink</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </button>
              )}
            </div>
            
            <div className="mt-8 text-center">
               <p className="text-[8px] text-slate-400 font-mono">ENCRYPTION: AES-256-GCM // NODE: NEXUS-PRIME</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard View (Post-Login)
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-700 fade-in">
      {/* Total Wealth Header */}
      <div className="relative bg-[#0B1121] rounded-[2.5rem] p-8 md:p-12 overflow-hidden border border-white/5 text-center">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"></div>
        
        <div className="relative z-10">
           <p className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] mb-4">Total Fleet Equity</p>
           <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4 font-mono">
              ${(totalEquity + totalPnL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
           </h1>
           <div className="inline-flex items-center gap-2 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
              <span className="text-emerald-500 text-sm">▲</span>
              <span className="text-emerald-400 text-xs font-black tracking-widest">
                 +${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })} (24H)
              </span>
           </div>
        </div>
      </div>

      {/* Bot Allocation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {bots.map((bot) => (
            <div key={bot.id} className="bg-white dark:bg-[#0F172A] p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 hover:border-blue-500/30 transition-all group">
               <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg" style={{ backgroundColor: bot.color }}>
                        {bot.id[0]}
                     </div>
                     <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">{bot.name}</h3>
                        <p className="text-[9px] text-slate-400 font-bold tracking-widest">{bot.strategy}</p>
                     </div>
                  </div>
                  <div className={`px-2 py-1 rounded-md border text-[9px] font-black uppercase ${bot.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-white/5'}`}>
                     {bot.status}
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex justify-between items-end">
                     <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Balance</span>
                     <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                        ${(bot.investment + (bot.investment * bot.pnl / 100)).toLocaleString()}
                     </span>
                  </div>
                  
                  {/* Progress Bar for Risk/Usage */}
                  <div className="space-y-1">
                     <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase">
                        <span>Allocation Usage</span>
                        <span>{Math.abs(bot.pnl * 2).toFixed(0)}%</span>
                     </div>
                     <div className="h-1.5 w-full bg-slate-100 dark:bg-black/20 rounded-full overflow-hidden">
                        <div 
                           className="h-full rounded-full" 
                           style={{ width: `${Math.min(Math.abs(bot.pnl * 2) + 20, 100)}%`, backgroundColor: bot.color }}
                        ></div>
                     </div>
                  </div>
               </div>
               
               <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex justify-between items-center">
                  <span className="text-[9px] text-slate-400 font-mono">ID: {bot.id}-SIGMA</span>
                  <button className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest group-hover:underline decoration-2 underline-offset-4">
                     View Wallet ➜
                  </button>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};
