/**
 * Core types for Bybit Market Data Engine (Phase 1).
 */

export interface MarketTicker {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  lastPrice: number;
  bestBid: number;
  bestAsk: number;
  bidSize: number;
  askSize: number;
  spread: number;
  spreadPct: number;
  volume24h: number;
  turnover24h: number;
  priceChange24hPct: number;
  high24h: number;
  low24h: number;
  timestamp: number;
  latencyMs: number;
  isStale: boolean;
  priceDirection: 'up' | 'down' | 'neutral';
  lastUpdated: number;
}

export type ConnectionStatus = 'connected' | 'connecting' | 'reconnecting' | 'disconnected' | 'error';

export interface SystemMetrics {
  status: ConnectionStatus;
  marketsMonitored: number;
  activeFeedsCount: number;
  packetsReceived: number;
  messagesPerSecond: number;
  currentLatencyMs: number;
  averageLatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  uptimeSeconds: number;
  lastPingTimestamp: number;
  connectionStartTime: number;
}

export interface RawWsPacket {
  id: string;
  timestamp: string;
  topic: string;
  type: 'snapshot' | 'delta' | 'pong' | 'subscribe' | 'system';
  dataSummary: string;
  rawJson: string;
}

export interface DiagnosticCheck {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  details?: string;
  timestamp?: number;
}
