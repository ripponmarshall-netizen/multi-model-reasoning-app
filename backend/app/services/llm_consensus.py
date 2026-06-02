import asyncio

from app.adapters.gemini_adapter import GeminiAdapter
from app.adapters.openai_adapter import OpenAIAdapter
from app.domain.models import ConsensusDecision, IndicatorSnapshot, MarketSnapshot, TradeCandidate


class LLMConsensusService:
    def __init__(self, openai: OpenAIAdapter, gemini: GeminiAdapter) -> None:
        self.openai = openai
        self.gemini = gemini

    async def analyse(self, market: MarketSnapshot, indicators: IndicatorSnapshot, candidate: TradeCandidate) -> ConsensusDecision:
        openai, gemini = await asyncio.gather(self.openai.analyse(market, indicators, candidate), self.gemini.analyse(market, indicators, candidate))
        disagreement = openai.bias != gemini.bias or abs(openai.confidence - gemini.confidence) > 0.35
        allowed = openai.trade_allowed and gemini.trade_allowed and not disagreement
        bias = openai.bias if openai.bias == gemini.bias else "neutral"
        return ConsensusDecision(symbol=market.symbol, bias=bias, confidence=round(min(openai.confidence, gemini.confidence), 2), trade_allowed=allowed, disagreement_high=disagreement, risk_flags=sorted(set(openai.risk_flags + gemini.risk_flags)), reason="Both model analyses agree." if allowed else "Model analyses do not jointly allow a trade.", openai=openai, gemini=gemini)
