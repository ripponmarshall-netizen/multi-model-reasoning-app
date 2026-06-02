import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Persistence for the guarded forex MVP. Replaces the original SQLite
// `journal` and `settings` tables with Convex tables.
export default defineSchema({
  // Paper-trade journal. One row per filled paper order.
  journal: defineTable({
    createdAt: v.number(),
    symbol: v.string(),
    side: v.string(),
    units: v.number(),
    entryPrice: v.number(),
    stopLoss: v.number(),
    takeProfit: v.number(),
    status: v.string(),
    broker: v.string(),
    orderId: v.string(),
  }).index("by_status", ["status"]),

  // Deterministic risk limits. Stored as a single singleton row.
  riskConfig: defineTable({
    maxDailyLoss: v.number(),
    maxOpenTrades: v.number(),
    maxSpread: v.number(),
    maxRiskPerTrade: v.number(),
    minimumConfidence: v.number(),
  }),
});
