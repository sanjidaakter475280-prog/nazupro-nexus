
import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout';
import { LiveChart } from './components/charts/LiveChart';
import { BotCommandCenter } from './components/BotCommandCenter';
import { AssetsView } from './components/assets/AssetsView';
import { TerminalView } from './components/terminal/TerminalView';
import { PortfolioView } from './components/portfolio/PortfolioView';
import { BotLoginView } from './components/bots/BotLoginView';
import { SettingsView } from './components/settings/SettingsView';
import { LandingPageView } from './components/landing/LandingPageView';
import { SignalTacticalView } from './components/signals/SignalTacticalView';
import { SignalFeed } from './components/dashboard/SignalFeed';
import { getMarketInsights } from './services/geminiService';
import { apiService } from './services/apiService';
import { socketService } from './services/socketService';
import { BotStatus, PricePoint, Asset, BotId, Timeframe, AppView, TradingSignal, MarketInsight } from './types';

const PAIRS = [
  'CHFJPY_otc', '#AAPL_otc', 'EURGBP_otc', 'TRX-USD_otc', 'ZARUSD_otc', 'AMD_otc',
  'USDCLP_otc', 'AUDCHF_otc', 'USDCAD_otc', 'UAHUSD_otc', '#FB_otc', 'PLTR_otc',
  'USDIDR_otc', '#PFE_otc', 'AUDCAD_otc', 'USDBRL_otc', 'CADJPY_otc', 'AUDUSD_otc',
  'USDVND_otc', 'NGNUSD_otc', 'EURUSD_otc', 'GME_otc', 'USDCNH_otc', 'USDSGD_otc',
  'BTCUSD', 'ETHUSD', 'SOLUSD', 'BNBUSD'
];

const TIMEFRAMES: Timeframe[] = ['1m', '5m', '15m', '1h'];

const INITIAL_MOCK_ASSETS: Asset[] = PAIRS.map((sym, index) => ({
  symbol: sym,
  name: sym.split('_')[0].replace('#', ''),
  price: sym.includes('USD') ? Math.random() * 95000 : Math.random() * 1000,
  change24h: (Math.random() - 0.5) * 5,
  payout: 92,
  marketType: sym.includes('otc') ? 'OTC' : (['BTCUSD', 'ETHUSD', 'SOLUSD', 'BNBUSD'].includes(sym) ? 'Crypto' : 'Forex'),
  bestTimeframe: TIMEFRAMES[index % TIMEFRAMES.length]
}));

const INITIAL_BOTS: BotStatus[] = [
  {
    id: 'Alpha', name: 'ALPHA NEURAL 7', status: 'active', isLinked: false, pnl: 4.2, accuracy: 0.92, color: '#2563EB',
    strategy: 'HFT Scalper', selected_pair: 'CHFJPY_otc', selectedTimeframe: '1m',
    investment: 12000, amount: 100, expiration: 60, payout: 92,
    martingaleEnabled: true, martingaleSteps: 2, minAccuracy: 85, dailyStopLoss: 150, dailyTakeProfit: 300, trading_mode: 'auto', pairStatus: 'active'
  },
  {
    id: 'Beta', name: 'BETA GRID 4', status: 'inactive', isLinked: false, pnl: -1.5, accuracy: 0.81, color: '#F59E0B',
    strategy: 'Spot Grid', selected_pair: 'EURUSD_otc', selectedTimeframe: '5m',
    investment: 5000, amount: 50, expiration: 120, payout: 92,
    martingaleEnabled: false, martingaleSteps: 0, minAccuracy: 80, dailyStopLoss: 50, dailyTakeProfit: 100, trading_mode: 'passive', pairStatus: 'active'
  },
  {
    id: 'Gamma', name: 'GAMMA TREND X', status: 'active', isLinked: false, pnl: 12.8, accuracy: 0.94, color: '#10B981',
    strategy: 'AI Trend', selected_pair: 'USDCAD_otc', selectedTimeframe: '15m',
    investment: 25000, amount: 250, expiration: 300, payout: 92,
    martingaleEnabled: true, martingaleSteps: 3, minAccuracy: 90, dailyStopLoss: 300, dailyTakeProfit: 600, trading_mode: 'auto', pairStatus: 'active'
  },
  {
    id: 'Delta', name: 'DELTA REVERSAL', status: 'active', isLinked: false, pnl: 0.5, accuracy: 0.76, color: '#EF4444',
    strategy: 'Mean Rev', selected_pair: '#AAPL_otc', selectedTimeframe: '1m',
    investment: 8000, amount: 100, expiration: 60, payout: 92,
    martingaleEnabled: false, martingaleSteps: 1, minAccuracy: 75, dailyStopLoss: 100, dailyTakeProfit: 200, trading_mode: 'semi', pairStatus: 'paused'
  },
  {
    id: 'Epsilon', name: 'EPSILON CORE', status: 'inactive', isLinked: false, pnl: 0.0, accuracy: 0.88, color: '#6366F1',
    strategy: 'Neural Core', selected_pair: 'GME_otc', selectedTimeframe: '1h',
    investment: 15000, amount: 150, expiration: 3600, payout: 92,
    martingaleEnabled: true, martingaleSteps: 5, minAccuracy: 88, dailyStopLoss: 500, dailyTakeProfit: 1000, trading_mode: 'auto', pairStatus: 'active'
  },
];

