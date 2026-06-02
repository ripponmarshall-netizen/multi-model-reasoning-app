import pytest

from app.adapters.mt5_adapter import MT5Adapter
from app.adapters.oanda_adapter import OandaAdapter
from app.domain.models import OrderRequest, Side


@pytest.mark.parametrize("adapter", [MT5Adapter(), OandaAdapter()])
def test_live_adapters_refuse_orders_by_default(adapter):
    request = OrderRequest(symbol="EUR_USD", side=Side.BUY, units=1_000, entry_price=1.1, stop_loss=1.09, take_profit=1.12)
    with pytest.raises(PermissionError):
        adapter.place_order(request)
