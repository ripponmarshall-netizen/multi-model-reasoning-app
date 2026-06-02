from uuid import uuid4

from app.domain.models import OrderRequest, OrderResult


class PaperBroker:
    name = "paper"

    def place_order(self, request: OrderRequest) -> OrderResult:
        return OrderResult(order_id=f"paper-{uuid4().hex[:10]}", status="filled", broker=self.name, request=request, message="Paper order filled locally")
