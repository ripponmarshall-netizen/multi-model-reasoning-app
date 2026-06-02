// Shared domain types for the guarded forex pipeline.
// These mirror the original Python Pydantic models. Fields that cross the
// wire to the React frontend use snake_case so the existing UI components
// keep working unchanged.

export type Side = "buy" | "sell" | "hold";
export type Bias = "bullish" | "bearish" | "neutral";

export interface Candle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketSnapshot {
  symbol: string;
  candles: Candle[];
  bid: number;
  ask: number;
  spread: number;
  session: string;
  as_of: string;
}

// The trimmed market shape returned to the frontend (candles omitted).
export interface MarketView {
  symbol: string;
  bid: number;
  ask: number;
  spread: number;
  session: string;
  as_of: string;
}

export interface IndicatorSnapshot {
  ema_fast: number;
  ema_slow: number;
  rsi: number;
  atr: number;
  regime: string;
  session_allowed: boolean;
  spread_allowed: boolean;
}

export interface TradeCandidate {
  symbol: string;
  side: Side;
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  units: number;
  risk_amount: number;
  spread: number;
  rationale: string[];
}

export interface LLMAnalysis {
  symbol: string;
  bias: Bias;
  confidence: number;
  trade_allowed: boolean;
  risk_flags: string[];
  reason: string;
}

export interface ConsensusDecision {
  symbol: string;
  bias: Bias;
  confidence: number;
  trade_allowed: boolean;
  disagreement_high: boolean;
  risk_flags: string[];
  reason: string;
  openai: LLMAnalysis;
  gemini: LLMAnalysis;
}

export interface RiskConfig {
  max_daily_loss: number;
  max_open_trades: number;
  max_spread: number;
  max_risk_per_trade: number;
  minimum_confidence: number;
}

export interface RiskDecision {
  approved: boolean;
  reasons: string[];
  checked_at: string;
}

export interface AnalysisBundle {
  market: MarketView;
  indicators: IndicatorSnapshot;
  candidate: TradeCandidate;
  consensus: ConsensusDecision;
  risk: RiskDecision;
}

export interface OrderResult {
  order_id: string;
  status: "filled" | "rejected";
  broker: string;
  message: string;
  filled_at: string;
}

export const DEFAULT_RISK_CONFIG: RiskConfig = {
  max_daily_loss: 250,
  max_open_trades: 3,
  max_spread: 0.0003,
  max_risk_per_trade: 100,
  minimum_confidence: 0.6,
};
