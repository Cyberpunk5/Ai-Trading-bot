/**
 * Market configuration for Bybit Spot pairs.
 * Includes 55+ top liquid spot markets and key cross-pairs for triangular loops.
 */

export const DEFAULT_SPOT_MARKETS: string[] = [
  // Top tier USDT markets
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
  // Cross-asset pairs (essential for triangular cycles like USDT -> BTC -> ETH -> USDT)
  "ETHBTC", "SOLBTC", "LTCBTC", "XRPBTC", "LINKBTC",
  "SOLLTC", "SOLETH", "ADAETH"
];

export function parseSymbolAssets(symbol: string): { base: string; quote: string } {
  const quoteSuffixes = ["USDT", "USDC", "BTC", "ETH", "EUR"];
  for (const quote of quoteSuffixes) {
    if (symbol.endsWith(quote) && symbol.length > quote.length) {
      return {
        base: symbol.slice(0, -quote.length),
        quote: quote,
      };
    }
  }
  return { base: symbol, quote: "UNKNOWN" };
}
