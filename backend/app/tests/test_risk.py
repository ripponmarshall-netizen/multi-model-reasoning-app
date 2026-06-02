import pytest

from app.domain.models import ConsensusDecision, LLMAnalysis, RiskConfig, Side, TradeCandidate
from app.domain.risk import RiskGovernor


def analysis(confidence: float = 0.8, bias: str = "bullish", allowed: bool = True) -> LLMAnalysis:
    return LLMAnalysis(symbol="EUR_USD", bias=bias, confidence=confidence, trade_allowed=allowed, risk_flags=[], reason="test")


def consensus(*, confidence: float = 0.8, disagreement: bool = False, allowed: bool = True) -> ConsensusDecision:
    return ConsensusDecision(symbol="EUR_USD", bias="bullish", confidence=confidence, trade_allowed=allowed, disagreement_high=disagreement, risk_flags=[], reason="test", openai=analysis(), gemini=analysis())


def candidate(*, spread: float = 0.0001, risk: float = 75) -> TradeCandidate:
    return TradeCandidate(symbol="EUR_USD", side=Side.BUY, entry_price=1.1, stop_loss=1.09, take_profit=1.12, units=10_000, risk_amount=risk, spread=spread, rationale=[])


@pytest.mark.parametrize(("kwargs", "expected"), [
    ({"daily_loss": 250, "open_trades": 0}, "daily loss limit reached"),
    ({"daily_loss": 0, "open_trades": 3}, "maximum open trades reached"),
])
def test_governor_blocks_account_limits(kwargs, expected):
    decision = RiskGovernor().evaluate(candidate(), consensus(), RiskConfig(), **kwargs)
    assert decision.approved is False
    assert expected in decision.reasons


def test_governor_blocks_excessive_spread_and_position_risk():
    decision = RiskGovernor().evaluate(candidate(spread=0.001, risk=101), consensus(), RiskConfig(), daily_loss=0, open_trades=0)
    assert decision.approved is False
    assert "spread exceeds configured maximum" in decision.reasons
    assert "position risk exceeds per-trade maximum" in decision.reasons


def test_governor_blocks_llm_disagreement_and_low_confidence():
    decision = RiskGovernor().evaluate(candidate(), consensus(confidence=0.3, disagreement=True), RiskConfig(), daily_loss=0, open_trades=0)
    assert decision.approved is False
    assert "LLM disagreement is high" in decision.reasons
    assert "consensus confidence is below minimum" in decision.reasons


def test_governor_approves_safe_candidate():
    assert RiskGovernor().evaluate(candidate(), consensus(), RiskConfig(), daily_loss=0, open_trades=0).approved is True
