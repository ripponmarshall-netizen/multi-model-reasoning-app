/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analyse from "../analyse.js";
import type * as health from "../health.js";
import type * as journal from "../journal.js";
import type * as market from "../market.js";
import type * as paperTrade from "../paperTrade.js";
import type * as pipeline from "../pipeline.js";
import type * as riskConfig from "../riskConfig.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  analyse: typeof analyse;
  health: typeof health;
  journal: typeof journal;
  market: typeof market;
  paperTrade: typeof paperTrade;
  pipeline: typeof pipeline;
  riskConfig: typeof riskConfig;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
