
import React from 'react';

interface SettingsViewProps {
  onLogout: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onLogout }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Profile Header */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/5 rounded-[3rem] p-8 lg:p-12 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-3xl shadow-xl shadow-blue-500/20 border-4 border-white dark:border-slate-800">
            👤
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Nazupro Operator #772</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">operator@nazupro.core • Level: Senior Architect</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">Verified Identity</span>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-500/20">Pro Tier</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* About Section */}
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
             <span className="text-2xl">ℹ️</span>
             <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">About Platform</h3>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong>Nazupro Nexus</strong> is a high-frequency trading orchestration layer designed to interface directly with custom neural models hosted on <strong>Hugging Face Spaces</strong>.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
               <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Version</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">4.2.0-STABLE</p>
               </div>
               <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Architecture</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">A10G-Inference</p>
               </div>
            </div>
            <p className="text-xs text-slate-400 italic">
              Powered by advanced transformers and zero-lag WebSocket protocols for global market domination.
            </p>
          </div>
        </div>

        {/* Security & Action Section */}
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
             <span className="text-2xl">🛡️</span>
             <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">System Access</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
               <div>
                  <p className="text-xs font-black text-slate-900 dark:text-white">Two-Factor Authentication</p>
                  <p className="text-[10px] text-slate-500">Secure every session with neural keys</p>
               </div>
               <div className="w-10 h-5 bg-emerald-500 rounded-full relative">
                  <div className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full"></div>
               </div>
            </div>

            <div className="pt-6">
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-4">Danger Zone</p>
              <button 
                onClick={onLogout}
                className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-rose-500/20 active:scale-95 flex items-center justify-center gap-3"
              >
                <span>Logout Session</span>
                <span className="text-lg leading-none">🚪</span>
              </button>
              <p className="text-center text-[10px] text-slate-400 mt-4">
                This will terminate all active neural links and clear local cache.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