const VIEW_TITLES: Record<AppView, { title: string; subtitle: string }> = {
  dashboard: { title: 'Fleet Analytics', subtitle: 'Global HFT Node Network' },
  bots: { title: 'AI Unit Link', subtitle: 'Neural Network Connectivity' },
  trading: { title: 'Pro Trading', subtitle: 'Manual Execution Interface' },
  control: { title: 'Command Center', subtitle: 'Tactical Operations' },
  settings: { title: 'System Settings', subtitle: 'Platform Configuration' },
  wallet: { title: 'Secure Wallet', subtitle: 'Asset & Key Management' },
  assets: { title: 'Liquidity Hub', subtitle: 'Market Analysis & Deployment' },
  portfolio: { title: 'Portfolio Overview', subtitle: 'Asset Allocation & PnL' },
  signals: { title: 'Signal Intelligence', subtitle: 'Real-time Data Streams' },
  dca: { title: 'DCA Engine', subtitle: 'Automated Accumulation' },
  grid: { title: 'GRID Matrix', subtitle: 'High-Frequency Grid Systems' },
  terminal: { title: 'Core Terminal', subtitle: 'Direct Neural Uplink' },
  marketplace: { title: 'Algo Marketplace', subtitle: 'Strategy Acquisition' },
  orders: { title: 'Trade History', subtitle: 'Execution Ledger' },
  subscription: { title: 'Plan Management', subtitle: 'Tier Status & Billing' }
};

