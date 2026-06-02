import { v } from "convex/values";
import { action } from "./_generated/server";
import { buildAnalysis } from "./pipeline";
import type { AnalysisBundle } from "./lib/types";

// POST /analyse — deterministic setup + structured analyses + consensus +
// risk decision. Calls external models (when keys are configured), so this
// is an action rather than a query.
export const analyse = action({
  args: { symbol: v.optional(v.string()) },
  handler: (ctx, { symbol }): Promise<AnalysisBundle> =>
    buildAnalysis(ctx, symbol ?? "EUR_USD"),
});
