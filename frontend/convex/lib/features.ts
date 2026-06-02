// Indicator calculations ported from FeatureEngine (pandas) to plain TS.
import type { IndicatorSnapshot, MarketSnapshot } from "./types";
import { round2, round5 } from "./util";

const EMA_FAST_PERIOD = 9;
const EMA_SLOW_PERIOD = 21;
const RSI_PERIOD = 14;
const ATR_PERIOD = 14;
const ALLOWED_SESSIONS = ["london", "new_york", "overlap"];
const MAX_SIGNAL_SPREAD = 0.0003;

// Exponential moving average with adjust=False (recursive form), final value.
function ema(values: number[], period: number): number {
  const alpha = 2 / (period + 1);
  let result = values[0];
  for (let i = 1; i < values.length; i++) {
    result = alpha * values[i] + (1 - alpha) * result;
  }
  return result;
}

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function calculate(market: MarketSnapshot): IndicatorSnapshot {
  const close = market.candles.map((candle) => candle.close);
  const high = market.candles.map((candle) => candle.high);
  const low = market.candles.map((candle) => candle.low);

  const emaFast = ema(close, EMA_FAST_PERIOD);
  const emaSlow = ema(close, EMA_SLOW_PERIOD);

  // RSI over the most recent RSI_PERIOD price changes.
  const deltas: number[] = [];
  for (let i = 1; i < close.length; i++) deltas.push(close[i] - close[i - 1]);
  const window = deltas.slice(-RSI_PERIOD);
  const gains = mean(window.map((delta) => (delta > 0 ? delta : 0)));
  const losses = mean(window.map((delta) => (delta < 0 ? -delta : 0)));
  const relativeStrength = gains / (losses === 0 ? 1e-12 : losses);
  const rsi = 100 - 100 / (1 + relativeStrength);

  // ATR: mean of the most recent ATR_PERIOD true ranges.
  const trueRanges: number[] = [];
  for (let i = 1; i < market.candles.length; i++) {
    const previousClose = close[i - 1];
    trueRanges.push(
      Math.max(
        high[i] - low[i],
        Math.abs(high[i] - previousClose),
        Math.abs(low[i] - previousClose),
      ),
    );
  }
  const atr = mean(trueRanges.slice(-ATR_PERIOD));

  const regime =
    emaFast > emaSlow ? "bullish" : emaFast < emaSlow ? "bearish" : "range";

  return {
    ema_fast: round5(emaFast),
    ema_slow: round5(emaSlow),
    rsi: round2(rsi),
    atr: round5(atr),
    regime,
    session_allowed: ALLOWED_SESSIONS.includes(market.session),
    spread_allowed: market.spread <= MAX_SIGNAL_SPREAD,
  };
}
