# AI-Assisted Crypto Arbitrage Bot — Bybit (Phase 1)

## 🛡️ Critical Safety Notice
- **`LIVE_TRADING_ENABLED=false` is permanently active.**
- **No real money is at risk.**
- **No private API keys or deposit accounts are required.**
- All market data is retrieved exclusively from Bybit's public, unauthenticated data stream.

---

## 🎯 Project Overview
This system is an engineering-grade cryptocurrency arbitrage research, detection, and paper-trading platform built for Bybit Spot markets. 

### What is Arbitrage?
Arbitrage is the practice of capitalizing on temporary price discrepancies between correlated markets (for example, converting USDT → BTC → ETH → USDT). However, in real-world trading, **apparent profits are often illusory** due to exchange fees, bid/ask spreads, order execution slippage, and latency. 

Our goal is to build a rigorous detection and validation pipeline before ever placing a single simulated or real trade.

---

## 🚀 Phase 1: Real-Time Market Data Engine
In this initial phase, we have established:
1. **Bybit Public WebSocket Stream**: Live connection to `wss://stream.bybit.com/v5/public/spot`.
2. **50+ Configurable Spot Markets**: Real-time tracking of top cryptocurrency pairs (e.g., BTC, ETH, SOL, XRP, DOGE, plus triangular cross-pairs like ETHBTC and SOLBTC).
3. **Data Integrity Metrics**:
   - **Best Bid & Best Ask** (the real executable prices, not just the last trade).
   - **Order Quantities** (liquidity available at the top of the book).
   - **Spread & Spread %** (cost of crossing the market).
   - **Roundtrip Network Latency** (measured in milliseconds).
   - **Stale Data Detector** (identifies frozen feeds).
4. **Interactive Visual Dashboard**: A modern web interface displaying streaming prices, latency monitors, and raw packet inspection.

---

## 🧪 Testing Phase 1

To run the automated test suite:
```bash
python3 -m unittest tests/test_bybit_phase1.py
```
Expected output:
```
Ran 5 tests in 0.25s
OK
```

---

## 📚 Key Trading Terms (For Beginners)

- **Bid**: The highest price a buyer is currently willing to pay. If you want to sell instantly, this is your price.
- **Ask**: The lowest price a seller is currently willing to accept. If you want to buy instantly, this is your price.
- **Spread**: The difference between the Ask and the Bid (`Ask - Bid`). The smaller the spread, the more liquid the market.
- **WebSocket**: A two-way open connection where the exchange instantly pushes new prices to us the millisecond they change, unlike REST which requires constantly asking "any new price?".
- **Latency**: The time (in milliseconds) it takes for a market price update to travel from Bybit's servers to our engine.
