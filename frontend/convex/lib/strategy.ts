// Deterministic strategy candidate generation, ported from StrategyEngine.
// LLM prose never enters this path.
import type {
  IndicatorSnapshot,
  MarketSnapshot,
  Side,
  TradeCandidate,
} from "./types";
import { round5 } from "./util";

const DEFAULT_UNITS = 10_000;
const DEFAULT_RISK_AMOUNT = 75.0;

export function generate(
  market: MarketSnapshot,
  indicators: IndicatorSnapshot,
): TradeCandidate {
  const rationale = [
    `EMA regime: ${indicators.regime}`,
    `RSI: ${indicators.rsi}`,
    `ATR: ${indicators.atr}`,
  ];

  let side: Side = "hold";
  if (indicators.session_allowed && indicators.spread_allowed) {
    if (
      indicators.ema_fast > indicators.ema_slow &&
      indicators.rsi >= 45 &&
      indicators.rsi <= 72
    ) {
      side = "buy";
    } else if (
      indicators.ema_fast < indicators.ema_slow &&
      indicators.rsi >= 28 &&
      indicators.rsi <= 55
    ) {
      side = "sell";
    }
  }
  if (!indicators.session_allowed) rationale.push("Blocked by session filter");
  if (!indicators.spread_allowed) rationale.push("Blocked by spread filter");

  const entry = side === "buy" ? market.ask : market.bid;
  const distance = Math.max(indicators.atr * 1.5, 0.0003);
  const direction = side === "buy" ? 1 : -1;

  return {
    symbol: market.symbol,
    side,
    entry_price: entry,
    stop_loss: round5(entry - direction * distance),
    take_profit: round5(entry + direction * distance * 2),
    units: side !== "hold" ? DEFAULT_UNITS : 0,
    risk_amount: side !== "hold" ? DEFAULT_RISK_AMOUNT : 0,
    spread: market.spread,
    rationale,
  };
}
