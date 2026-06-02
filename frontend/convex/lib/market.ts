// Deterministic mock market feed, ported from MockMarketDataService.
import type { Candle, MarketSnapshot } from "./types";
import { round5 } from "./util";

export function buildMarket(symbol: string): MarketSnapshot {
  symbol = symbol.toUpperCase();
  const base = symbol === "EUR_USD" ? 1.084 : 1.25;

  // Current minute, zeroed seconds/milliseconds, in UTC.
  const now = new Date();
  now.setUTCSeconds(0, 0);
  const nowMs = now.getTime();

  const candles: Candle[] = [];
  let previous = base;
  for (let index = 0; index < 80; index++) {
    const close = base + index * 0.00002 + Math.sin(index / 5) * 0.00012;
    const timestamp = new Date(nowMs - (79 - index) * 60_000).toISOString();
    candles.push({
      timestamp,
      open: previous,
      high: Math.max(previous, close) + 0.00012,
      low: Math.min(previous, close) - 0.00012,
      close,
      volume: 1_000 + index * 8,
    });
    previous = close;
  }

  const bid = candles[candles.length - 1].close;
  const ask = bid + 0.00012;
  return {
    symbol,
    candles,
    bid: round5(bid),
    ask: round5(ask),
    spread: round5(ask - bid),
    session: "overlap",
    as_of: new Date().toISOString(),
  };
}
