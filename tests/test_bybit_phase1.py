"""
Automated Test Suite for Phase 1: Bybit Market Data Engine.

Validates:
1. Safety switch is strictly LIVE_TRADING_ENABLED=False.
2. At least 50 configurable markets are monitored.
3. Live Bybit public market data is fetched without authentication.
4. All required fields are present (symbol, best_bid, best_ask, quantities, last price, volume, latency).
5. Bid/Ask spread integrity.
6. WebSocket batch payloads and message parser.
"""

import unittest
import json
from backend.config.settings import (
    LIVE_TRADING_ENABLED,
    DEFAULT_MONITORED_MARKETS,
    MIN_MONITORED_MARKET_COUNT,
)
from backend.market_data.bybit_client import BybitMarketClient, MarketTicker
from backend.market_data.bybit_websocket import BybitWebSocketManager


class TestBybitPhase1(unittest.TestCase):

    def test_01_safety_configuration(self):
        """CRITICAL: Ensure live trading is disabled by default."""
        self.assertFalse(
            LIVE_TRADING_ENABLED,
            "CRITICAL VIOLATION: LIVE_TRADING_ENABLED must be False."
        )

    def test_02_monitored_markets_count(self):
        """Verify that at least 50 markets are configured."""
        count = len(DEFAULT_MONITORED_MARKETS)
        self.assertGreaterEqual(
            count,
            MIN_MONITORED_MARKET_COUNT,
            f"Configured markets count ({count}) is less than required {MIN_MONITORED_MARKET_COUNT}."
        )

    def test_03_public_market_data_live_fetch(self):
        """
        Verify live Bybit spot tickers can be fetched without authentication.
        """
        client = BybitMarketClient()
        tickers = client.fetch_all_spot_tickers()
        self.assertGreaterEqual(
            len(tickers),
            30,  # At least 30+ of our 58 configured pairs should be actively returned
            "Failed to fetch sufficient active spot tickers from Bybit."
        )

        # Check required fields on sample ticker
        sample_symbol = "BTCUSDT" if "BTCUSDT" in tickers else list(tickers.keys())[0]
        ticker: MarketTicker = tickers[sample_symbol]

        self.assertIsNotNone(ticker.symbol)
        self.assertGreater(ticker.best_bid, 0, "Best bid must be greater than 0")
        self.assertGreater(ticker.best_ask, 0, "Best ask must be greater than 0")
        self.assertGreaterEqual(ticker.best_ask, ticker.best_bid, "Best ask must be >= best bid")
        self.assertGreaterEqual(ticker.bid_quantity, 0, "Bid quantity must be non-negative")
        self.assertGreaterEqual(ticker.ask_quantity, 0, "Ask quantity must be non-negative")
        self.assertGreater(ticker.last_price, 0, "Last price must be positive")
        self.assertGreater(ticker.timestamp_ms, 0, "Timestamp must be recorded")
        self.assertGreaterEqual(ticker.data_latency_ms, 0, "Latency must be measured")

    def test_04_websocket_subscription_batches(self):
        """Verify WebSocket subscription batches do not exceed 10 topics per message."""
        manager = BybitWebSocketManager(symbols=DEFAULT_MONITORED_MARKETS)
        payloads = manager.get_subscription_payloads(batch_size=10)
        self.assertGreater(len(payloads), 0)
        for p in payloads:
            self.assertEqual(p.get("op"), "subscribe")
            self.assertLessEqual(len(p.get("args", [])), 10, "Bybit limits topics to 10 per message")

    def test_05_websocket_message_parser(self):
        """Verify WebSocket raw message parsing and latency calculation."""
        manager = BybitWebSocketManager()
        mock_raw = json.dumps({
            "topic": "tickers.BTCUSDT",
            "ts": 1700000000000,
            "type": "snapshot",
            "data": {
                "symbol": "BTCUSDT",
                "lastPrice": "65000.5",
                "highPrice24h": "66000.0",
                "lowPrice24h": "64000.0",
                "volume24h": "5420.5",
                "price24hPcnt": "0.015"
            }
        })
        result = manager.handle_raw_message(mock_raw)
        self.assertIsNotNone(result)
        self.assertEqual(result.get("type"), "ticker")
        data = result.get("data", {})
        self.assertEqual(data.get("symbol"), "BTCUSDT")
        self.assertEqual(data.get("last_price"), 65000.5)


if __name__ == "__main__":
    unittest.main()
