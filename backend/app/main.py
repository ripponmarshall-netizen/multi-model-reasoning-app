from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.adapters.gemini_adapter import GeminiAdapter
from app.adapters.openai_adapter import OpenAIAdapter
from app.adapters.paper_broker import PaperBroker
from app.config import get_settings
from app.domain.models import ConsensusDecision, IndicatorSnapshot, MarketSnapshot, OrderResult, RiskConfig, RiskDecision, TradeCandidate, TradeJournalEntry
from app.domain.risk import RiskGovernor
from app.repositories.sqlite_repo import SQLiteRepository
from app.services.execution_engine import ExecutionEngine
from app.services.feature_engine import FeatureEngine
from app.services.journal_service import JournalService
from app.services.llm_consensus import LLMConsensusService
from app.services.market_data import MockMarketDataService
from app.services.strategy_engine import StrategyEngine


class AnalyseRequest(BaseModel):
    symbol: str = "EUR_USD"


class AnalysisBundle(BaseModel):
    market: MarketSnapshot
    indicators: IndicatorSnapshot
    candidate: TradeCandidate
    consensus: ConsensusDecision
    risk: RiskDecision


settings = get_settings()
settings.ensure_database_parent()
repository = SQLiteRepository(settings.database_path)
market_data = MockMarketDataService()
features = FeatureEngine()
strategy = StrategyEngine()
consensus_service = LLMConsensusService(OpenAIAdapter(settings.openai_api_key, settings.openai_model), GeminiAdapter(settings.gemini_api_key, settings.gemini_model))
risk_governor = RiskGovernor()
execution = ExecutionEngine(PaperBroker(), JournalService(repository))
app = FastAPI(title="ForexCopilot", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origin_list, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


async def build_analysis(symbol: str) -> AnalysisBundle:
    market = market_data.get_snapshot(symbol)
    indicators = features.calculate(market)
    candidate = strategy.generate(market, indicators)
    consensus = await consensus_service.analyse(market, indicators, candidate)
    risk = risk_governor.evaluate(candidate, consensus, repository.get_risk_config(), daily_loss=repository.daily_loss(), open_trades=repository.open_trade_count())
    return AnalysisBundle(market=market, indicators=indicators, candidate=candidate, consensus=consensus, risk=risk)


@app.get("/health")
def health() -> dict[str, str | bool]:
    return {"status": "ok", "broker": "paper", "live_trading_enabled": settings.live_trading_enabled}


@app.get("/market/{symbol}")
def market(symbol: str) -> MarketSnapshot:
    return market_data.get_snapshot(symbol)


@app.post("/analyse")
async def analyse(request: AnalyseRequest) -> AnalysisBundle:
    return await build_analysis(request.symbol)


@app.post("/paper-trade")
async def paper_trade(request: AnalyseRequest) -> OrderResult:
    bundle = await build_analysis(request.symbol)
    try:
        return execution.execute(bundle.candidate, bundle.risk, bundle.consensus)
    except PermissionError as error:
        raise HTTPException(status_code=403, detail=str(error)) from error


@app.get("/journal")
def journal() -> list[TradeJournalEntry]:
    return repository.list_journal()


@app.get("/risk-config")
def get_risk_config() -> RiskConfig:
    return repository.get_risk_config()


@app.put("/risk-config")
def put_risk_config(config: RiskConfig) -> RiskConfig:
    return repository.save_risk_config(config)
