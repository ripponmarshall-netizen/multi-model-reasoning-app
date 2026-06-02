from app.domain.models import ConsensusDecision, RiskConfig, RiskDecision, TradeCandidate


class RiskGovernor:
    """The mandatory deterministic gate before any broker submission."""

    def evaluate(
        self,
        candidate: TradeCandidate,
        consensus: ConsensusDecision,
        config: RiskConfig,
        *,
        daily_loss: float,
        open_trades: int,
    ) -> RiskDecision:
        reasons: list[str] = []
        if daily_loss >= config.max_daily_loss:
            reasons.append("daily loss limit reached")
        if open_trades >= config.max_open_trades:
            reasons.append("maximum open trades reached")
        if candidate.spread > config.max_spread:
            reasons.append("spread exceeds configured maximum")
        if candidate.risk_amount > config.max_risk_per_trade:
            reasons.append("position risk exceeds per-trade maximum")
        if consensus.disagreement_high:
            reasons.append("LLM disagreement is high")
        if consensus.confidence < config.minimum_confidence:
            reasons.append("consensus confidence is below minimum")
        if not consensus.trade_allowed:
            reasons.append("LLM consensus does not allow trading")
        return RiskDecision(approved=not reasons, reasons=reasons)
