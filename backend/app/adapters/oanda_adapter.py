from app.domain.models import OrderRequest, OrderResult


class OandaAdapter:
    """TODO: implement OANDA v20 REST integration after credential and account review."""

    def __init__(self, live_trading_enabled: bool = False) -> None:
        self.live_trading_enabled = live_trading_enabled

    def place_order(self, request: OrderRequest) -> OrderResult:
        if not self.live_trading_enabled:
            raise PermissionError("OANDA live trading is disabled. Set LIVE_TRADING_ENABLED=true only after review.")
        raise NotImplementedError("TODO: connect the OANDA v20 REST adapter")
