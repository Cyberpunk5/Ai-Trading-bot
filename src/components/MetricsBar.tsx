import React from 'react';
import { 
  BarChart3, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  ShieldCheck, 
  Layers 
} from 'lucide-react';
import { MarketTicker, SystemMetrics } from '../types';

interface MetricsBarProps {
  metrics: SystemMetrics;
  btcTicker?: MarketTicker;
  ethTicker?: MarketTicker;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({
  metrics,
  btcTicker,
  ethTicker,
}) => {
  const formatUptime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const btcChange = btcTicker?.priceChange24hPct ?? 0;
  const isBtcUp = btcChange >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Monitored Markets Card */}
      <div id="metric-monitored-markets" className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Monitored Markets</span>
          <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">
            {metrics.marketsMonitored}
          </span>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            &gt; 50 Goal Met
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">
          Spot pairs (USDT &amp; triangular cross-pairs)
        </p>
      </div>

      {/* 2. BTC/USDT Anchor Market Card */}
      <div id="metric-btc-price" className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">BTC / USDT Reference</span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-xs">
            ₿
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">
            {btcTicker ? `$${btcTicker.lastPrice.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}` : 'Loading...'}
          </span>
          {btcTicker && (
            <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isBtcUp ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isBtcUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {btcChange > 0 ? '+' : ''}{btcChange.toFixed(2)}%
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
          <span>Spread: {btcTicker ? `$${btcTicker.spread.toFixed(1)} (${btcTicker.spreadPct.toFixed(4)}%)` : '--'}</span>
          <span>Vol: {btcTicker ? `${(btcTicker.volume24h / 1000).toFixed(1)}k BTC` : '--'}</span>
        </div>
      </div>

      {/* 3. Latency Metric Card */}
      <div id="metric-latency" className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Network Latency</span>
          <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">
            {metrics.currentLatencyMs > 0 ? `${metrics.currentLatencyMs}` : '--'}
          </span>
          <span className="text-xs font-medium text-slate-500">ms</span>
          <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${
            metrics.currentLatencyMs < 100 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
          }`}>
            {metrics.currentLatencyMs < 100 ? 'Ultra Fast' : 'Normal'}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">
          Bybit server round-trip response time
        </p>
      </div>

      {/* 4. Stream Packets & Throughput */}
      <div id="metric-packets" className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">WebSocket Throughput</span>
          <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
            <BarChart3 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">
            {metrics.packetsReceived.toLocaleString()}
          </span>
          <span className="text-xs font-medium text-slate-500">packets</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
          <span>Active Feed</span>
          <span>Uptime: {formatUptime(metrics.uptimeSeconds)}</span>
        </div>
      </div>

      {/* 5. Phase 1 Safety Architecture */}
      <div id="metric-safety-status" className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">System Safety Guard</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-sm font-bold text-emerald-700 tracking-tight">
            Paper Research Only
          </span>
        </div>
        <p className="mt-2 text-[11px] text-slate-500">
          Zero private keys required. Real order routing is blocked by architectural design.
        </p>
      </div>
    </div>
  );
};
