from app.domain.models import OrderResult, TradeJournalEntry
from app.repositories.sqlite_repo import SQLiteRepository


class JournalService:
    def __init__(self, repository: SQLiteRepository) -> None:
        self.repository = repository

    def record(self, result: OrderResult) -> TradeJournalEntry:
        request = result.request
        return self.repository.add_journal_entry(TradeJournalEntry(symbol=request.symbol, side=request.side, units=request.units, entry_price=request.entry_price, stop_loss=request.stop_loss, take_profit=request.take_profit, status=result.status, broker=result.broker, order_id=result.order_id))
