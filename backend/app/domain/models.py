from datetime import datetime, timezone
from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


class Side(str, Enum):
    BUY = "buy"
    SELL = "sell"
    HOLD = "hold"


class Candle(BaseModel):
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float = 0


class MarketSnapshot(BaseModel):
    symbol: str
    candles: list[Candle]
    bid: float
    ask: float
    spread: float
    session: str
    as_of: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class IndicatorSnapshot(BaseModel):
    ema_fast: float
    ema_slow: float
    rsi: float
    atr: float
    regime: str
    session_allowed: bool
    spread_allowed: bool


class TradeCandidate(BaseModel):
    symbol: str
    side: Side
    entry_price: float
    stop_loss: float
    take_profit: float
    units: int = Field(ge=0)
    risk_amount: float = Field(ge=0)
    spread: float = Field(ge=0)
    rationale: list[str]


class LLMAnalysis(BaseModel):
    symbol: str
    bias: Literal["bullish", "bearish", "neutral"]
    confidence: float = Field(ge=0, le=1)
    trade_allowed: bool
    risk_flags: list[str]
    reason: str


class ConsensusDecision(BaseModel):
    symbol: str
    bias: Literal["bullish", "bearish", "neutral"]
    confidence: float = Field(ge=0, le=1)
    trade_allowed: bool
    disagreement_high: bool
    risk_flags: list[str]
    reason: str
    openai: LLMAnalysis
    gemini: LLMAnalysis


class RiskConfig(BaseModel):
    max_daily_loss: float = Field(default=250, gt=0)
    max_open_trades: int = Field(default=3, ge=1)
    max_spread: float = Field(default=0.0003, gt=0)
    max_risk_per_trade: float = Field(default=100, gt=0)
    minimum_confidence: float = Field(default=0.6, ge=0, le=1)


class RiskDecision(BaseModel):
    approved: bool
    reasons: list[str]
    checked_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class OrderRequest(BaseModel):
    symbol: str
    side: Side
    units: int = Field(gt=0)
    entry_price: float
    stop_loss: float
    take_profit: float


class OrderResult(BaseModel):
    order_id: str
    status: Literal["filled", "rejected"]
    broker: str
    request: OrderRequest
    message: str
    filled_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class TradeJournalEntry(BaseModel):
    id: int | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    symbol: str
    side: Side
    units: int
    entry_price: float
    stop_loss: float
    take_profit: float
    status: str
    broker: str
    order_id: str
