import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Clock, 
  Layers, 
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { MarketTicker } from '../types';

interface MarketTableProps {
  tickers: Record<string, MarketTicker>;
  onSelectSymbol?: (symbol: string) => void;
}

type SortField = 'symbol' | 'lastPrice' | 'spreadPct' | 'volume24h' | 'priceChange24hPct' | 'latencyMs';
type SortOrder = 'asc' | 'desc';

export const MarketTable: React.FC<MarketTableProps> = ({ tickers, onSelectSymbol }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'usdt' | 'cross'>('all');
  const [sortField, setSortField] = useState<SortField>('volume24h');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const tickerList = useMemo(() => Object.values(tickers) as MarketTicker[], [tickers]);

  const filteredAndSortedTickers = useMemo(() => {
    return tickerList
      .filter((ticker) => {
        const query = searchQuery.trim().toUpperCase();
        if (query && !ticker.symbol.includes(query)) {
          return false;
        }

        if (categoryFilter === 'usdt') {
          return ticker.quoteAsset === 'USDT';
        }
        if (categoryFilter === 'cross') {
          return ticker.quoteAsset !== 'USDT';
        }

        return true;
      })
      .sort((a, b) => {
        let valA: number | string = 0;
        let valB: number | string = 0;

        switch (sortField) {
          case 'symbol':
            valA = a.symbol;
            valB = b.symbol;
            return sortOrder === 'asc'
              ? (valA as string).localeCompare(valB as string)
              : (valB as string).localeCompare(valA as string);
          case 'lastPrice':
            valA = a.lastPrice;
            valB = b.lastPrice;
            break;
          case 'spreadPct':
            valA = a.spreadPct;
            valB = b.spreadPct;
            break;
          case 'volume24h':
            valA = a.volume24h * a.lastPrice; // sort by turnover volume
            valB = b.volume24h * b.lastPrice;
            break;
          case 'priceChange24hPct':
            valA = a.priceChange24hPct;
            valB = b.priceChange24hPct;
            break;
          case 'latencyMs':
            valA = a.latencyMs;
            valB = b.latencyMs;
            break;
        }

        return sortOrder === 'asc'
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      });
  }, [tickerList, searchQuery, categoryFilter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'symbol' ? 'asc' : 'desc');
    }
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-indigo-600" />
    ) : (
      <ArrowDown className="w-3 h-3 text-indigo-600" />
    );
  };

  const formatPrice = (price: number) => {
    if (price === 0) return '0.00';
    if (price < 0.0001) return price.toFixed(8);
    if (price < 1) return price.toFixed(4);
    if (price < 100) return price.toFixed(2);
    return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-slate-50/50">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Bybit Live Market Scanner</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">
              {filteredAndSortedTickers.length} of {tickerList.length} Markets
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Streaming executable top-of-book quotes directly from Bybit public endpoints.
          </p>
        </div>

        {/* Filter Pills and Search */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-market-search"
              type="text"
              placeholder="Search symbol (e.g. BTC, SOL)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 w-44 sm:w-56"
            />
          </div>

          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-medium">
            <button
              id="filter-all"
              onClick={() => setCategoryFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({tickerList.length})
            </button>
            <button
              id="filter-usdt"
              onClick={() => setCategoryFilter('usdt')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                categoryFilter === 'usdt'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              USDT Pairs
            </button>
            <button
              id="filter-cross"
              onClick={() => setCategoryFilter('cross')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                categoryFilter === 'cross'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Cross pairs like ETHBTC, SOLBTC for triangular arbitrage"
            >
              Triangular Pairs
            </button>
          </div>
        </div>
      </div>

      {/* Educational Notice Banner */}
      <div className="px-4 py-2 bg-amber-50/70 border-b border-amber-100 flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>
            <strong>Quant Insight:</strong> Notice the difference between <strong>Best Bid</strong> and <strong>Best Ask</strong>. In real arbitrage, you cannot buy at the bid or sell at the ask. Always calculate returns using executable quotes!
          </span>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider select-none">
              <th
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('symbol')}
              >
                <div className="flex items-center gap-1">
                  <span>Market</span>
                  {renderSortIndicator('symbol')}
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors text-right"
                onClick={() => handleSort('lastPrice')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Last Price</span>
                  {renderSortIndicator('lastPrice')}
                </div>
              </th>
              <th className="py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-1" title="Executable selling price">
                  <span className="text-emerald-700">Best Bid (Sell)</span>
                </div>
              </th>
              <th className="py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-1" title="Executable buying price">
                  <span className="text-rose-700">Best Ask (Buy)</span>
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors text-right"
                onClick={() => handleSort('spreadPct')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Spread (%)</span>
                  {renderSortIndicator('spreadPct')}
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors text-right"
                onClick={() => handleSort('priceChange24hPct')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>24h Change</span>
                  {renderSortIndicator('priceChange24hPct')}
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors text-right"
                onClick={() => handleSort('volume24h')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>24h Volume</span>
                  {renderSortIndicator('volume24h')}
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors text-right"
                onClick={() => handleSort('latencyMs')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Latency</span>
                  {renderSortIndicator('latencyMs')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredAndSortedTickers.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  No markets match your filter criteria.
                </td>
              </tr>
            ) : (
              filteredAndSortedTickers.map((ticker) => {
                const isPositive = ticker.priceChange24hPct >= 0;
                const isTightSpread = ticker.spreadPct < 0.05;

                return (
                  <tr
                    key={ticker.symbol}
                    id={`market-row-${ticker.symbol}`}
                    onClick={() => onSelectSymbol && onSelectSymbol(ticker.symbol)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    {/* Symbol */}
                    <td className="py-2.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold tracking-tight">
                          {ticker.baseAsset}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1 py-0.5 rounded">
                          /{ticker.quoteAsset}
                        </span>
                        {ticker.quoteAsset !== 'USDT' && (
                          <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded border border-indigo-200">
                            CROSS
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Last Price */}
                    <td className="py-2.5 px-4 text-right font-medium text-slate-900 font-mono">
                      <span
                        className={`inline-block px-1 py-0.5 rounded transition-all duration-300 ${
                          ticker.priceDirection === 'up'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ticker.priceDirection === 'down'
                            ? 'bg-rose-100 text-rose-800'
                            : ''
                        }`}
                      >
                        {formatPrice(ticker.lastPrice)}
                      </span>
                    </td>

                    {/* Best Bid */}
                    <td className="py-2.5 px-4 text-right font-mono">
                      <div className="text-emerald-700 font-medium">
                        {formatPrice(ticker.bestBid)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {ticker.bidSize.toFixed(2)} units
                      </div>
                    </td>

                    {/* Best Ask */}
                    <td className="py-2.5 px-4 text-right font-mono">
                      <div className="text-rose-700 font-medium">
                        {formatPrice(ticker.bestAsk)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {ticker.askSize.toFixed(2)} units
                      </div>
                    </td>

                    {/* Spread */}
                    <td className="py-2.5 px-4 text-right font-mono">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-medium ${
                          isTightSpread
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {ticker.spreadPct.toFixed(3)}%
                      </span>
                    </td>

                    {/* 24h Change */}
                    <td className="py-2.5 px-4 text-right font-mono">
                      <span
                        className={`font-semibold ${
                          isPositive ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {ticker.priceChange24hPct.toFixed(2)}%
                      </span>
                    </td>

                    {/* 24h Volume */}
                    <td className="py-2.5 px-4 text-right text-slate-600 font-mono text-[11px]">
                      {ticker.volume24h > 1000000
                        ? `${(ticker.volume24h / 1000000).toFixed(2)}M`
                        : ticker.volume24h > 1000
                        ? `${(ticker.volume24h / 1000).toFixed(1)}k`
                        : ticker.volume24h.toFixed(0)}
                    </td>

                    {/* Latency */}
                    <td className="py-2.5 px-4 text-right font-mono text-[11px]">
                      <span
                        className={`inline-flex items-center gap-1 ${
                          ticker.latencyMs < 100
                            ? 'text-emerald-600'
                            : ticker.latencyMs < 300
                            ? 'text-amber-600'
                            : 'text-slate-400'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {ticker.latencyMs}ms
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <span>
          Showing {filteredAndSortedTickers.length} active spot order books on Bybit v5 public stream.
        </span>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Spread &lt; 0.05% (High Liquidity)
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Spread &ge; 0.05% (Cost Consideration)
          </span>
        </div>
      </div>
    </div>
  );
};