const App: React.FC = () => {
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [bots, setBots] = useState<BotStatus[]>(INITIAL_BOTS);
  const [activeBotId, setActiveBotId] = useState<BotId>('Alpha');
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [appState, setAppState] = useState<'landing' | 'auth' | 'nexus'>('landing');
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [insights, setInsights] = useState<MarketInsight | null>(null);
  const [linkingBotId, setLinkingBotId] = useState<BotId | null>(null);
  const [botCharts, setBotCharts] = useState<Record<BotId, PricePoint[]>>({
    Alpha: [], Beta: [], Gamma: [], Delta: [], Epsilon: []
  });
  // 🔧 NEW: Chart timeframe is independent of bot strategy, defaults to 1m
  const [chartTimeframe, setChartTimeframe] = useState<Timeframe>('1m');

  const activeBot = useMemo(() => bots.find(b => b.id === activeBotId) || bots[0], [bots, activeBotId]);

  const selectedAsset = useMemo(() =>
    availableAssets.find(a => a.symbol === activeBot.assignedAssetSymbol) || availableAssets[0] || { symbol: 'EURUSD_otc', name: 'EURUSD', price: 1.05, change24h: 0, payout: 92, marketType: 'OTC', bestTimeframe: '1m' },
    [activeBot.assignedAssetSymbol, availableAssets]
  );

  // Initialize Nexus
  useEffect(() => {
    const initNexus = async () => {
      try {
        // Fetch bots
        const fetchedBots = await apiService.getBots();
        if (fetchedBots.length === 0) {
          await apiService.syncInitialBots(INITIAL_BOTS);
          setBots(INITIAL_BOTS);
        } else {
          setBots(fetchedBots);
          // 🔧 AUTO-LOGIN LOGIC
          // If a bot is already linked (isLinked=true), auto-login to dashboard
          const linkedBot = fetchedBots.find(b => b.isLinked);
          if (linkedBot) {
            setActiveBotId(linkedBot.id);
            setAppState('nexus');
          }
        }

        // Fetch market data
        const marketData = await apiService.getMarketData();
        if (marketData && marketData.length > 0) {
          const mappedAssets: Asset[] = marketData.map(md => ({
            symbol: md.name,
            name: md.name.split('_')[0].replace('#', ''),
            price: 0, // Price comes from realtime socket or candles, initially 0
            change24h: 0,
            payout: md.payout,
            marketType: md.asset_type === 'otc' ? 'OTC' : 'Forex',
            bestTimeframe: '1m'
          }));
          setAvailableAssets(mappedAssets);
          // Default to first available asset if none selected
          // setSelectedAsset(marketData[0].symbol); 
        } else {
          // Fallback to static if DB empty (optional, or just empty)
          setAvailableAssets(INITIAL_MOCK_ASSETS);
        }

        const dbSignals = await apiService.getSignals();
        setSignals(dbSignals);
      } catch (error) {
        console.error("Nexus Sync Error:", error);
      }
    };
    initNexus();
  }, []);

  useEffect(() => {
    if (appState !== 'nexus') return;
    const generateHistory = (assetPrice: number) => {
      const history: PricePoint[] = [];
      let price = assetPrice;
      const now = Date.now();
      for (let i = 40; i >= 0; i--) {
        const volatility = price * 0.002;
        const open = price;
        const close = open + (Math.random() - 0.5) * volatility;
        history.push({ open, close, high: Math.max(open, close) + volatility * 0.3, low: Math.min(open, close) - volatility * 0.3, time: now - (i * 60000) });
        price = close;
      }
      return history;
    };
    if (botCharts[activeBotId].length === 0) {
      setBotCharts(prev => ({ ...prev, [activeBotId]: generateHistory(selectedAsset.price) }));
    }
  }, [activeBotId, selectedAsset.symbol, appState]);

  // 📡 Real-Time Signals Management
  useEffect(() => {
    if (appState !== 'nexus') return;

    // 1. Initial Load from Database
    const fetchSignals = async () => {
      try {
        const dbSignals = await apiService.getSignals();
        setSignals(dbSignals);
      } catch (err) {
        console.error("Failed to fetch initial signals", err);
      }
    };
    fetchSignals();

    // 2. Real-Time Socket Updates
    socketService.onSignal((newSignal: TradingSignal) => {
      setSignals(prev => {
        // Avoid duplicates by ID
        if (prev.some(s => s.id === newSignal.id)) return prev;
        return [newSignal, ...prev].slice(0, 100);
      });
    });

    return () => {
      socketService.off('signal');
    };
  }, [appState]);

  useEffect(() => {
    if (appState === 'nexus' && currentView === 'dashboard') {
      getMarketInsights(bots, signals).then(setInsights);
    }
  }, [currentView, appState]);

  const handleToggleBot = async (id: string) => {
    const bot = bots.find(b => b.id === id);
    if (!bot) return;
    const newStatus = bot.status === 'active' ? 'inactive' : 'active';
    setBots(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
    await apiService.updateBot(id, { status: newStatus });
    await apiService.sendCommand(id, newStatus === 'active' ? 'start_bot' : 'stop_bot');
  };

  const handleAssetChange = async (id: string, symbol: string) => {
    setBots(prev => prev.map(b => b.id === id ? { ...b, selected_pair: symbol } : b));
    setBotCharts(prev => ({ ...prev, [id as BotId]: [] }));
    await apiService.updateBot(id, { selected_pair: symbol });
  };

  const handleBotUpdate = async (id: string, updates: Partial<BotStatus>) => {
    setBots(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    await apiService.updateBot(id, updates);
  };

  const handleDeployToAsset = (symbol: string) => {
    handleAssetChange(activeBotId, symbol);
    setCurrentView('control');
  };

  const handleBotLoginSuccess = (botId: BotId) => {
    setBots(prev => prev.map(b => b.id === botId ? { ...b, isLinked: true } : b));
    setLinkingBotId(null);
    if (appState === 'auth') {
      setActiveBotId(botId);
      setAppState('nexus');
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    setAppState('landing');
    setCurrentView('dashboard');
    setBots(INITIAL_BOTS);
  };

  const handleBotSwitch = (id: BotId) => {
    setActiveBotId(id);
  };

  if (appState === 'landing') {
    return <LandingPageView onEnter={() => setAppState('auth')} />;
  }

  if (appState === 'auth') {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col p-4 md:p-10">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20">
            <span className="text-white font-black text-xl italic">N</span>
          </div>
          <span className="text-2xl font-black tracking-tighter text-white italic">Nazupro</span>
        </div>
        <BotLoginView bots={bots} onLoginSuccess={handleBotLoginSuccess} />
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <LiveChart
                data={botCharts[activeBotId]}
                selectedAsset={selectedAsset}
                availableAssets={availableAssets}
                onAssetChange={(sym) => handleAssetChange(activeBotId, sym)}
                selectedTimeframe={chartTimeframe}
                onTimeframeChange={setChartTimeframe}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#0F172A] p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span> Nexus Intelligence
                  </p>
                  {insights ? (
                    <div className="space-y-4">
                      <p className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed italic">"{insights.summary}"</p>
                      <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-100 dark:border-blue-500/20">
                        <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Prediction</p>
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{insights.prediction}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-slate-100 dark:bg-white/5 rounded w-3/4"></div>
                      <div className="h-20 bg-slate-100 dark:bg-white/5 rounded"></div>
                    </div>
                  )}
                </div>
                <SignalFeed signals={signals.slice(0, 5)} />
              </div>
            </div>
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/5 rounded-[2rem] p-8 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2 italic">
                  <span className="text-blue-600">⚡</span> Tactical Summary
                </h3>
                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium italic">
                      Analysis engine for <strong>{activeBot.name}</strong> has detected a high-volume breakout pattern on <strong>{activeBot.selected_pair}</strong>.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-white dark:bg-black/20 border border-slate-100 dark:border-white/5 rounded-xl">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active Pair</p>
                      <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase">{activeBot.selected_pair || 'None'}</p>
                    </div>
                    <div className="text-center p-3 bg-white dark:bg-black/20 border border-slate-100 dark:border-white/5 rounded-xl">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">PnL Delta</p>
                      <p className={`text-[10px] font-black ${activeBot.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{activeBot.pnl}%</p>
                    </div>
                  </div>

                  {/* 🚀 QUICK START/STOP BUTTON (Mirroring CommandCenter) */}
                  <button
                    onClick={() => handleToggleBot(activeBotId)}
                    disabled={!activeBot.selected_pair}
                    className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 mt-4 ${activeBot.status === 'active'
                      ? 'bg-red-500/10 border border-red-500/50 text-red-500 hover:bg-red-500/20'
                      : activeBot.selected_pair
                        ? 'bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-600'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed opacity-50'
                      }`}
                  >
                    {activeBot.status === 'active'
                      ? '🛑 STOP TRADING'
                      : activeBot.selected_pair
                        ? `🚀 START ${activeBot.selected_pair}`
                        : '⏳ SELECT ASSET FIRST'}
                  </button>
                </div>
              </div>
              <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/5 rounded-[2rem] p-8 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 dark:text-white mb-2">Portfolio Delta</h3>
                <div className="relative h-48 flex items-center justify-center scale-110">
                  <svg className="w-32 h-32" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#F1F5F9" className="dark:stroke-slate-800" strokeWidth="8" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#2563EB" strokeWidth="12" strokeDasharray="240 360" transform="rotate(-90 50 50)" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center mt-6">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Fleet Profit</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white font-mono">43.4k</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'bots':
        // If a bot is actively being linking, show the login screen
        if (linkingBotId) {
          return (
            <BotLoginView
              bots={bots.filter(b => b.id === linkingBotId)}
              onLoginSuccess={() => handleBotLoginSuccess(linkingBotId)}
            />
          );
        }

        // Selection Grid (Like Screenshot 1)
        return (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-2 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.4em]">NEURAL HUB: OPERATIONAL</span>
              </div>
              <h2 className="text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter italic">Unit Selection</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-lg mx-auto leading-relaxed italic border-x border-blue-500/20 px-8">
                Select an autonomous neural unit to initiate a secure encrypted bridge between this terminal and the Hugging Face AI core.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {bots.map((bot) => (
                <div
                  key={bot.id}
                  className="group relative bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-xl p-12 rounded-[3.5rem] border border-slate-200 dark:border-white/5 transition-all hover:scale-[1.04] hover:border-blue-500/40 hover:shadow-[0_40px_80px_-20px_rgba(37,99,235,0.2)] overflow-hidden"
                >
                  <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                    <div className="relative">
                      <div
                        className="w-24 h-24 rounded-[2.2rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl transition-all duration-500 group-hover:rotate-[10deg]"
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
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.25em]">{bot.strategy}</p>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-6 pt-8 border-t border-slate-100 dark:border-white/5">
                      <div className="text-left">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">PRECISION</p>
                        <p className="text-lg font-black text-blue-600 font-mono tracking-tighter">{(bot.accuracy * 100).toFixed(0)}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">STATUS</p>
                        <div className="flex items-center justify-end gap-2 mt-1">
                          <span className={`w-2 h-2 rounded-full ${bot.isLinked ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_#10B981]' : 'bg-slate-300'}`}></span>
                          <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase">{bot.status}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => bot.isLinked ? setActiveBotId(bot.id) : setLinkingBotId(bot.id)}
                      className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.35em] transition-all border ${bot.isLinked
                        ? 'bg-emerald-500 text-white border-transparent'
                        : 'bg-slate-900 dark:bg-white/5 text-white group-hover:bg-blue-600 border-transparent'
                        }`}
                    >
                      {bot.isLinked ? 'CONNECTED' : 'INITIALIZE LINK'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'control':
        return (
          <BotCommandCenter
            bot={activeBot} availableAssets={availableAssets} onToggleStatus={handleToggleBot}
            onAssetChange={handleAssetChange} onTimeframeChange={(id, tf) => setBots(prev => prev.map(b => b.id === id ? { ...b, selectedTimeframe: tf } : b))}
            onUpdateBot={handleBotUpdate}
          />
        );
      case 'signals':
        return (
          <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between px-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic">HFT Signal Stream</h2>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Monitoring {availableAssets.length} Pairs globally</p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <SignalFeed signals={signals} activeBotId={activeBotId} />
              </div>
              <div className="space-y-6">
                <div className="bg-white dark:bg-[#0F172A] p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Signal Analytics</h3>
                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">24h Signal Count</span>
                      <span className="text-xl font-black text-slate-900 dark:text-white font-mono">1,432</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Avg Confidence</span>
                      <span className="text-xl font-black text-blue-600 font-mono">92.4%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'assets': return <AssetsView assets={availableAssets} onDeployBot={handleDeployToAsset} />;
      case 'terminal': return <TerminalView bots={bots} />;
      case 'portfolio': return <PortfolioView bots={bots} />;
      case 'settings': return <SettingsView onLogout={handleLogout} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center py-32 opacity-50 space-y-4 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/5 rounded-[3rem]">
            <div className="text-6xl">🚧</div>
            <h2 className="text-xl font-bold text-slate-400 uppercase tracking-[0.2em]">{currentView} is Under Construction</h2>
            <button onClick={() => setCurrentView('dashboard')} className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20">Return to Nazupro</button>
          </div>
        );
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView} onLogout={handleLogout}>
      <div className="space-y-6 lg:space-y-10 pb-32">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic transition-all">
              {VIEW_TITLES[currentView].title}
            </h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">
              {VIEW_TITLES[currentView].subtitle}
            </p>
          </div>
          <div className="hidden md:flex bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/5 p-1 rounded-2xl shadow-sm">
            <button onClick={() => setCurrentView('dashboard')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${currentView === 'dashboard' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400'}`}>Dashboard</button>
            <button onClick={() => setCurrentView('control')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${currentView === 'control' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400'}`}>Tactical</button>
          </div>
        </div>

        {/* Dynamic Bot Fleet Bar */}
        <div className="flex lg:grid lg:grid-cols-5 gap-4 overflow-x-auto no-scrollbar snap-x px-1 sm:px-0">
          {bots.map(bot => (
            <div
              key={bot.id}
              onClick={() => handleBotSwitch(bot.id)}
              className={`min-w-[160px] flex-shrink-0 lg:min-w-0 p-5 lg:p-6 rounded-[2.2rem] border-2 cursor-pointer transition-all duration-500 flex flex-col gap-4 relative overflow-hidden snap-center ${activeBotId === bot.id
                ? 'bg-white dark:bg-[#1E293B] border-blue-600 shadow-2xl scale-[1.03] ring-8 ring-blue-500/5'
                : 'bg-white/60 dark:bg-[#0F172A]/40 border-slate-50 dark:border-white/5'
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white text-xs shadow-lg" style={{ backgroundColor: bot.color }}>{bot.id[0]}</div>
                <span className={`w-2.5 h-2.5 rounded-full ${bot.isLinked ? 'bg-emerald-500 shadow-[0_0_12px_#10B981]' : 'bg-slate-200'}`}></span>
              </div>
              <div>
                <p className={`text-[11px] font-black uppercase italic tracking-tighter ${activeBotId === bot.id ? 'text-blue-600' : 'text-slate-900 dark:text-white'}`}>{bot.name}</p>
                <p className={`text-[10px] font-black mt-2 font-mono italic ${bot.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{bot.pnl.toFixed(2)}% DELTA</p>
              </div>
            </div>
          ))}
        </div>

        {renderContent()}
      </div>

      {/* 🔮 PERSISTENT FLOATING BOT STATUS BAR */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] w-full max-w-2xl px-4 animate-in slide-in-from-bottom-10 duration-700">
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-4 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 pl-2">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg animate-pulse`} style={{ backgroundColor: activeBot.color }}>
              {activeBot.id[0]}
            </div>
            <div>
              <p className="text-[10px] font-black text-white uppercase tracking-tighter leading-none">{activeBot.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2 h-2 rounded-full ${activeBot.status === 'active' ? 'bg-emerald-500 animate-ping' : 'bg-slate-500'}`}></span>
                <span className={`text-[9px] font-black uppercase tracking-widest ${activeBot.status === 'active' ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {activeBot.status === 'active' ? 'TRADING ACTIVE' : 'SYSTEM STANDBY'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end px-4 border-r border-white/10">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">SELECTED ASSET</p>
              <p className="text-xs font-black text-blue-400 uppercase">{activeBot.selected_pair || 'NOT SELECTED'}</p>
            </div>
            <button
              onClick={() => {
                if (!activeBot.selected_pair) return;
                apiService.sendCommand(activeBotId, 'fetch_historical_data', activeBot.selected_pair);
              }}
              disabled={!activeBot.selected_pair}
              className={`p-4 rounded-2xl transition-all shadow-xl active:scale-95 border ${activeBot.selected_pair
                  ? 'bg-blue-600/10 border-blue-600/20 text-blue-400 hover:bg-blue-600/20'
                  : 'bg-slate-800 text-slate-700 border-transparent cursor-not-allowed'
                }`}
              title="Fetch Historical Data"
            >
              🔄
            </button>
            <button
              onClick={() => handleToggleBot(activeBotId)}
              disabled={!activeBot.selected_pair}
              className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 ${activeBot.status === 'active'
                  ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20'
                  : activeBot.selected_pair
                    ? 'bg-[#10B981] text-white hover:bg-emerald-600 shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed grayscale'
                }`}
            >
              {activeBot.status === 'active' ? '🛑 STOP CORE' : activeBot.selected_pair ? '🚀 START CORE' : '⏳ SET ASSET'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default App;
