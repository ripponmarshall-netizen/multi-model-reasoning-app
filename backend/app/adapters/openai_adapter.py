import json

import httpx

from app.domain.models import IndicatorSnapshot, LLMAnalysis, MarketSnapshot, TradeCandidate


class OpenAIAdapter:
    """Requests schema-constrained analysis only. This adapter cannot place orders."""

    def __init__(self, api_key: str | None, model: str) -> None:
        self.api_key = api_key
        self.model = model

    async def analyse(self, market: MarketSnapshot, indicators: IndicatorSnapshot, candidate: TradeCandidate) -> LLMAnalysis:
        if not self.api_key:
            return self._fallback(candidate, indicators)
        schema = LLMAnalysis.model_json_schema()
        prompt = self._prompt(market, indicators, candidate)
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(
                "https://api.openai.com/v1/responses",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={
                    "model": self.model,
                    "input": prompt,
                    "text": {"format": {"type": "json_schema", "name": "forex_analysis", "schema": schema, "strict": True}},
                },
            )
            response.raise_for_status()
            data = response.json()
        return LLMAnalysis.model_validate_json(data["output"][0]["content"][0]["text"])

    @staticmethod
    def _prompt(market: MarketSnapshot, indicators: IndicatorSnapshot, candidate: TradeCandidate) -> str:
        return "Analyse risk only. Do not place trades. Return JSON matching the schema.\n" + json.dumps({"market": market.model_dump(mode="json", exclude={"candles"}), "indicators": indicators.model_dump(), "candidate": candidate.model_dump(mode="json")})

    @staticmethod
    def _fallback(candidate: TradeCandidate, indicators: IndicatorSnapshot) -> LLMAnalysis:
        bias = "bullish" if candidate.side.value == "buy" else "bearish" if candidate.side.value == "sell" else "neutral"
        allowed = candidate.side.value != "hold"
        return LLMAnalysis(symbol=candidate.symbol, bias=bias, confidence=0.72 if allowed else 0.45, trade_allowed=allowed, risk_flags=[] if allowed else ["no deterministic setup"], reason=f"Local demo analysis: {indicators.regime} regime with RSI {indicators.rsi}.")
