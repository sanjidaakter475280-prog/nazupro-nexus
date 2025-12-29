import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Label
} from 'recharts';
import { PricePoint, Asset, Timeframe } from '../../types';

interface LiveChartProps {
  data: PricePoint[];
  selectedAsset: Asset;
  availableAssets: Asset[];
  onAssetChange: (symbol: string) => void;
  selectedTimeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
}

const Candlestick = (props: any) => {
  const { x, y, width, height, open, close, low, high } = props;
  const isUp = close >= open;
  const color = isUp ? '#2563EB' : '#EF4444';
  const wickX = x + width / 2;
  const bodyWidth = width * 0.5;
  const bodyX = x + (width - bodyWidth) / 2;
  const bodyHeight = Math.max(Math.abs(open - close), 1);
  const scale = height / (Math.abs(open - close) || 0.0001);
  const wickHighY = y - (high - Math.max(open, close)) * scale;
  const wickLowY = y + height + (Math.min(open, close) - low) * scale;

  return (
    <g>
      <line x1={wickX} y1={wickHighY} x2={wickX} y2={wickLowY} stroke={color} strokeWidth={1} />
      <rect x={bodyX} y={y} width={bodyWidth} height={bodyHeight} fill={color} rx={0.5} />
    </g>
  );
};

export const LiveChart: React.FC<LiveChartProps> = ({
  data: initialData,
  selectedAsset,
  availableAssets,
  onAssetChange,
  selectedTimeframe,
  onTimeframeChange
}) => {
  const [data, setData] = React.useState<PricePoint[]>(initialData || []);
  const [latestPrice, setLatestPrice] = React.useState<number>(selectedAsset.price);

  // 🔧 NEW: Fetch shared candle data on mount & change
  React.useEffect(() => {
    const fetchCandles = async () => {
      try {
        // Use the new shared API
        const candles = await import('../../services/apiService').then(m => m.apiService.getCandles(selectedAsset.symbol, selectedTimeframe));
        if (candles && candles.length > 0) {
          // Map SharedCandle to PricePoint
          const mappedData: PricePoint[] = candles.map(c => ({
            time: new Date(c.time).getTime(),
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close
          }));
          setData(mappedData);
          setLatestPrice(mappedData[mappedData.length - 1].close);
        } else {
          // Keep initial data if fetch fails or is empty
          setData(initialData);
        }
      } catch (err) {
        console.error("Chart data fetch error:", err);
      }
    };
    fetchCandles();

    // Optional: Polling for updates (or rely on socket)
    const interval = setInterval(fetchCandles, 2000); // 2s polling for live feel
    return () => clearInterval(interval);

  }, [selectedAsset.symbol, selectedTimeframe, initialData]);

  const chartData = useMemo(() => data.map(d => ({
    ...d,
    displayHeight: Math.abs(d.open - d.close),
  })), [data]);

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden h-[500px]">
      <div className="h-14 border-b border-slate-100 px-6 flex items-center justify-between bg-slate-50/50">
        <div className="flex gap-4">
          {['1h', '6h', '1d', 'Indicators', 'Binance'].map((item) => (
            <button key={item} className="text-xs font-bold text-slate-500 hover:text-slate-900">{item}</button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          {/* Dropdown for Asset Selection */}
          <select
            value={selectedAsset.symbol}
            onChange={(e) => onAssetChange(e.target.value)}
            className="bg-transparent text-xs font-bold text-blue-600 focus:outline-none cursor-pointer"
          >
            {availableAssets.map(a => (
              <option key={a.symbol} value={a.symbol}>{a.symbol}</option>
            ))}
          </select>

          <div className="flex gap-2 border-l border-slate-200 pl-4">
            <button className="text-slate-400">🔍</button>
            <button className="text-slate-400">⚙️</button>
            <button className="text-slate-400">⛶</button>
          </div>
        </div>
      </div>

      <div className="p-4 flex gap-4 text-[10px] font-mono border-b border-slate-50">
        <span className="text-slate-400 uppercase">bot.{selectedAsset.symbol} • {selectedTimeframe}</span>
        <span className="text-emerald-500">O {latestPrice.toFixed(4)}</span>
        <span className="text-emerald-500">H {(latestPrice * 1.001).toFixed(4)}</span>
        <span className="text-rose-500">L {(latestPrice * 0.999).toFixed(4)}</span>
        <span className="text-emerald-500">C {latestPrice.toFixed(4)}</span>
      </div>

      <div className="flex-1 relative p-4 bg-white">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#F1F5F9" />
            <XAxis dataKey="time" hide />
            <YAxis
              domain={['auto', 'auto']}
              orientation="right"
              tick={{ fill: '#94A3B8', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <ReferenceLine y={latestPrice} stroke="#2563EB" strokeDasharray="3 3">
              <Label
                value={latestPrice.toFixed(4)}
                position="right"
                fill="#2563EB"
                className="font-mono text-[10px] font-bold"
              />
            </ReferenceLine>
            <Bar dataKey="displayHeight" shape={<Candlestick />} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="h-10 bg-slate-50 border-t border-slate-100 px-6 flex items-center justify-between text-[10px] font-bold text-slate-400">
        <div className="flex gap-4">
          {['1m', '5m', '15m', '1h', '4h'].map(t => (
            <span
              key={t}
              className={`cursor-pointer hover:text-slate-600 ${t === selectedTimeframe ? 'text-blue-600 font-black' : ''}`}
              onClick={() => onTimeframeChange(t as any)}
            >
              {t}
            </span>
          ))}
        </div>
        <div className="flex gap-4">
          <span>{new Date().toLocaleTimeString()} (UTC+6)</span>
          <span>Shared DB Connection: Active</span>
        </div>
      </div>
    </div>
  );
};
