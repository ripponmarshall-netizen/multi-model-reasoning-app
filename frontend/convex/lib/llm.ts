// Structured-output model adapters, ported from the OpenAI/Gemini adapters.
// Each adapter requests schema-constrained JSON analysis ONLY and can never
// place an order. When no API key is configured, a deterministic local
// fallback keeps the whole app runnable offline.
import type {
  IndicatorSnapshot,
  LLMAnalysis,
  MarketSnapshot,
  TradeCandidate,
} from "./types";

// JSON schema describing the LLMAnalysis contract for structured outputs.
const ANALYSIS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    symbol: { type: "string" },
    bias: { type: "string", enum: ["bullish", "bearish", "neutral"] },
    confidence: { type: "number" },
    trade_allowed: { type: "boolean" },
    risk_flags: { type: "array", items: { type: "string" } },
    reason: { type: "string" },
  },
  required: [
    "symbol",
    "bias",
    "confidence",
    "trade_allowed",
    "risk_flags",
    "reason",
  ],
};

function promptPayload(
  market: MarketSnapshot,
  indicators: IndicatorSnapshot,
  candidate: TradeCandidate,
): string {
  const { candles, ...marketView } = market;
  return (
    "Analyse risk only. Do not place trades. Return JSON matching the schema.\n" +
    JSON.stringify({ market: marketView, indicators, candidate })
  );
}

function biasFromSide(side: string): LLMAnalysis["bias"] {
  return side === "buy" ? "bullish" : side === "sell" ? "bearish" : "neutral";
}

function openaiFallback(
  candidate: TradeCandidate,
  indicators: IndicatorSnapshot,
): LLMAnalysis {
  const allowed = candidate.side !== "hold";
  return {
    symbol: candidate.symbol,
    bias: biasFromSide(candidate.side),
    confidence: allowed ? 0.72 : 0.45,
    trade_allowed: allowed,
    risk_flags: allowed ? [] : ["no deterministic setup"],
    reason: `Local demo analysis: ${indicators.regime} regime with RSI ${indicators.rsi}.`,
  };
}

function geminiFallback(
  candidate: TradeCandidate,
  indicators: IndicatorSnapshot,
): LLMAnalysis {
  const allowed = candidate.side !== "hold";
  return {
    symbol: candidate.symbol,
    bias: biasFromSide(candidate.side),
    confidence: allowed ? 0.69 : 0.4,
    trade_allowed: allowed,
    risk_flags: allowed ? [] : ["no deterministic setup"],
    reason: `Local demo analysis: spread filter is ${
      indicators.spread_allowed ? "clear" : "blocked"
    }.`,
  };
}

export async function openaiAnalyse(
  market: MarketSnapshot,
  indicators: IndicatorSnapshot,
  candidate: TradeCandidate,
): Promise<LLMAnalysis> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "gpt-5-mini";
  if (!apiKey) return openaiFallback(candidate, indicators);
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: promptPayload(market, indicators, candidate),
        text: {
          format: {
            type: "json_schema",
            name: "forex_analysis",
            schema: ANALYSIS_SCHEMA,
            strict: true,
          },
        },
      }),
    });
    if (!response.ok) return openaiFallback(candidate, indicators);
    const data = await response.json();
    return JSON.parse(data.output[0].content[0].text) as LLMAnalysis;
  } catch {
    return openaiFallback(candidate, indicators);
  }
}

export async function geminiAnalyse(
  market: MarketSnapshot,
  indicators: IndicatorSnapshot,
  candidate: TradeCandidate,
): Promise<LLMAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
  if (!apiKey) return geminiFallback(candidate, indicators);
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "x-goog-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            { parts: [{ text: promptPayload(market, indicators, candidate) }] },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseJsonSchema: ANALYSIS_SCHEMA,
          },
        }),
      },
    );
    if (!response.ok) return geminiFallback(candidate, indicators);
    const data = await response.json();
    return JSON.parse(
      data.candidates[0].content.parts[0].text,
    ) as LLMAnalysis;
  } catch {
    return geminiFallback(candidate, indicators);
  }
}
