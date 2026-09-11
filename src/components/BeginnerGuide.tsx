import React from 'react';
import { 
  HelpCircle, 
  X, 
  ShieldCheck, 
  Zap, 
  ArrowRightLeft, 
  Scale, 
  AlertTriangle, 
  CheckCircle2 
} from 'lucide-react';

interface BeginnerGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BeginnerGuide: React.FC<BeginnerGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white text-slate-900 w-full max-w-3xl max-h-[85vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Beginner's Trading &amp; Arbitrage Primer
              </h3>
              <p className="text-xs text-slate-500">
                Essential concepts explained without confusing jargon
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Card 1: Safety Directive */}
          <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-emerald-950">
                  Why is LIVE_TRADING_ENABLED strictly set to false?
                </h4>
                <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                  In quantitative trading, amateur bots lose money because they deploy before understanding fees, latency, and slippage. By locking real trading out of the system, we can safely test mathematical models with zero financial risk. We do not need or want your private API keys or real money.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Bid vs Ask */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-start gap-3">
              <Scale className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900">
                  The Golden Rule: Best Bid vs. Best Ask
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Every order book has two sides:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                    <span className="font-bold block">Best Bid (Sell Price)</span>
                    The highest price someone is willing to pay. When your bot sells, it receives the Bid.
                  </div>
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900">
                    <span className="font-bold block">Best Ask (Buy Price)</span>
                    The lowest price someone is willing to accept. When your bot buys, it pays the Ask.
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  <strong>Common beginner mistake:</strong> Comparing "Last Traded Price" across markets. Last traded price is historical! You can only execute at the current Bid or Ask.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Spread & Slippage */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900">
                  What is the "Spread" and why does it eat profits?
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  The spread is the gap between Ask and Bid (<code>Spread = Ask - Bid</code>). If you buy and instantly sell at the same second, you immediately lose the spread plus two exchange fees (e.g. 0.1% each). Any theoretical arbitrage must be larger than the spread, exchange fees, and estimated price slippage to be profitable.
                </p>
              </div>
            </div>
          </div>

          {/* Card 4: Triangular Arbitrage */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-start gap-3">
              <ArrowRightLeft className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900">
                  What is Triangular Arbitrage?
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Triangular arbitrage exploits temporary pricing discrepancies between three currency pairs on the same exchange:
                </p>
                <div className="mt-2 p-3 rounded-lg bg-purple-50/50 border border-purple-200 font-mono text-xs text-purple-900">
                  Step 1: Start with 1,000 USDT &rarr; Buy BTC (via BTC/USDT)<br />
                  Step 2: Take that BTC &rarr; Buy ETH (via ETH/BTC cross pair)<br />
                  Step 3: Sell ETH &rarr; Back to USDT (via ETH/USDT)<br />
                  Result: If final USDT &gt; 1,000 (after 3 trades and 3 fee deductions), you made a profit!
                </div>
              </div>
            </div>
          </div>

          {/* Card 5: WebSockets vs REST */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900">
                  Why WebSockets instead of REST?
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  REST requires sending a new HTTP request over and over (polling), which introduces high latency and rate limits. A WebSocket establishes a persistent, open bi-directional pipe: the microsecond Bybit's engine updates an order, it streams straight into our scanner with millisecond speed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Phase 1 Foundation: Real-Time Data Engine
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors text-xs font-medium"
          >
            I Understand — Back to Scanner
          </button>
        </div>
      </div>
    </div>
  );
};
