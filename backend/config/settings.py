"""
Configuration and Safety Settings for the Crypto Arbitrage Bot.

IMPORTANT SAFETY DIRECTIVE:
LIVE_TRADING_ENABLED is hardcoded to False.
No real orders can or will be executed in this mode.
No private Bybit API keys are needed for Phase 1.
"""

import os

# ==========================================
# 1. CRITICAL SAFETY SWITCH
# ==========================================
# This MUST remain False until all 10+ phases, testing, and paper trading are completed.
LIVE_TRADING_ENABLED: bool = False

# Starting virtual paper balance (USDT)
PAPER_TRADING_INITIAL_BALANCE: float = 1000.0

# ==========================================
# 2. BYBIT PUBLIC MARKET DATA ENDPOINTS
# ==========================================
# Bybit v5 public spot WebSocket stream (zero auth required)
BYBIT_SPOT_WS_URL: str = "wss://stream.bybit.com/v5/public/spot"
# Bybit v5 public REST API base URL
BYBIT_REST_API_URL: str = "https://api.bybit.com"

# ==========================================
# 3. 50+ MONITORED SPOT MARKETS
# ==========================================
# Top liquidity pairs on Bybit Spot, including cross-pairs for triangular arbitrage
DEFAULT_MONITORED_MARKETS: list[str] = [
    # Top Tier USDT pairs
    "BTCUSDT", "ETHUSDT", "SOLUSDT", "XRPUSDT", "DOGEUSDT",
    "BNBUSDT", "ADAUSDT", "AVAXUSDT", "LINKUSDT", "SUIUSDT",
    "PEPEUSDT", "NEARUSDT", "LTCUSDT", "BCHUSDT", "APTUSDT",
    "ARBUSDT", "OPUSDT", "DOTUSDT", "POLUSDT", "SHIBUSDT",
    "TONUSDT", "RENDERUSDT", "FETUSDT", "INJUSDT", "TIAUSDT",
    "SEIUSDT", "TAOUSDT", "ICPUSDT", "KASUSDT", "XLMUSDT",
    "HBARUSDT", "AAVEUSDT", "UNIUSDT", "FTMUSDT", "ATOMUSDT",
    "ALGOUSDT", "VETUSDT", "FILUSDT", "WLDUSDT", "JUPUSDT",
    "WIFUSDT", "BONKUSDT", "FLOKIUSDT", "STXUSDT", "GALAUSDT",
    "RUNEUSDT", "PENDLEUSDT", "ENAUSDT", "SANDUSDT", "MANAUSDT",
    # Key cross-pairs for triangular cycles (e.g. BTC quote pairs, ETH quote pairs)
    "ETHBTC", "SOLBTC", "LTCBTC", "XRPBTC", "LINKBTC",
    "SOLLTC", "SOLETH", "ADAETH"
]

# Total default markets count: 58 (exceeding the 50+ requirement)
MIN_MONITORED_MARKET_COUNT: int = 50

# ==========================================
# 4. LATENCY & STALE DATA PROTECTION
# ==========================================
# If market data is older than 5.0 seconds, mark as STALE
STALE_DATA_TIMEOUT_SECONDS: float = 5.0

# Alert if roundtrip latency exceeds 250 milliseconds
MAX_ACCEPTABLE_LATENCY_MS: float = 250.0

# WebSocket heartbeat interval in seconds
WS_PING_INTERVAL_SECONDS: int = 20
