from app.domain.models import IndicatorSnapshot, Side
from app.services.market_data import MockMarketDataService
from app.services.strategy_engine import StrategyEngine


def test_strategy_generates_buy_candidate_from_deterministic_indicators():
    market = MockMarketDataService().get_snapshot("EUR_USD")
    indicators = IndicatorSnapshot(ema_fast=1.2, ema_slow=1.1, rsi=60, atr=0.001, regime="bullish", session_allowed=True, spread_allowed=True)
    assert StrategyEngine().generate(market, indicators).side == Side.BUY


def test_strategy_holds_when_session_filter_rejects_market():
    market = MockMarketDataService().get_snapshot("EUR_USD")
    indicators = IndicatorSnapshot(ema_fast=1.2, ema_slow=1.1, rsi=60, atr=0.001, regime="bullish", session_allowed=False, spread_allowed=True)
    assert StrategyEngine().generate(market, indicators).side == Side.HOLD
