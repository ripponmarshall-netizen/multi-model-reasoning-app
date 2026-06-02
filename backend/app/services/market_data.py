from datetime import datetime, timedelta, timezone
from math import sin

from app.domain.models import Candle, MarketSnapshot


class MockMarketDataService:
    """Deterministic market feed for local MVP development."""

    def get_snapshot(self, symbol: str) -> MarketSnapshot:
        symbol = symbol.upper()
        base = 1.084 if symbol == "EUR_USD" else 1.25
        now = datetime.now(timezone.utc).replace(second=0, microsecond=0)
        candles: list[Candle] = []
        previous = base
        for index in range(80):
            close = base + index * 0.00002 + sin(index / 5) * 0.00012
            candles.append(
                Candle(
                    timestamp=now - timedelta(minutes=79 - index),
                    open=previous,
                    high=max(previous, close) + 0.00012,
                    low=min(previous, close) - 0.00012,
                    close=close,
                    volume=1_000 + index * 8,
                )
            )
            previous = close
        bid = candles[-1].close
        ask = bid + 0.00012
        return MarketSnapshot(
            symbol=symbol,
            candles=candles,
            bid=round(bid, 5),
            ask=round(ask, 5),
            spread=round(ask - bid, 5),
            session="overlap",
        )
