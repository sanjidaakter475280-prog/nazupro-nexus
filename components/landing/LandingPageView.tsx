
import React, { useState, useEffect, useMemo } from 'react';
import { authService } from '../../services/authService';

interface LandingPageViewProps {
  onEnter: () => void;
}

const HolographicCandle: React.FC<{ delay: number; index: number }> = ({ delay, index }) => {
  const isUp = useMemo(() => Math.random() > 0.45, [index]);
  const height = useMemo(() => 40 + Math.random() * 80, [index]);
  const wickHeight = useMemo(() => height + 20 + Math.random() * 30, [index]);

  return (
    <div
      className="flex flex-col items-center justify-center shrink-0 w-4 h-full relative group"
      style={{
        animation: `float-candle 20s linear infinite`,
        animationDelay: `${delay}s`,
        opacity: 0,
      }}
    >
      <div
        className={`w-[1px] absolute ${isUp ? 'bg-blue-500/30' : 'bg-rose-500/30'}`}
        style={{ height: `${wickHeight}px` }}
      />
      <div
        className={`w-3 rounded-full z-10 shadow-lg transition-all duration-500 ${isUp ? 'bg-blue-500/10 border border-blue-500/30 shadow-blue-500/5' : 'bg-rose-500/10 border border-rose-500/30 shadow-rose-500/5'}`}
        style={{ height: `${height}px` }}
      />
    </div>
  );
};

