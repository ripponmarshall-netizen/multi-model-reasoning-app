import json
import sqlite3
from pathlib import Path

from app.domain.models import RiskConfig, TradeJournalEntry


class SQLiteRepository:
    def __init__(self, database_path: str) -> None:
        Path(database_path).parent.mkdir(parents=True, exist_ok=True)
        self.database_path = database_path
        self._initialize()

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.database_path)
        connection.row_factory = sqlite3.Row
        return connection

    def _initialize(self) -> None:
        with self._connect() as connection:
            connection.executescript("""
                CREATE TABLE IF NOT EXISTS journal (
                    id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL, symbol TEXT NOT NULL,
                    side TEXT NOT NULL, units INTEGER NOT NULL, entry_price REAL NOT NULL, stop_loss REAL NOT NULL,
                    take_profit REAL NOT NULL, status TEXT NOT NULL, broker TEXT NOT NULL, order_id TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
            """)

    def list_journal(self) -> list[TradeJournalEntry]:
        with self._connect() as connection:
            rows = connection.execute("SELECT * FROM journal ORDER BY id DESC").fetchall()
        return [TradeJournalEntry.model_validate(dict(row)) for row in rows]

    def add_journal_entry(self, entry: TradeJournalEntry) -> TradeJournalEntry:
        payload = entry.model_dump(mode="json", exclude={"id"})
        with self._connect() as connection:
            cursor = connection.execute(
                "INSERT INTO journal (created_at, symbol, side, units, entry_price, stop_loss, take_profit, status, broker, order_id) VALUES (:created_at, :symbol, :side, :units, :entry_price, :stop_loss, :take_profit, :status, :broker, :order_id)",
                payload,
            )
        return entry.model_copy(update={"id": cursor.lastrowid})

    def get_risk_config(self) -> RiskConfig:
        with self._connect() as connection:
            row = connection.execute("SELECT value FROM settings WHERE key = 'risk_config'").fetchone()
        return RiskConfig.model_validate(json.loads(row["value"])) if row else RiskConfig()

    def save_risk_config(self, config: RiskConfig) -> RiskConfig:
        with self._connect() as connection:
            connection.execute("INSERT INTO settings (key, value) VALUES ('risk_config', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", (config.model_dump_json(),))
        return config

    def open_trade_count(self) -> int:
        with self._connect() as connection:
            row = connection.execute("SELECT COUNT(*) AS count FROM journal WHERE status = 'filled'").fetchone()
        return int(row["count"])

    def daily_loss(self) -> float:
        return 0.0  # TODO: calculate realized P&L once paper position closing is added.
