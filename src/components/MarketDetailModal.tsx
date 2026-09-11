import React from 'react';
import { 
  X, 
  ExternalLink, 
  Layers, 
  ArrowRightLeft, 
  Scale, 
  Clock, 
  Activity, 
  TrendingUp, 
  TrendingDown 
} from 'lucide-react';
import { MarketTicker } from '../types';

interface MarketDetailModalProps {
  ticker: MarketTicker | null;
  onClose: () => void;
}

export const MarketDetailModal: React.FC<MarketDetailModalProps> = ({
  ticker,
  onClose,
}) => {
  if (!ticker) return null;

  const isPositive = ticker.priceChange24hPct >= 0;

  const formatPrice = (price: number) => {
    if (price === 0) return '0.00';
    if (price < 0.0001) return price.toFixed(8);
    if (price < 1) return price.toFixed(4);
    if (price < 100) return price.toFixed(2);
    return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white text-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              {ticker.baseAsset.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {ticker.baseAsset} / {ticker.quoteAsset}
                </h3>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                  Bybit Spot
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Symbol: {ticker.symbol} &bull; Latency: {ticker.latencyMs}ms
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Main Price Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">
                Last Traded Price
              </span>
              <span className="text-2xl font-bold text-slate-900 font-mono mt-0.5 block">
                {formatPrice(ticker.lastPrice)} {ticker.quoteAsset}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-medium text-slate-500 block">
                24h Movement
              </span>
              <span
                className={`inline-flex items-center gap-1 text-sm font-bold font-mono mt-0.5 ${
                  isPositive ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {isPositive ? '+' : ''}{ticker.priceChange24hPct.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Executable Top-of-Book Split */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-indigo-600" />
              <span>Executable Liquidity Quotes</span>
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {/* Best Bid */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                <span className="text-[11px] font-bold text-emerald-800 uppercase block">
                  Best Bid (Instant Sell Price)
                </span>
                <span className="text-lg font-bold text-emerald-950 font-mono mt-1 block">
                  {formatPrice(ticker.bestBid)}
                </span>
                <span className="text-xs text-emerald-700 mt-0.5 block">
                  Available: {ticker.bidSize.toLocaleString()} {ticker.baseAsset}
                </span>
              </div>

              {/* Best Ask */}
              <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/80">
                <span className="text-[11px] font-bold text-rose-800 uppercase block">
                  Best Ask (Instant Buy Price)
                </span>
                <span className="text-lg font-bold text-rose-950 font-mono mt-1 block">
                  {formatPrice(ticker.bestAsk)}
                </span>
                <span className="text-xs text-rose-700 mt-0.5 block">
                  Available: {ticker.askSize.toLocaleString()} {ticker.baseAsset}
                </span>
              </div>
            </div>
          </div>

          {/* Spread & Arbitrage Viability */}
          <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-200/70 text-xs">
            <div className="flex items-center justify-between font-medium text-indigo-950">
              <span>Spread Cost:</span>
              <span className="font-mono font-bold">
                {formatPrice(ticker.spread)} {ticker.quoteAsset} ({ticker.spreadPct.toFixed(4)}%)
              </span>
            </div>
            <p className="mt-1.5 text-indigo-900/80 text-[11px] leading-relaxed">
              <strong>Arbitrage Check:</strong> If an arbitrage path passes through {ticker.symbol}, any theoretical gain must exceed this {ticker.spreadPct.toFixed(4)}% spread plus Bybit's ~0.10% taker fee, otherwise the trade produces a net loss.
            </p>
          </div>

          {/* 24h Statistics */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[10px]">24h High</span>
              <span className="font-mono font-semibold text-slate-800 mt-0.5 block">
                {formatPrice(ticker.high24h)}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[10px]">24h Low</span>
              <span className="font-mono font-semibold text-slate-800 mt-0.5 block">
                {formatPrice(ticker.low24h)}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[10px]">24h Volume</span>
              <span className="font-mono font-semibold text-slate-800 mt-0.5 block">
                {ticker.volume24h > 1000 ? `${(ticker.volume24h / 1000).toFixed(1)}k` : ticker.volume24h.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <a
            href={`https://www.bybit.com/en/trade/spot/${ticker.baseAsset}/${ticker.quoteAsset}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            <span>Verify on Bybit Public Spot</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
