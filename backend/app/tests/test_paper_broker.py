from app.adapters.paper_broker import PaperBroker
from app.domain.models import OrderRequest, Side


def test_paper_broker_fills_local_order():
    request = OrderRequest(symbol="EUR_USD", side=Side.BUY, units=1_000, entry_price=1.1, stop_loss=1.09, take_profit=1.12)
    result = PaperBroker().place_order(request)
    assert result.status == "filled"
    assert result.broker == "paper"
    assert result.order_id.startswith("paper-")
