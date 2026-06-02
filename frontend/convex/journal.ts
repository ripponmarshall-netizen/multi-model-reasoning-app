import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";

// Reactive list of paper trades, newest first (GET /journal).
// Shaped to match the frontend JournalEntry type (snake_case).
export const list = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("journal").order("desc").collect();
    return rows.map((row) => ({
      id: row._id,
      created_at: new Date(row.createdAt).toISOString(),
      symbol: row.symbol,
      side: row.side,
      units: row.units,
      entry_price: row.entryPrice,
      status: row.status,
      order_id: row.orderId,
    }));
  },
});

// Count of filled paper trades, used by the RiskGovernor.
export const openCount = internalQuery({
  args: {},
  handler: async (ctx) => {
    const filled = await ctx.db
      .query("journal")
      .withIndex("by_status", (q) => q.eq("status", "filled"))
      .collect();
    return filled.length;
  },
});

// Records a filled paper order. Called only from the guarded paper-trade
// action, never directly by clients.
export const add = internalMutation({
  args: {
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
  },
  handler: (ctx, args) => ctx.db.insert("journal", args),
});
