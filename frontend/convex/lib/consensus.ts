// Combines the two structured model analyses into a single consensus,
// ported from LLMConsensusService.
import { geminiAnalyse, openaiAnalyse } from "./llm";
import type {
  ConsensusDecision,
  IndicatorSnapshot,
  MarketSnapshot,
  TradeCandidate,
} from "./types";
import { round2 } from "./util";

export async function analyseConsensus(
  market: MarketSnapshot,
  indicators: IndicatorSnapshot,
  candidate: TradeCandidate,
): Promise<ConsensusDecision> {
  const [openai, gemini] = await Promise.all([
    openaiAnalyse(market, indicators, candidate),
    geminiAnalyse(market, indicators, candidate),
  ]);

  const disagreement =
    openai.bias !== gemini.bias ||
    Math.abs(openai.confidence - gemini.confidence) > 0.35;
  const allowed = openai.trade_allowed && gemini.trade_allowed && !disagreement;
  const bias = openai.bias === gemini.bias ? openai.bias : "neutral";
  const riskFlags = Array.from(
    new Set([...openai.risk_flags, ...gemini.risk_flags]),
  ).sort();

  return {
    symbol: market.symbol,
    bias,
    confidence: round2(Math.min(openai.confidence, gemini.confidence)),
    trade_allowed: allowed,
    disagreement_high: disagreement,
    risk_flags: riskFlags,
    reason: allowed
      ? "Both model analyses agree."
      : "Model analyses do not jointly allow a trade.",
    openai,
    gemini,
  };
}
