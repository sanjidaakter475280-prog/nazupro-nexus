
import React, { useState, useMemo } from 'react';
import { Asset } from '../../types';

interface AssetsViewProps {
  assets: Asset[];
  onDeployBot: (symbol: string) => void;
}

const Sparkline: React.FC<{ color: string }> = ({ color }) => {
  // Generates a simple random SVG path for the sparkline effect
  const points = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => `${i * 10},${Math.random() * 20 + 5}`).join(' ');
  }, []);

  return (
    <svg className="w-16 h-8 opacity-50" viewBox="0 0 90 30">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

export const AssetsView: React.FC<AssetsViewProps> = ({ assets, onDeployBot }) => {
  const [filter, setFilter] = useState<'All' | 'Crypto' | 'OTC' | 'Forex'>('All');
  const [search, setSearch] = useState('');

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesFilter = filter === 'All' || asset.marketType === filter;
      const matchesSearch = asset.symbol.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [assets, filter, search]);

  const stats = useMemo(() => {
    const avgPayout = assets.reduce((acc, a) => acc + a.payout, 0) / assets.length;
    return {
      total: assets.length,
      avgPayout: avgPayout.toFixed(1),
      hotSector: 'OTC Markets'
    };
  }, [assets]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header & Market Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Liquidity Hub</h2>
          <p className="text-sm text-slate-400 font-medium">Explore and deploy bots to high-yield global markets.</p>
        </div>
        <div className="flex gap-8">
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Pairs</p>
            <p className="text-xl font-black text-slate-900 font-mono">{stats.total}</p>
          </div>
          <div className="w-px h-10 bg-slate-100 self-center"></div>
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Payout</p>
            <p className="text-xl font-black text-emerald-500 font-mono">{stats.avgPayout}%</p>
          </div>
          <div className="w-px h-10 bg-slate-100 self-center"></div>
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <p className="text-xs font-black text-slate-900 uppercase">Live</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex bg-white border border-slate-200 p-1 rounded-2xl shadow-sm w-full md:w-auto">
          {['All', 'Crypto', 'OTC', 'Forex'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat as any)}
              className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                filter === cat ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        </div>
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAssets.map((asset) => (
          <div
            key={asset.symbol}
            className="group bg-white border border-slate-200 p-6 rounded-[2rem] hover:border-blue-500 hover:shadow-xl hover:scale-[1.02] transition-all relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900 tracking-tight">{asset.symbol}</span>
                  {asset.marketType === 'OTC' && (
                    <span className="bg-orange-50 text-orange-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase border border-orange-100">OTC</span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{asset.marketType} Market</span>
              </div>
              <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100">
                <span className="text-[10px] font-black font-mono">{asset.payout}%</span>
              </div>
            </div>

            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Live Price</p>
                <p className="text-xl font-black text-slate-900 font-mono tracking-tighter">
                  {asset.price.toFixed(asset.price > 100 ? 2 : 5)}
                </p>
                <p className={`text-[10px] font-bold mt-1 ${asset.change24h >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {asset.change24h >= 0 ? '▲' : '▼'} {Math.abs(asset.change24h).toFixed(2)}%
                </p>
              </div>
              <Sparkline color={asset.change24h >= 0 ? '#10B981' : '#EF4444'} />
            </div>

            <button
              onClick={() => onDeployBot(asset.symbol)}
              className="w-full py-3 bg-slate-50 group-hover:bg-blue-600 group-hover:text-white border border-slate-100 group-hover:border-blue-500 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
            >
              Deploy Unit
            </button>
            
            {/* Subtle glow effect on hover */}
            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all"></div>
          </div>
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <div className="py-20 text-center bg-white border border-slate-200 rounded-[2rem]">
          <span className="text-4xl mb-4 block">📡</span>
          <h3 className="text-lg font-black text-slate-900">No signals found</h3>
          <p className="text-sm text-slate-400 font-medium">Try adjusting your filters or searching for another pair.</p>
        </div>
      )}
    </div>
  );
};
