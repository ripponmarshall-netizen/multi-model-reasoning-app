import { ConvexError } from "convex/values";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { buildAnalysis } from "./pipeline";
import type { OrderResult } from "./lib/types";

// POST /paper-trade — re-runs the guarded pipeline and submits ONLY approved
// paper orders. The RiskGovernor decision and consensus are re-checked here
// immediately before the (paper) broker submission. LLM output never becomes
// an order on its own.
export const paperTrade = action({
  args: { symbol: v.optional(v.string()) },
  handler: async (ctx, { symbol }): Promise<OrderResult> => {
    const bundle = await buildAnalysis(ctx, symbol ?? "EUR_USD");

    if (!bundle.risk.approved) {
      throw new ConvexError(
        "RiskGovernor rejected this order: " + bundle.risk.reasons.join("; "),
      );
    }
    if (!bundle.consensus.trade_allowed) {
      throw new ConvexError("Consensus does not allow this order");
    }
    if (bundle.candidate.side === "hold") {
      throw new ConvexError("No deterministic trade candidate exists");
    }

    // PaperBroker.place_order — the only broker that exists.
    const createdAt = Date.now();
    const orderId = `paper-${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`;
    const candidate = bundle.candidate;

    await ctx.runMutation(internal.journal.add, {
      createdAt,
      symbol: candidate.symbol,
      side: candidate.side,
      units: candidate.units,
      entryPrice: candidate.entry_price,
      stopLoss: candidate.stop_loss,
      takeProfit: candidate.take_profit,
      status: "filled",
      broker: "paper",
      orderId,
    });

    return {
      order_id: orderId,
      status: "filled",
      broker: "paper",
      message: "Paper order filled locally",
      filled_at: new Date(createdAt).toISOString(),
    };
  },
});
