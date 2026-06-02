from app.domain.models import IndicatorSnapshot, MarketSnapshot, Side, TradeCandidate
from app.domain.signals import StrategyConfig


class StrategyEngine:
    """Produces candidates from indicators only; LLM prose never enters this path."""

    def __init__(self, config: StrategyConfig | None = None) -> None:
        self.config = config or StrategyConfig()

    def generate(self, market: MarketSnapshot, indicators: IndicatorSnapshot) -> TradeCandidate:
        rationale = [f"EMA regime: {indicators.regime}", f"RSI: {indicators.rsi}", f"ATR: {indicators.atr}"]
        side = Side.HOLD
        if indicators.session_allowed and indicators.spread_allowed:
            if indicators.ema_fast > indicators.ema_slow and 45 <= indicators.rsi <= 72:
                side = Side.BUY
            elif indicators.ema_fast < indicators.ema_slow and 28 <= indicators.rsi <= 55:
                side = Side.SELL
        if not indicators.session_allowed:
            rationale.append("Blocked by session filter")
        if not indicators.spread_allowed:
            rationale.append("Blocked by spread filter")
        entry = market.ask if side == Side.BUY else market.bid
        distance = max(indicators.atr * 1.5, 0.0003)
        direction = 1 if side == Side.BUY else -1
        return TradeCandidate(
            symbol=market.symbol,
            side=side,
            entry_price=entry,
            stop_loss=round(entry - direction * distance, 5),
            take_profit=round(entry + direction * distance * 2, 5),
            units=self.config.default_units if side != Side.HOLD else 0,
            risk_amount=self.config.default_risk_amount if side != Side.HOLD else 0,
            spread=market.spread,
            rationale=rationale,
        )
