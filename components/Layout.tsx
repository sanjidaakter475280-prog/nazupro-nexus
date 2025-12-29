
import React, { useState, useEffect } from 'react';
import { AppView } from '../types';

const NavItem: React.FC<{ icon: string; label: string; active?: boolean; onClick: () => void; isDanger?: boolean }> = ({ icon, label, active, onClick, isDanger }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
    active 
      ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20' 
      : isDanger 
        ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600'
        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
  }`}>
    <span className="text-xl">{icon}</span>
    <span className="text-sm tracking-tight">{label}</span>
  </div>
);

const NavSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-8">
    <p className="px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3">{title}</p>
    <div className="space-y-1.5">{children}</div>
  </div>
);

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  onLogout?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('nexus-theme') as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('nexus-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleNavClick = (view: AppView) => {
    onViewChange(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 overflow-x-hidden">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-[110] h-screen bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-white/5 transition-transform duration-500 ease-nexus
        w-[280px] shrink-0 flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20">
              <span className="text-white font-black text-xl italic">N</span>
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white italic">Nazupro</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 text-slate-400">✕</button>
        </div>

        <nav className="flex-1 px-4 overflow-y-auto no-scrollbar pb-10">
          <NavSection title="Mission Control">
            <NavItem icon="📊" label="Nazupro Dashboard" active={currentView === 'dashboard'} onClick={() => handleNavClick('dashboard')} />
            <NavItem icon="💼" label="Asset Liquidity" active={currentView === 'assets'} onClick={() => handleNavClick('assets')} />
            <NavItem icon="👤" label="Portfolio" active={currentView === 'portfolio'} onClick={() => handleNavClick('portfolio')} />
            <NavItem icon="🤖" label="AI Unit Link" active={currentView === 'bots'} onClick={() => handleNavClick('bots')} />
          </NavSection>

          <NavSection title="Tactical Systems">
            <NavItem icon="📈" label="Pro Trading" active={currentView === 'trading'} onClick={() => handleNavClick('trading')} />
            <NavItem icon="🎮" label="Command Center" active={currentView === 'control'} onClick={() => handleNavClick('control')} />
            <NavItem icon="📡" label="Signal Feed" active={currentView === 'signals'} onClick={() => handleNavClick('signals')} />
            <NavItem icon="📉" label="DCA Engine" active={currentView === 'dca'} onClick={() => handleNavClick('dca')} />
            <NavItem icon="⚙️" label="GRID Matrix" active={currentView === 'grid'} onClick={() => handleNavClick('grid')} />
            <NavItem icon="💻" label="Core Terminal" active={currentView === 'terminal'} onClick={() => handleNavClick('terminal')} />
          </NavSection>

          <NavSection title="System">
            <NavItem icon="🛠️" label="Settings" active={currentView === 'settings'} onClick={() => handleNavClick('settings')} />
            <NavItem icon="💳" label="Subscription" active={currentView === 'subscription'} onClick={() => handleNavClick('subscription')} />
            {onLogout && (
              <NavItem 
                icon="🚪" 
                label="Logout Session" 
                onClick={() => { onLogout(); setIsMobileMenuOpen(false); }} 
                isDanger 
              />
            )}
          </NavSection>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 px-4 lg:px-10 flex items-center justify-between sticky top-0 z-[90] bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 transition-colors">
          <div className="flex items-center gap-4">
            {/* 3-Bar / Hamburger Menu (Mobile Only) */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-white/5 rounded-xl active:scale-90 transition-transform"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-slate-900 dark:text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            
            <div className="hidden sm:flex items-center gap-6">
              <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5">
                <div className="w-8 h-8 bg-[#F7931A]/20 rounded-full flex items-center justify-center text-[#F7931A] font-black text-xs">₿</div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">BTC/USD</p>
                  <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">$43,324.03</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="hidden md:block relative">
              <input 
                type="text" 
                placeholder="Search command..." 
                className="bg-slate-100 dark:bg-white/5 border border-transparent focus:border-blue-500 text-slate-900 dark:text-white rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold focus:outline-none w-64 transition-all placeholder:text-slate-400"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            </div>

            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all border border-transparent dark:border-white/10"
              title="Toggle Theme"
            >
              <span className="text-xl">{theme === 'light' ? '🌙' : '☀️'}</span>
            </button>

            <button className="bg-slate-900 dark:bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-lg shadow-slate-900/10">
               Deposit
            </button>
          </div>
        </header>

        <main className="p-4 lg:p-10 pb-24">
          {children}
        </main>
      </div>
    </div>
  );
};
