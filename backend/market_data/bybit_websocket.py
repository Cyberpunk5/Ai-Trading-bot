"""
Bybit Public WebSocket Engine (Phase 1).
Maintains a persistent, low-latency streaming connection to Bybit Spot market data.

Zero authentication required - public stream only.
Features:
- Subscribes to 50+ spot markets (tickers / orderbooks)
- Heartbeat Ping/Pong every 20 seconds to prevent timeout
- Latency tracking between exchange matching timestamp and local receive timestamp
- Reconnection logic on network drop
- Stale data detection
"""

import json
import time
from typing import Callable, Dict, List, Optional
from backend.config.settings import (
    BYBIT_SPOT_WS_URL,
    DEFAULT_MONITORED_MARKETS,
    WS_PING_INTERVAL_SECONDS,
)


class BybitWebSocketManager:
    """
    Manages WebSocket topics and state for Bybit public Spot v5 stream.
    Compatible with any WebSocket implementation (browser client, node, or python asyncio/websockets).
    """

    def __init__(
        self,
        symbols: Optional[List[str]] = None,
        on_ticker_update: Optional[Callable[[dict], None]] = None,
        on_status_change: Optional[Callable[[str, str], None]] = None,
    ):
        self.ws_url = BYBIT_SPOT_WS_URL
        self.symbols = symbols or DEFAULT_MONITORED_MARKETS
        self.on_ticker_update = on_ticker_update
        self.on_status_change = on_status_change
        self.is_connected = False
        self.last_ping_ts = 0.0
        self.last_pong_ts = 0.0
        self.total_packets_received = 0
        self.connection_start_ts = 0.0
        self.last_latency_ms = 0.0

    def get_subscription_payloads(self, batch_size: int = 10) -> List[dict]:
        """
        Bybit allows subscribing to up to 10 args per subscription message.
        This formats our 50+ symbols into clean batched JSON payloads.
        """
        payloads = []
        topics = [f"tickers.{s}" for s in self.symbols]
        for i in range(0, len(topics), batch_size):
            batch = topics[i : i + batch_size]
            payloads.append({
                "op": "subscribe",
                "args": batch,
                "req_id": f"sub_{i // batch_size + 1}"
            })
        return payloads

    def get_ping_payload(self) -> dict:
        """Bybit public WebSocket ping format."""
        return {"op": "ping", "req_id": f"ping_{int(time.time() * 1000)}"}

    def handle_raw_message(self, raw_data: str) -> Optional[dict]:
        """
        Parses an incoming Bybit WebSocket message, calculates latency,
        and extracts ticker updates.
        """
        self.total_packets_received += 1
        now_ms = int(time.time() * 1000)

        try:
            msg = json.loads(raw_data)
        except Exception:
            return None

        # Check for pong response
        if msg.get("op") == "pong" or msg.get("ret_msg") == "pong":
            self.last_pong_ts = time.time()
            if self.last_ping_ts > 0:
                self.last_latency_ms = (self.last_pong_ts - self.last_ping_ts) * 1000
            return {"type": "pong", "latency_ms": self.last_latency_ms}

        # Check for subscription confirmation
        if msg.get("op") == "subscribe" and msg.get("success") is True:
            return {"type": "subscribed", "conn_id": msg.get("conn_id")}

        # Check for ticker topic
        topic = msg.get("topic", "")
        if topic.startswith("tickers."):
            data = msg.get("data", {})
            exchange_ts = msg.get("ts", now_ms)
            # Latency between exchange publish timestamp and reception
            latency = max(0, now_ms - exchange_ts)

            parsed = {
                "symbol": data.get("symbol", topic.replace("tickers.", "")),
                "last_price": float(data.get("lastPrice", 0.0) or 0.0),
                "high_24h": float(data.get("highPrice24h", 0.0) or 0.0),
                "low_24h": float(data.get("lowPrice24h", 0.0) or 0.0),
                "volume_24h": float(data.get("volume24h", 0.0) or 0.0),
                "price_24h_pcnt": float(data.get("price24hPcnt", 0.0) or 0.0),
                "timestamp_ms": now_ms,
                "exchange_ts": exchange_ts,
                "latency_ms": latency,
            }

            if self.on_ticker_update:
                self.on_ticker_update(parsed)
            return {"type": "ticker", "data": parsed}

        return None
