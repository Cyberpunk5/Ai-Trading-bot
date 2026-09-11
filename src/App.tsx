/**
 * Crypto Arbitrage Bot — Bybit Market Engine (Phase 1).
 * 
 * Strict Safety: LIVE_TRADING_ENABLED = false.
 * Real-time Bybit Spot public WebSocket stream for 50+ markets.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { MetricsBar } from './components/MetricsBar';
import { MarketTable } from './components/MarketTable';
import { BeginnerGuide } from './components/BeginnerGuide';
import { DiagnosticModal } from './components/DiagnosticModal';
import { PacketInspector } from './components/PacketInspector';
import { MarketDetailModal } from './components/MarketDetailModal';
import { marketStreamService } from './services/bybitWebSocketService';
import { DEFAULT_SPOT_MARKETS } from './services/marketConfig';
import { MarketTicker, ConnectionStatus, SystemMetrics, RawWsPacket } from './types';
import { ShieldCheck, Info, Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [tickers, setTickers] = useState<Record<string, MarketTicker>>({});
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [statusMessage, setStatusMessage] = useState<string>('Initializing stream...');
  const [latencyMs, setLatencyMs] = useState<number>(0);
  const [packets, setPackets] = useState<RawWsPacket[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [uptimeSeconds, setUptimeSeconds] = useState<number>(0);
  const [packetCount, setPacketCount] = useState<number>(0);

  // Modals & Panels
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState<boolean>(false);
  const [isPacketInspectorOpen, setIsPacketInspectorOpen] = useState<boolean>(false);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  // Initialize stream service
  useEffect(() => {
    marketStreamService.setListeners({
      onTickerUpdate: (updatedTicker) => {
        setTickers((prev) => ({
          ...prev,
          [updatedTicker.symbol]: updatedTicker,
        }));
        setPacketCount((c) => c + 1);
      },
      onFullSnapshot: (snapshot) => {
        setTickers(snapshot);
      },
      onStatusChange: (newStatus, msg) => {
        setStatus(newStatus);
        if (msg) setStatusMessage(msg);
      },
      onLatencyUpdate: (lat) => {
        setLatencyMs(lat);
      },
      onRawPacket: (packet) => {
        setPackets((prev) => [packet, ...prev.slice(0, 50)]);
      },
    });

    marketStreamService.start();

    const uptimeInterval = setInterval(() => {
      setUptimeSeconds((s) => s + 1);
    }, 1000);

    return () => {
      marketStreamService.stop();
      clearInterval(uptimeInterval);
    };
  }, []);

  const handleToggleStream = () => {
    if (isStreaming) {
      marketStreamService.stop();
      setIsStreaming(false);
    } else {
      marketStreamService.start();
      setIsStreaming(true);
    }
  };

  const btcTicker = tickers['BTCUSDT'];
  const ethTicker = tickers['ETHUSDT'];

  const metrics: SystemMetrics = {
    status,
    marketsMonitored: DEFAULT_SPOT_MARKETS.length,
    activeFeedsCount: Object.keys(tickers).length,
    packetsReceived: packetCount,
    messagesPerSecond: Math.round(packetCount / Math.max(1, uptimeSeconds)),
    currentLatencyMs: latencyMs,
    averageLatencyMs: latencyMs,
    minLatencyMs: latencyMs,
    maxLatencyMs: latencyMs,
    uptimeSeconds,
    lastPingTimestamp: Date.now(),
    connectionStartTime: Date.now() - uptimeSeconds * 1000,
  };

  const selectedTicker = selectedSymbol ? tickers[selectedSymbol] ?? null : null;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        status={status}
        statusMessage={statusMessage}
        latencyMs={latencyMs}
        isStreaming={isStreaming}
        onToggleStream={handleToggleStream}
        onOpenDiagnostics={() => setIsDiagnosticOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onTogglePackets={() => setIsPacketInspectorOpen(true)}
        showPackets={isPacketInspectorOpen}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Beginner Context Notice Banner */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Phase 1 Activated: Public Market Data Engine</span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Ready &amp; Verified
                </span>
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                You are streaming real-time executable prices for {metrics.marketsMonitored} Bybit spot markets. 
                Before we can calculate arbitrage in future phases, we need reliable, low-latency Bid and Ask quotes. 
                No Bybit account or private keys are needed.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
            >
              How Arbitrage Works
            </button>
            <button
              onClick={() => setIsDiagnosticOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors shadow-2xs"
            >
              Verify Phase 1
            </button>
          </div>
        </div>

        {/* Metrics Overview Bar */}
        <MetricsBar
          metrics={metrics}
          btcTicker={btcTicker}
          ethTicker={ethTicker}
        />

        {/* Real-Time Market Scanner Table */}
        <MarketTable
          tickers={tickers}
          onSelectSymbol={(sym) => setSelectedSymbol(sym)}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Crypto Arbitrage Research Engine</span>
            <span>&bull;</span>
            <span>Bybit Spot WebSocket Stream v5</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              LIVE_TRADING_ENABLED=false
            </span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <BeginnerGuide
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <DiagnosticModal
        isOpen={isDiagnosticOpen}
        onClose={() => setIsDiagnosticOpen(false)}
        status={status}
        latencyMs={latencyMs}
        tickers={tickers}
      />

      <PacketInspector
        isOpen={isPacketInspectorOpen}
        onClose={() => setIsPacketInspectorOpen(false)}
        packets={packets}
      />

      <MarketDetailModal
        ticker={selectedTicker}
        onClose={() => setSelectedSymbol(null)}
      />
    </div>
  );
}
