
import React, { useState, useEffect } from 'react';
import { BotStatus, BotId } from '../../types';

interface BotLoginViewProps {
  bots: BotStatus[];
  onLoginSuccess: (botId: BotId) => void;
}

export const BotLoginView: React.FC<BotLoginViewProps> = ({ bots, onLoginSuccess }) => {
  const [selectedBotId, setSelectedBotId] = useState<BotId | null>(null);
  const [authState, setAuthState] = useState<'selection' | 'pin' | 'scanning' | 'pocket_config' | 'success'>('selection');

  // Bot Auth
  const [username, setUsername] = useState('');
  const [accessKey, setAccessKey] = useState('');

  // PocketOption Config
  const [poEmail, setPoEmail] = useState('');
  const [poPass, setPoPass] = useState('');

  const [authProgress, setAuthProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [glitch, setGlitch] = useState(false);

  const authMessages = [
    "SYSCALL: INITIALIZING NEURAL BRIDGE",
    "DECRYPTING QUANTUM PACKETS...",
    "UPLINK: HF-SPACE-NODE-772 CONNECTED",
    "MEMORY: ALLOCATING TENSOR BUFFERS",
    "MODEL: BERT-HFT-V4 LOADED (A10G)",
    "HANDSHAKE: ENCRYPTION SECURED"
  ];

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 200);
    }, 4000);
    return () => clearInterval(glitchInterval);
  }, []);

  const handleSelectBot = (botId: BotId) => {
    setSelectedBotId(botId);
    setAuthState('pin');
    setUsername('');
    setAccessKey('');
    setPoEmail('');
    setPoPass('');
  };

  // Step 1: Submit Bot Credentials
  const handleBotAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.length > 2 && accessKey.length >= 4) {
      setAuthState('pocket_config');
    }
  };

  // Step 2: Submit ALL Credentials (Final)
  const handleFinalSubmit = async (skipPo: boolean) => {
    setAuthState('scanning');
    setAuthProgress(0);

    const pEmail = skipPo ? undefined : poEmail;
    const pPass = skipPo ? undefined : poPass;

    import('../../services/apiService').then(async ({ apiService }) => {
      const success = await apiService.loginBot(selectedBotId!, username, accessKey, pEmail, pPass);

      if (!success) {
        setAuthState('selection');
        setStatusMessage("ACCESS DENIED");
        alert("Authorization Failed: Invalid Username or Access Key");
        return;
      }

      // If success, simulate loading sequence
      const interval = setInterval(() => {
        setAuthProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setAuthState('success');
            setTimeout(() => {
              if (selectedBotId) onLoginSuccess(selectedBotId);
            }, 1200);
            return 100;
          }
          const nextProgress = prev + Math.random() * 15;
          const msgIdx = Math.floor((nextProgress / 100) * authMessages.length);
          if (msgIdx < authMessages.length) setStatusMessage(authMessages[msgIdx]);
          return nextProgress;
        });
      }, 120);
    });
  };

  const handleBackToSelection = () => {
    setAuthState('selection');
    setSelectedBotId(null);
  };

  const activeBot = bots.find(b => b.id === selectedBotId);

  // Selection Screen
  if (authState === 'selection') {
    return (
      <div className="space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000 relative">
        <div className="absolute inset-0 -z-10 opacity-[0.03] dark:opacity-[0.07] pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_400px,#3b82f61a,transparent)]"></div>
        </div>

        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-2 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.4em]">NEURAL HUB: OPERATIONAL</span>
          </div>
          <h2 className={`text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter italic transition-all ${glitch ? 'skew-x-2' : ''}`}>
            Unit Selection
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-lg mx-auto leading-relaxed italic border-x border-blue-500/20 px-8">
            Select an autonomous neural unit to initiate a secure encrypted bridge between this terminal and the Hugging Face AI core.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {bots.map((bot) => (
            <div
              key={bot.id}
              onClick={() => handleSelectBot(bot.id)}
              className="group relative bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-xl p-12 rounded-[3.5rem] border border-slate-200 dark:border-white/5 cursor-pointer transition-all hover:scale-[1.04] hover:border-blue-500/40 hover:shadow-[0_40px_80px_-20px_rgba(37,99,235,0.2)] active:scale-95 overflow-hidden"
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-[0.05] transition-opacity duration-500"
                style={{ background: `radial-gradient(circle at center, ${bot.color}, transparent)` }}
              ></div>

              <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                <div className="relative">
                  <div
                    className="w-24 h-24 rounded-[2.2rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl transition-all duration-500 group-hover:rotate-[10deg] group-hover:scale-110"
                    style={{ backgroundColor: bot.color, boxShadow: `0 20px 40px -10px ${bot.color}44` }}
                  >
                    {bot.id[0]}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-white dark:bg-[#020617] p-1.5 rounded-xl border border-slate-100 dark:border-white/10 shadow-lg">
                    <span className="text-[8px] font-black text-blue-600 uppercase">PRO</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{bot.name}</h3>
                  <div className="flex items-center justify-center gap-2">
                    <span className="h-1 w-8 bg-blue-500/20 rounded-full"></span>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.25em]">{bot.strategy}</p>
                    <span className="h-1 w-8 bg-blue-500/20 rounded-full"></span>
                  </div>
                </div>

                <div className="w-full grid grid-cols-2 gap-6 pt-8 border-t border-slate-100 dark:border-white/5">
                  <div className="text-left">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">PRECISION</p>
                    <p className="text-lg font-black text-blue-600 font-mono tracking-tighter">{(bot.accuracy * 100).toFixed(0)}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">STATUS</p>
                    <div className="flex items-center justify-end gap-2 mt-1">
                      <span className={`w-2 h-2 rounded-full ${bot.status === 'active' ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_#10B981]' : 'bg-slate-300'}`}></span>
                      <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase">{bot.status}</span>
                    </div>
                  </div>
                </div>

                <div className="w-full relative overflow-hidden rounded-2xl">
                  <button className="w-full py-5 bg-slate-900 dark:bg-white/5 text-white dark:text-white group-hover:bg-blue-600 group-hover:text-white text-[10px] font-black uppercase tracking-[0.35em] transition-all border border-transparent dark:border-white/5">
                    INITIALIZE LINK
                  </button>
                  <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Auth/Email & Password & Scanning View
  return (
    <div className="min-h-[700px] flex items-center justify-center animate-in fade-in zoom-in duration-700 p-4">
      <div className="relative w-full max-w-xl">
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-purple-600/10 rounded-full blur-[100px] animate-pulse delay-700"></div>

        <div className="bg-white/90 dark:bg-[#020617]/95 backdrop-blur-3xl border border-slate-200 dark:border-white/10 rounded-[4rem] p-16 relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] text-center">

          {(authState === 'pin' || authState === 'scanning' || authState === 'pocket_config') && (
            <button
              onClick={handleBackToSelection}
              className="absolute top-8 left-8 p-3 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-blue-500 transition-all active:scale-90 z-30 flex items-center gap-2 group"
              title="Back to Selection"
            >
              <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              <span className="text-[10px] font-black uppercase tracking-widest pr-1">Back</span>
            </button>
          )}

          {authState === 'scanning' && (
            <div className="absolute inset-0 z-20 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_20px_#3b82f6] animate-[scan_2s_linear_infinite]"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#3b82f605_100%)]"></div>
            </div>
          )}

          <div className="space-y-10 relative z-10">
            <div className="relative inline-block">
              <div
                className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center text-5xl font-black text-white shadow-2xl transition-all duration-1000 ${authState === 'scanning' ? 'scale-110 rotate-[360deg] shadow-[0_0_50px_rgba(59,130,246,0.3)]' : ''}`}
                style={{ backgroundColor: activeBot?.color, boxShadow: `0 30px 60px -15px ${activeBot?.color}66` }}
              >
                {activeBot?.id[0]}
              </div>
              <div className={`absolute -inset-6 border-2 border-dashed border-blue-500/20 rounded-full animate-[spin_10s_linear_infinite] ${authState === 'pin' || authState === 'pocket_config' ? 'opacity-100' : 'opacity-0'}`}></div>
            </div>

            <div className="space-y-2">
              <h2 className={`text-3xl font-black text-slate-900 dark:text-white uppercase tracking-[0.25em] italic transition-all ${glitch ? 'translate-x-1' : ''}`}>
                {activeBot?.name}
              </h2>
              <p className="text-[11px] text-blue-500 font-black uppercase tracking-[0.4em] animate-pulse">
                {authState === 'pin' ? 'AUTHORIZATION REQUIRED' : authState === 'pocket_config' ? 'POCKET OPTION LINK' : 'NEURAL HANDSHAKE IN PROGRESS'}
              </p>
            </div>

            {authState === 'pin' && (
              <form onSubmit={handleBotAuthSubmit} className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                <div className="space-y-5 text-left">
                  <div className="space-y-2 group">
                    <label className="text-[10px] font-black text-slate-400 group-focus-within:text-blue-500 uppercase tracking-[0.2em] pl-4 transition-colors">Bot Username</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="admin"
                        className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 focus:border-blue-500/50 rounded-[1.5rem] px-8 py-5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-800 focus:shadow-[0_0_25px_rgba(59,130,246,0.05)]"
                        autoFocus
                        required
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-800">👤</span>
                    </div>
                  </div>

                  <div className="space-y-2 group">
                    <label className="text-[10px] font-black text-slate-400 group-focus-within:text-blue-500 uppercase tracking-[0.2em] pl-4 transition-colors">Access Key</label>
                    <div className="relative">
                      <input
                        type="password"
                        value={accessKey}
                        onChange={(e) => setAccessKey(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 focus:border-blue-500/50 rounded-[1.5rem] px-8 py-5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-800 tracking-[0.4em] focus:shadow-[0_0_25px_rgba(59,130,246,0.05)]"
                        required
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-800">🔑</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={username.length < 2 || accessKey.length < 4}
                    className="w-full py-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-20 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.35em] transition-all shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] relative overflow-hidden group"
                  >
                    <span className="relative z-10">Continue</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                  </button>
                </div>
              </form>
            )}

            {authState === 'pocket_config' && (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-700">
                <div className="bg-blue-500/10 p-4 rounded-3xl border border-blue-500/20 text-left">
                  <p className="text-[10px] text-blue-300 font-bold leading-relaxed">
                    💡 Configure your PocketOption credentials now to sync them with your bot environment. This ensures automated login even after restarts.
                  </p>
                </div>

                <div className="space-y-5 text-left">
                  <div className="space-y-2 group">
                    <label className="text-[10px] font-black text-slate-400 group-focus-within:text-emerald-500 uppercase tracking-[0.2em] pl-4 transition-colors">Pocket Option Email</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={poEmail}
                        onChange={(e) => setPoEmail(e.target.value)}
                        placeholder="trader@gmail.com"
                        className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 focus:border-emerald-500/50 rounded-[1.5rem] px-8 py-5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-800 focus:shadow-[0_0_25px_rgba(16,185,129,0.05)]"
                        autoFocus
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-800">📧</span>
                    </div>
                  </div>

                  <div className="space-y-2 group">
                    <label className="text-[10px] font-black text-slate-400 group-focus-within:text-emerald-500 uppercase tracking-[0.2em] pl-4 transition-colors">Pocket Option Password</label>
                    <div className="relative">
                      <input
                        type="password"
                        value={poPass}
                        onChange={(e) => setPoPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 focus:border-emerald-500/50 rounded-[1.5rem] px-8 py-5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-800 tracking-[0.4em] focus:shadow-[0_0_25px_rgba(16,185,129,0.05)]"
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-800">🔐</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={() => handleFinalSubmit(true)}
                    className="flex-1 py-5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all border border-slate-200 dark:border-white/5"
                  >
                    Skip
                  </button>
                  <button
                    onClick={() => handleFinalSubmit(false)}
                    disabled={poEmail.length < 4 || poPass.length < 4}
                    className="flex-[1.5] py-5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-20 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.35em] transition-all shadow-[0_20px_40px_-10px_rgba(16,185,129,0.4)] relative overflow-hidden group"
                  >
                    <span className="relative z-10">Save & Connect</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                  </button>
                </div>
              </div>
            )}

            {authState === 'scanning' && (
              <div className="space-y-10 animate-in fade-in duration-500">
                <div className="space-y-4">
                  <div className="relative h-4 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden border border-slate-200 dark:border-white/5 p-1">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full shadow-[0_0_15px_#3B82F6] transition-all duration-300 ease-out relative"
                      style={{ width: `${authProgress}%` }}
                    >
                      <div className="absolute top-0 right-0 w-8 h-full bg-white/30 blur-sm animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-2">
                    <span className="text-[10px] font-mono text-blue-500 font-bold uppercase tracking-tighter animate-pulse">{statusMessage}</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white font-mono">{Math.floor(authProgress)}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-6 border-y border-slate-100 dark:border-white/5">
                  <div className="text-left space-y-1">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Inference Latency</p>
                    <p className="text-xs font-mono text-emerald-500 font-bold">0.02ms (A10G)</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Neural Load</p>
                    <p className="text-xs font-mono text-blue-400 font-bold">14.2 GFLOPS</p>
                  </div>
                </div>
              </div>
            )}

            {authState === 'success' && (
              <div className="py-10 animate-in zoom-in-95 duration-700">
                <div className="w-28 h-28 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(16,185,129,0.3)] animate-bounce">
                  <span className="text-6xl">✨</span>
                </div>
                <h3 className="text-2xl font-black text-emerald-500 uppercase tracking-[0.3em]">Link Verified</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-3 italic">Bypassing security filters... Handing over to Tactical Control.</p>
              </div>
            )}

            <div className="pt-12 border-t border-slate-100 dark:border-white/5 flex justify-between items-center opacity-40 grayscale group-hover:grayscale-0 transition-all">
              <div className="text-left">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Protocol</p>
                <p className="text-[10px] font-mono font-bold text-slate-900 dark:text-white">NEXUS-X / HF_SYSCALL</p>
              </div>
              <div className="flex gap-4">
                <div className="text-right">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Kernel</p>
                  <p className="text-[10px] font-mono font-bold text-slate-900 dark:text-white">v4.2.0-STABLE</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Region</p>
                  <p className="text-[10px] font-mono font-bold text-slate-900 dark:text-white">US-EAST-1</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(700px); opacity: 0; }
        }
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        .ease-nexus {
          transition-timing-function: cubic-bezier(0.85, 0, 0.15, 1);
        }
      `}</style>
    </div>
  );
};