export const LandingPageView: React.FC<LandingPageViewProps> = ({ onEnter }) => {
  const [mounted, setMounted] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });

  useEffect(() => {
    setMounted(true);
  }, []);

  const candles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      delay: i * -0.7,
    }));
  }, []);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let res;
      if (authMode === 'login') {
        res = await authService.login(formData.email, formData.password);
      } else {
        if (formData.password !== formData.confirmPassword) {
          alert("Passwords do not match");
          setIsSubmitting(false);
          return;
        }
        res = await authService.register(formData.email, formData.password);
        if (res.success) {
          alert("Registration successful! Please login.");
          setAuthMode('login');
          setIsSubmitting(false);
          return;
        }
      }

      if (res.error) {
        alert(res.error);
      } else if (res.token) {
        onEnter(); // Success
      }
    } catch (err) {
      console.error(err);
      alert("Connection failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#020617] text-white overflow-x-hidden overflow-y-auto selection:bg-blue-500/30 font-sans">

      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[160px] animate-[pulse_8s_infinite]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[160px] animate-[pulse_10s_infinite_delay-2000]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:60px_60px]"></div>
      </div>

      {/* Candlestick Layer - Softer */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.15] overflow-hidden flex items-center gap-12 px-20">
        <div className="flex gap-12 min-w-full">
          {candles.map((c) => (
            <HolographicCandle key={c.id} delay={c.delay} index={c.id} />
          ))}
          {candles.map((c) => (
            <HolographicCandle key={`loop-${c.id}`} delay={c.delay} index={c.id} />
          ))}
        </div>
      </div>

      {/* Main Content Wrapper */}
      <div className={`relative z-10 flex flex-col items-center justify-between min-h-screen transition-all duration-[1200ms] p-6 sm:p-12 ${mounted ? 'opacity-100' : 'opacity-0 scale-95 blur-xl'}`}>

        {/* Ticker - Floating */}
        <div className="absolute top-8 w-full overflow-hidden whitespace-nowrap opacity-30 pointer-events-none">
          <div className="inline-block animate-[marquee_40s_linear_infinite] text-[9px] font-bold uppercase tracking-[0.6em] text-slate-400">
            • NAZUPRO NEXUS CORE ACTIVE • HF-HUB-CONNECTED • NEURAL-SYSCALL-READY • AES-512-ENCRYPTION • ZERO-LATENCY-NODE-ALPHA •
            • NAZUPRO NEXUS CORE ACTIVE • HF-HUB-CONNECTED • NEURAL-SYSCALL-READY • AES-512-ENCRYPTION • ZERO-LATENCY-NODE-ALPHA •
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center w-full py-20 relative">
          <div className="max-w-screen-xl w-full flex flex-col lg:flex-row items-center lg:items-start justify-between min-h-[60vh]">

            {/* Brand Presentation */}
            <div className="text-center lg:text-left space-y-10">
              <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-xl animate-bounce-slow">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_12px_#3b82f6]"></span>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">SYSTEM_VERSION_4.2</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter italic leading-[0.85] uppercase">
                  <span className="block text-white">Nazupro</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-600 animate-gradient-x">Nexus</span>
                </h1>
                <p className="text-sm md:text-lg text-slate-400 font-medium max-w-xl italic leading-relaxed pt-4 opacity-80">
                  The definitive high-frequency orchestration layer. <br />
                  Harness decentralized neural intelligence for sub-millisecond market domination.
                </p>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-12 pt-6 opacity-40">
                <div className="flex flex-col items-center lg:items-start gap-2">
                  <span className="text-2xl">🤗</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">HF_SPACE</span>
                </div>
                <div className="flex flex-col items-center lg:items-start gap-2">
                  <span className="text-2xl">✨</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">GEMINI_AI</span>
                </div>
                <div className="flex flex-col items-center lg:items-start gap-2">
                  <span className="text-2xl">⚡</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">A10G_NODE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ethereal Auth Card - Relocated to Top Right */}
          <div className="relative lg:absolute lg:top-10 lg:right-6 z-20 flex justify-center perspective-1000 mt-12 lg:mt-0">
            <div className={`w-full max-w-md bg-white/[0.02] backdrop-blur-[60px] border border-white/10 rounded-[3.5rem] p-10 md:p-12 shadow-[0_80px_160px_-40px_rgba(0,0,0,0.7)] relative overflow-hidden transition-all duration-700 hover:shadow-blue-500/10 hover:border-white/20 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>

              {/* Internal Accent Orbs */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 blur-[80px] rounded-full group-hover:bg-blue-500/20 transition-all duration-1000"></div>

              <div className="relative z-10 space-y-10">
                {/* Header Toggle */}
                <div className="relative flex p-1 bg-white/[0.03] rounded-3xl border border-white/5 shadow-inner">
                  <div
                    className={`absolute inset-y-1 w-[calc(50%-4px)] bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-lg transition-all duration-500 ease-out ${authMode === 'register' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'}`}
                  ></div>
                  <button
                    onClick={() => setAuthMode('login')}
                    className={`relative z-10 flex-1 py-3 text-[10px] font-black uppercase tracking-[0.3em] transition-colors duration-500 ${authMode === 'login' ? 'text-white' : 'text-slate-500'}`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setAuthMode('register')}
                    className={`relative z-10 flex-1 py-3 text-[10px] font-black uppercase tracking-[0.3em] transition-colors duration-500 ${authMode === 'register' ? 'text-white' : 'text-slate-500'}`}
                  >
                    Register
                  </button>
                </div>

                {/* Form Section */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className={`space-y-6 transition-all duration-500 ${isSubmitting ? 'opacity-30 blur-sm pointer-events-none' : 'opacity-100 blur-0'}`}>

                    {/* Input Field: Email */}
                    <div className="space-y-3 group">
                      <div className="flex justify-between px-4">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] transition-colors group-focus-within:text-blue-400">Identity_Handle</label>
                      </div>
                      <div className="relative">
                        <input
                          required
                          type="email"
                          placeholder="operator@nazupro.nexus"
                          className="w-full bg-white/[0.02] border border-white/10 rounded-[1.5rem] px-8 py-5 text-sm font-bold focus:outline-none focus:bg-white/[0.04] focus:border-blue-500/40 focus:ring-[12px] focus:ring-blue-500/5 transition-all duration-500 placeholder:text-slate-700 placeholder:italic"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within:text-blue-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </div>
                      </div>
                    </div>

                    {/* Input Field: Password */}
                    <div className="space-y-3 group">
                      <div className="flex justify-between px-4">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] transition-colors group-focus-within:text-blue-400">Access_Sequence</label>
                      </div>
                      <div className="relative">
                        <input
                          required
                          type="password"
                          placeholder="••••••••••••"
                          className="w-full bg-white/[0.02] border border-white/10 rounded-[1.5rem] px-8 py-5 text-sm font-bold focus:outline-none focus:bg-white/[0.04] focus:border-blue-500/40 focus:ring-[12px] focus:ring-blue-500/5 transition-all duration-500 placeholder:text-slate-700 tracking-[0.4em]"
                          value={formData.password}
                          onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within:text-blue-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                      </div>
                    </div>

                    {/* Conditional Field: Confirm Password */}
                    <div className={`overflow-hidden transition-all duration-700 ease-in-out ${authMode === 'register' ? 'max-h-32 opacity-100 mt-6' : 'max-h-0 opacity-0'}`}>
                      <div className="space-y-3 group">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] px-4">Verify_Sequence</label>
                        <input
                          required={authMode === 'register'}
                          type="password"
                          placeholder="••••••••••••"
                          className="w-full bg-white/[0.02] border border-white/10 rounded-[1.5rem] px-8 py-5 text-sm font-bold focus:outline-none focus:bg-white/[0.04] focus:border-blue-500/40 focus:ring-[12px] focus:ring-blue-500/5 transition-all duration-500 placeholder:text-slate-700 tracking-[0.4em]"
                          value={formData.confirmPassword}
                          onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="relative pt-4">
                    <button
                      disabled={isSubmitting}
                      type="submit"
                      className="group relative w-full py-6 bg-white text-[#020617] rounded-[2rem] font-black text-[11px] uppercase tracking-[0.5em] transition-all duration-500 hover:scale-[1.03] active:scale-95 disabled:opacity-50 overflow-hidden shadow-2xl hover:shadow-blue-500/20"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-4">
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-slate-900/20 border-t-slate-900 rounded-full animate-spin"></div>
                            <span>Establishing...</span>
                          </>
                        ) : (
                          authMode === 'login' ? 'Enter Command' : 'Create Node'
                        )}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-400 to-blue-500 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                    </button>

                    {/* Subtle Loading Bar */}
                    {isSubmitting && (
                      <div className="absolute -bottom-2 left-0 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 animate-[loading-bar_2.4s_ease-in-out_forwards]"></div>
                      </div>
                    )}
                  </div>
                </form>

                <div className="flex items-center justify-center gap-6 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Nexus_Cloud: OK
                  </div>
                  <div className="w-px h-3 bg-white/10"></div>
                  <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">
                    AES-512_GCM
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights - Integrated Flow */}
        <div className="w-full max-w-6xl px-8 hidden lg:grid grid-cols-3 gap-12 mt-auto pt-10">
          <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 p-8 rounded-[3rem] space-y-4 hover:bg-white/[0.04] transition-all duration-500 group">
            <p className="text-3xl transition-transform group-hover:scale-125 duration-500">🧬</p>
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">Neural_Arch</h3>
            <p className="text-[11px] text-slate-500 font-medium italic leading-relaxed">Transformer-based inference engines optimized for high-volatility execution.</p>
          </div>
          <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 p-8 rounded-[3rem] space-y-4 hover:bg-white/[0.04] transition-all duration-500 group">
            <p className="text-3xl transition-transform group-hover:scale-125 duration-500">🛡️</p>
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Secure_Link</h3>
            <p className="text-[11px] text-slate-500 font-medium italic leading-relaxed">Encrypted data tunnels directly to A10G inference nodes globally.</p>
          </div>
          <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 p-8 rounded-[3rem] space-y-4 hover:bg-white/[0.04] transition-all duration-500 group">
            <p className="text-3xl transition-transform group-hover:scale-125 duration-500">💠</p>
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">Sync_Hub</h3>
            <p className="text-[11px] text-slate-500 font-medium italic leading-relaxed">Unified portfolio management across decentralized bot networks.</p>
          </div>
        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-[700px] h-[700px] border border-white/[0.02] rounded-full animate-[spin_60s_linear_infinite] pointer-events-none"></div>
      <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] border border-white/[0.02] rounded-full animate-[spin_80s_linear_infinite_reverse] pointer-events-none"></div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes float-candle {
          0% { transform: translateX(110vw); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateX(-150vw); opacity: 0; }
        }
        @keyframes loading-bar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 15s ease infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
};
