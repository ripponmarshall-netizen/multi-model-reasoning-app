import { v } from "convex/values";
import { internalQuery, mutation, query, type QueryCtx } from "./_generated/server";
import { DEFAULT_RISK_CONFIG, type RiskConfig } from "./lib/types";

// Reads the singleton risk config, falling back to deterministic defaults.
async function readConfig(ctx: QueryCtx): Promise<RiskConfig> {
  const row = await ctx.db.query("riskConfig").first();
  if (!row) return DEFAULT_RISK_CONFIG;
  return {
    max_daily_loss: row.maxDailyLoss,
    max_open_trades: row.maxOpenTrades,
    max_spread: row.maxSpread,
    max_risk_per_trade: row.maxRiskPerTrade,
    minimum_confidence: row.minimumConfidence,
  };
}

// Public read for the frontend / API parity (GET /risk-config).
export const get = query({
  args: {},
  handler: (ctx) => readConfig(ctx),
});

// Internal read used by the analyse/paper-trade pipeline.
export const getConfig = internalQuery({
  args: {},
  handler: (ctx) => readConfig(ctx),
});

// Upserts the singleton risk config (PUT /risk-config).
export const update = mutation({
  args: {
    max_daily_loss: v.number(),
    max_open_trades: v.number(),
    max_spread: v.number(),
    max_risk_per_trade: v.number(),
    minimum_confidence: v.number(),
  },
  handler: async (ctx, args): Promise<RiskConfig> => {
    const fields = {
      maxDailyLoss: args.max_daily_loss,
      maxOpenTrades: args.max_open_trades,
      maxSpread: args.max_spread,
      maxRiskPerTrade: args.max_risk_per_trade,
      minimumConfidence: args.minimum_confidence,
    };
    const existing = await ctx.db.query("riskConfig").first();
    if (existing) {
      await ctx.db.patch(existing._id, fields);
    } else {
      await ctx.db.insert("riskConfig", fields);
    }
    return {
      max_daily_loss: args.max_daily_loss,
      max_open_trades: args.max_open_trades,
      max_spread: args.max_spread,
      max_risk_per_trade: args.max_risk_per_trade,
      minimum_confidence: args.minimum_confidence,
    };
  },
});
