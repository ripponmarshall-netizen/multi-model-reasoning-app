import { v } from "convex/values";
import { action } from "./_generated/server";
import { buildMarket } from "./lib/market";
import type { MarketView } from "./lib/types";

// GET /market/{symbol} — mock market snapshot (candles omitted from the
// response, matching the trimmed view the UI consumes). Implemented as an
// action because the mock feed reads the current time.
export const snapshot = action({
  args: { symbol: v.optional(v.string()) },
  handler: (_ctx, { symbol }): Promise<MarketView> => {
    const { candles, ...view } = buildMarket(symbol ?? "EUR_USD");
    return Promise.resolve(view);
  },
});
