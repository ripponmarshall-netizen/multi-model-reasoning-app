from app.domain.models import OrderRequest, OrderResult


class MT5Adapter:
    """TODO: implement MetaTrader 5 Python integration after credential and account review."""

    def __init__(self, live_trading_enabled: bool = False) -> None:
        self.live_trading_enabled = live_trading_enabled

    def place_order(self, request: OrderRequest) -> OrderResult:
        if not self.live_trading_enabled:
            raise PermissionError("MT5 live trading is disabled. Set LIVE_TRADING_ENABLED=true only after review.")
        raise NotImplementedError("TODO: connect the MetaTrader5 Python adapter")
