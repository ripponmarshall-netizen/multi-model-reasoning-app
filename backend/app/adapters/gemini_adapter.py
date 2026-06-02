import json

import httpx

from app.domain.models import IndicatorSnapshot, LLMAnalysis, MarketSnapshot, TradeCandidate


class GeminiAdapter:
    """Requests schema-constrained analysis only. This adapter cannot place orders."""

    def __init__(self, api_key: str | None, model: str) -> None:
        self.api_key = api_key
        self.model = model

    async def analyse(self, market: MarketSnapshot, indicators: IndicatorSnapshot, candidate: TradeCandidate) -> LLMAnalysis:
        if not self.api_key:
            return self._fallback(candidate, indicators)
        prompt = "Analyse risk only. Do not place trades. Return JSON matching the schema.\n" + json.dumps({"market": market.model_dump(mode="json", exclude={"candles"}), "indicators": indicators.model_dump(), "candidate": candidate.model_dump(mode="json")})
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent",
                headers={"x-goog-api-key": self.api_key},
                json={"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"responseMimeType": "application/json", "responseJsonSchema": LLMAnalysis.model_json_schema()}},
            )
            response.raise_for_status()
            data = response.json()
        return LLMAnalysis.model_validate_json(data["candidates"][0]["content"]["parts"][0]["text"])

    @staticmethod
    def _fallback(candidate: TradeCandidate, indicators: IndicatorSnapshot) -> LLMAnalysis:
        bias = "bullish" if candidate.side.value == "buy" else "bearish" if candidate.side.value == "sell" else "neutral"
        allowed = candidate.side.value != "hold"
        return LLMAnalysis(symbol=candidate.symbol, bias=bias, confidence=0.69 if allowed else 0.4, trade_allowed=allowed, risk_flags=[] if allowed else ["no deterministic setup"], reason=f"Local demo analysis: spread filter is {'clear' if indicators.spread_allowed else 'blocked'}.")
