import React from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  HelpCircle, 
  Terminal, 
  Play, 
  Pause 
} from 'lucide-react';
import { ConnectionStatus } from '../types';

interface HeaderProps {
  status: ConnectionStatus;
  statusMessage?: string;
  latencyMs: number;
  isStreaming: boolean;
  onToggleStream: () => void;
  onOpenDiagnostics: () => void;
  onOpenGuide: () => void;
  onTogglePackets: () => void;
  showPackets: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  statusMessage,
  latencyMs,
  isStreaming,
  onToggleStream,
  onOpenDiagnostics,
  onOpenGuide,
  onTogglePackets,
  showPackets,
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return (
          <span id="ws-status-connected" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Connected to Bybit Stream
          </span>
        );
      case 'connecting':
        return (
          <span id="ws-status-connecting" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Connecting...
          </span>
        );
      case 'reconnecting':
        return (
          <span id="ws-status-reconnecting" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Reconnecting
          </span>
        );
      case 'error':
        return (
          <span id="ws-status-error" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <WifiOff className="w-3 h-3 text-rose-500" />
            Connection Error
          </span>
        );
      case 'disconnected':
      default:
        return (
          <span id="ws-status-disconnected" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <WifiOff className="w-3 h-3" />
            Disconnected
          </span>
        );
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Logo & Phase Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm font-bold tracking-wider text-base">
            BY
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Crypto Arbitrage Bot
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Phase 1: Market Engine
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Bybit Spot Public Market Stream &bull; Zero Authentication &bull; Paper Mode
            </p>
          </div>
        </div>

        {/* Status & Control Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* CRITICAL SAFETY BADGE */}
          <div 
            id="safety-lock-badge"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs"
            title="Safe Mode is enforced. Real order placement is strictly disabled."
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>LIVE_TRADING_ENABLED=false</span>
          </div>

          {/* Connection Status */}
          {getStatusBadge()}

          {/* Latency Pill */}
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200">
            <Activity className="w-3.5 h-3.5 text-slate-400" />
            <span>{latencyMs > 0 ? `${latencyMs}ms` : '--'}</span>
          </div>

          {/* Pause / Resume Button */}
          <button
            id="btn-toggle-stream"
            onClick={onToggleStream}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              isStreaming
                ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
            }`}
          >
            {isStreaming ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Connect Stream</span>
              </>
            )}
          </button>

          {/* Live Packet Inspector Toggle */}
          <button
            id="btn-toggle-packets"
            onClick={onTogglePackets}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              showPackets
                ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-indigo-600" />
            <span>Raw Packets</span>
          </button>

          {/* Automated Diagnostics Test */}
          <button
            id="btn-run-diagnostics"
            onClick={onOpenDiagnostics}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Run Diagnostics</span>
          </button>

          {/* Beginner Guide */}
          <button
            id="btn-open-guide"
            onClick={onOpenGuide}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Open Beginner Trading Guide"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Guide</span>
          </button>
        </div>
      </div>
    </header>
  );
};
