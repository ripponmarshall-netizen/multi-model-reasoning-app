from dataclasses import dataclass


@dataclass(frozen=True)
class StrategyConfig:
    ema_fast_period: int = 9
    ema_slow_period: int = 21
    rsi_period: int = 14
    atr_period: int = 14
    allowed_sessions: tuple[str, ...] = ("london", "new_york", "overlap")
    max_signal_spread: float = 0.0003
    default_units: int = 10_000
    default_risk_amount: float = 75.0
