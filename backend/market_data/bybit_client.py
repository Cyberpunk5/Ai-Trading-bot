"""
Bybit Market Client (Public REST & Market Data Engine).
Phase 1: Zero authentication required. No private keys needed.

Fetches real-time market data for 50+ configurable markets:
- Symbol
- Best Bid / Best Ask
- Bid Quantity / Ask Quantity
- Last Traded Price
- 24h Volume
- Timestamp & Measured Latency
- Spread & Stale Check
"""

import json
import time
import urllib.request
import urllib.error
from dataclasses import dataclass
from typing import Dict, List, Optional
from backend.config.settings import (
    BYBIT_REST_API_URL,
    DEFAULT_MONITORED_MARKETS,
    STALE_DATA_TIMEOUT_SECONDS,
)


@dataclass
class MarketTicker:
    """Represents a standardized market ticker snapshot for a single trading pair."""
    symbol: str
    best_bid: float
    best_ask: float
    bid_quantity: float
    ask_quantity: float
    last_price: float
    volume_24h: float
    spread: float
    spread_pct: float
    timestamp_ms: int
    data_latency_ms: float
    is_stale: bool = False

    def to_dict(self) -> dict:
        return {
            "symbol": self.symbol,
            "best_bid": self.best_bid,
            "best_ask": self.best_ask,
            "bid_quantity": self.bid_quantity,
            "ask_quantity": self.ask_quantity,
            "last_price": self.last_price,
            "volume_24h": self.volume_24h,
            "spread": round(self.spread, 6),
            "spread_pct": round(self.spread_pct, 4),
            "timestamp_ms": self.timestamp_ms,
            "data_latency_ms": round(self.data_latency_ms, 2),
            "is_stale": self.is_stale,
        }


@dataclass
class OrderBookLevel:
    price: float
    size: float


@dataclass
class OrderBookSnapshot:
    symbol: str
    bids: List[OrderBookLevel]
    asks: List[OrderBookLevel]
    timestamp_ms: int
    latency_ms: float


class BybitMarketClient:
    """Client for Bybit v5 public market data API."""

    def __init__(self, monitored_symbols: Optional[List[str]] = None):
        self.base_url = BYBIT_REST_API_URL
        self.monitored_symbols = monitored_symbols or DEFAULT_MONITORED_MARKETS
        self.symbol_set = set(self.monitored_symbols)
        self.market_cache: Dict[str, MarketTicker] = {}
        self.last_fetch_time: float = 0.0
        self.last_latency_ms: float = 0.0

    def fetch_all_spot_tickers(self) -> Dict[str, MarketTicker]:
        """
        Fetches all Bybit spot tickers in a single high-efficiency call,
        filters for monitored symbols (50+), and computes spread and latency.
        """
        url = f"{self.base_url}/v5/market/tickers?category=spot"
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "CryptoArbitrageBot/Phase1 (Educational; Python)",
                "Accept": "application/json",
            }
        )

        start_time = time.perf_counter()
        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                raw_bytes = response.read()
                elapsed_ms = (time.perf_counter() - start_time) * 1000.0
                self.last_latency_ms = elapsed_ms
                data = json.loads(raw_bytes.decode("utf-8"))
        except urllib.error.URLError as err:
            print(f"[BybitMarketClient Error] Network request failed: {err}")
            return self.market_cache
        except Exception as err:
            print(f"[BybitMarketClient Error] JSON parse failed: {err}")
            return self.market_cache

        ret_code = data.get("retCode", -1)
        if ret_code != 0:
            print(f"[BybitMarketClient Warning] API returned code {ret_code}: {data.get('retMsg')}")
            return self.market_cache

        raw_list = data.get("result", {}).get("list", [])
        now_ms = int(time.time() * 1000)
        self.last_fetch_time = time.time()

        for item in raw_list:
            sym = item.get("symbol", "")
            if not sym or (self.symbol_set and sym not in self.symbol_set):
                continue

            try:
                best_bid = float(item.get("bid1Price") or 0.0)
                best_ask = float(item.get("ask1Price") or 0.0)
                bid_qty = float(item.get("bid1Size") or 0.0)
                ask_qty = float(item.get("ask1Size") or 0.0)
                last_price = float(item.get("lastPrice") or 0.0)
                volume_24h = float(item.get("volume24h") or 0.0)

                # Spread calculation
                spread = best_ask - best_bid if best_ask > 0 and best_bid > 0 else 0.0
                spread_pct = (spread / best_ask * 100.0) if best_ask > 0 else 0.0

                ticker = MarketTicker(
                    symbol=sym,
                    best_bid=best_bid,
                    best_ask=best_ask,
                    bid_quantity=bid_qty,
                    ask_quantity=ask_qty,
                    last_price=last_price,
                    volume_24h=volume_24h,
                    spread=spread,
                    spread_pct=spread_pct,
                    timestamp_ms=now_ms,
                    data_latency_ms=elapsed_ms,
                    is_stale=False,
                )
                self.market_cache[sym] = ticker
            except (ValueError, TypeError):
                continue

        return self.market_cache

    def fetch_orderbook_snapshot(self, symbol: str, limit: int = 5) -> Optional[OrderBookSnapshot]:
        """
        Fetches an orderbook snapshot for a specific symbol to inspect depth.
        """
        url = f"{self.base_url}/v5/market/orderbook?category=spot&symbol={symbol}&limit={limit}"
        start_time = time.perf_counter()
        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "CryptoArbitrageBot/Phase1 (Educational)"}
            )
            with urllib.request.urlopen(req, timeout=5) as response:
                elapsed_ms = (time.perf_counter() - start_time) * 1000.0
                data = json.loads(response.read().decode("utf-8"))
        except Exception as err:
            print(f"[OrderBook Error] Failed to fetch orderbook for {symbol}: {err}")
            return None

        result = data.get("result", {})
        raw_bids = result.get("b", [])
        raw_asks = result.get("a", [])
        ts = int(result.get("ts", time.time() * 1000))

        bids = [OrderBookLevel(price=float(p), size=float(s)) for p, s in raw_bids if len(p) and len(s)]
        asks = [OrderBookLevel(price=float(p), size=float(s)) for p, s in raw_asks if len(p) and len(s)]

        return OrderBookSnapshot(
            symbol=symbol,
            bids=bids,
            asks=asks,
            timestamp_ms=ts,
            latency_ms=elapsed_ms,
        )

    def check_stale_data(self) -> Dict[str, bool]:
        """Marks markets whose data has not updated within STALE_DATA_TIMEOUT_SECONDS."""
        now_ms = int(time.time() * 1000)
        cutoff_ms = STALE_DATA_TIMEOUT_SECONDS * 1000
        stale_status = {}
        for sym, ticker in self.market_cache.items():
            age_ms = now_ms - ticker.timestamp_ms
            ticker.is_stale = age_ms > cutoff_ms
            stale_status[sym] = ticker.is_stale
        return stale_status


if __name__ == "__main__":
    print("[Testing BybitMarketClient standalone]")
    client = BybitMarketClient()
    tickers = client.fetch_all_spot_tickers()
    print(f"Successfully fetched {len(tickers)} monitored markets.")
    sample = list(tickers.values())[0] if tickers else None
    if sample:
        print(f"Sample market: {sample.symbol}")
        print(f"  Bid: {sample.best_bid} ({sample.bid_quantity} units)")
        print(f"  Ask: {sample.best_ask} ({sample.ask_quantity} units)")
        print(f"  Spread: {sample.spread} ({sample.spread_pct:.4f}%)")
        print(f"  Latency: {sample.data_latency_ms:.1f}ms")
