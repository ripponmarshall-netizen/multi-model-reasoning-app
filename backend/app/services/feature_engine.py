import pandas as pd

from app.domain.models import IndicatorSnapshot, MarketSnapshot
from app.domain.signals import StrategyConfig


class FeatureEngine:
    def __init__(self, config: StrategyConfig | None = None) -> None:
        self.config = config or StrategyConfig()

    def calculate(self, market: MarketSnapshot) -> IndicatorSnapshot:
        frame = pd.DataFrame([candle.model_dump() for candle in market.candles])
        close = frame["close"]
        ema_fast = close.ewm(span=self.config.ema_fast_period, adjust=False).mean().iloc[-1]
        ema_slow = close.ewm(span=self.config.ema_slow_period, adjust=False).mean().iloc[-1]
        delta = close.diff()
        gains = delta.clip(lower=0).rolling(self.config.rsi_period).mean()
        losses = -delta.clip(upper=0).rolling(self.config.rsi_period).mean()
        relative_strength = gains / losses.replace(0, 1e-12)
        rsi = (100 - (100 / (1 + relative_strength))).iloc[-1]
        previous_close = close.shift(1)
        true_range = pd.concat(
            [frame["high"] - frame["low"], (frame["high"] - previous_close).abs(), (frame["low"] - previous_close).abs()],
            axis=1,
        ).max(axis=1)
        atr = true_range.rolling(self.config.atr_period).mean().iloc[-1]
        regime = "bullish" if ema_fast > ema_slow else "bearish" if ema_fast < ema_slow else "range"
        return IndicatorSnapshot(
            ema_fast=round(float(ema_fast), 5),
            ema_slow=round(float(ema_slow), 5),
            rsi=round(float(rsi), 2),
            atr=round(float(atr), 5),
            regime=regime,
            session_allowed=market.session in self.config.allowed_sessions,
            spread_allowed=market.spread <= self.config.max_signal_spread,
        )
