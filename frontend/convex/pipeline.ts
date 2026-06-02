// The guarded analysis pipeline, shared by the analyse and paper-trade
// actions. Mirrors build_analysis() from the original FastAPI app:
//   MockMarketData -> FeatureEngine -> StrategyEngine -> consensus -> RiskGovernor
import { internal } from "./_generated/api";
import type { ActionCtx } from "./_generated/server";
import { analyseConsensus } from "./lib/consensus";
import { calculate } from "./lib/features";
import { buildMarket } from "./lib/market";
import { evaluate } from "./lib/risk";
import { generate } from "./lib/strategy";
import type { AnalysisBundle } from "./lib/types";

// Realized daily P&L is always 0 until paper-position closing is added,
// matching the original SQLiteRepository.daily_loss() stub.
const DAILY_LOSS = 0;

export async function buildAnalysis(
  ctx: ActionCtx,
  symbol: string,
): Promise<AnalysisBundle> {
  const market = buildMarket(symbol);
  const indicators = calculate(market);
  const candidate = generate(market, indicators);
  const consensus = await analyseConsensus(market, indicators, candidate);

  const config = await ctx.runQuery(internal.riskConfig.getConfig, {});
  const openTrades = await ctx.runQuery(internal.journal.openCount, {});
  const risk = evaluate(candidate, consensus, config, DAILY_LOSS, openTrades);

  const { candles, ...market_view } = market;
  return { market: market_view, indicators, candidate, consensus, risk };
}
