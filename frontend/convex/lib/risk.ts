// The mandatory deterministic gate before any broker submission,
// ported from RiskGovernor.
import type {
  ConsensusDecision,
  RiskConfig,
  RiskDecision,
  TradeCandidate,
} from "./types";

export function evaluate(
  candidate: TradeCandidate,
  consensus: ConsensusDecision,
  config: RiskConfig,
  dailyLoss: number,
  openTrades: number,
): RiskDecision {
  const reasons: string[] = [];
  if (dailyLoss >= config.max_daily_loss) {
    reasons.push("daily loss limit reached");
  }
  if (openTrades >= config.max_open_trades) {
    reasons.push("maximum open trades reached");
  }
  if (candidate.spread > config.max_spread) {
    reasons.push("spread exceeds configured maximum");
  }
  if (candidate.risk_amount > config.max_risk_per_trade) {
    reasons.push("position risk exceeds per-trade maximum");
  }
  if (consensus.disagreement_high) {
    reasons.push("LLM disagreement is high");
  }
  if (consensus.confidence < config.minimum_confidence) {
    reasons.push("consensus confidence is below minimum");
  }
  if (!consensus.trade_allowed) {
    reasons.push("LLM consensus does not allow trading");
  }
  return {
    approved: reasons.length === 0,
    reasons,
    checked_at: new Date().toISOString(),
  };
}
