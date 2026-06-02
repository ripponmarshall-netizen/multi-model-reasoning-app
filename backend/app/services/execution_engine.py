from app.adapters.paper_broker import PaperBroker
from app.domain.models import ConsensusDecision, OrderRequest, OrderResult, RiskDecision, Side, TradeCandidate
from app.services.journal_service import JournalService


class ExecutionEngine:
    def __init__(self, broker: PaperBroker, journal: JournalService) -> None:
        self.broker = broker
        self.journal = journal

    def execute(self, candidate: TradeCandidate, risk: RiskDecision, consensus: ConsensusDecision) -> OrderResult:
        if not risk.approved:
            raise PermissionError("RiskGovernor rejected this order: " + "; ".join(risk.reasons))
        if not consensus.trade_allowed:
            raise PermissionError("Consensus does not allow this order")
        if candidate.side == Side.HOLD:
            raise PermissionError("No deterministic trade candidate exists")
        result = self.broker.place_order(OrderRequest(symbol=candidate.symbol, side=candidate.side, units=candidate.units, entry_price=candidate.entry_price, stop_loss=candidate.stop_loss, take_profit=candidate.take_profit))
        self.journal.record(result)
        return result
