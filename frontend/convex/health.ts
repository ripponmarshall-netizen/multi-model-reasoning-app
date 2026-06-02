import { query } from "./_generated/server";

// GET /health — API mode and status.
export const health = query({
  args: {},
  handler: () => ({
    status: "ok",
    broker: "paper",
    live_trading_enabled: process.env.LIVE_TRADING_ENABLED === "true",
  }),
});
