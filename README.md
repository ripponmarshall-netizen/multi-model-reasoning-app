# ForexCopilot

ForexCopilot is a guarded forex-analysis MVP. Deterministic Python code creates strategy candidates, enforces risk limits, and controls execution. ChatGPT/OpenAI and Gemini may contribute **structured JSON analysis only**; neither adapter has access to a broker. The only implemented broker is a local `PaperBroker`.

## Safety architecture

```text
MockMarketData -> FeatureEngine -> StrategyEngine -> TradeCandidate
                                            |              |
                        OpenAI JSON analysis + Gemini JSON analysis
                                            |              |
                                      LLMConsensus         |
                                            |              |
                                     RiskGovernor <--------+
                                            |
                                      ExecutionEngine
                                            |
                                      PaperBroker only
```

Every order is re-analysed and passed through `RiskGovernor` immediately before `ExecutionEngine` can submit it. The governor rejects orders when the daily-loss limit is reached, too many trades are open, spread or per-trade risk is excessive, model disagreement is high, confidence is too low, or model consensus does not allow trading. LLM prose never becomes an order.

## Stack

- Backend: Python 3.11, FastAPI, Pydantic, pandas, SQLite repository
- Frontend: React, Vite, TypeScript
- Broker: `PaperBroker`
- Model adapters: OpenAI Responses API structured outputs and Gemini structured outputs; both use safe local fallback analysis when keys are absent

## Setup

```bash
cp .env.example .env
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn app.main:app --reload --app-dir backend
```

In another shell:

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>. The API is available at <http://localhost:8000>, including interactive docs at <http://localhost:8000/docs>.

API keys are optional and must only be placed in `.env`. They are read by the backend and are never exposed to the frontend. With no keys configured, deterministic local demo analyses keep the entire MVP runnable offline.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | API mode and status |
| `GET` | `/market/{symbol}` | Mock market snapshot |
| `POST` | `/analyse` | Deterministic setup, structured analyses, consensus, risk decision |
| `POST` | `/paper-trade` | Re-run the guarded pipeline and submit only approved paper orders |
| `GET` | `/journal` | SQLite paper-trade journal |
| `GET` / `PUT` | `/risk-config` | Read or update deterministic risk limits |

## Tests

```bash
cd backend
pytest app/tests
```

## Live adapter TODOs

`MT5Adapter` and `OandaAdapter` are deliberate refusal stubs. Before implementing either:

1. Add credential configuration and secret-management review.
2. Preserve the mandatory `RiskGovernor -> ExecutionEngine -> adapter` call path.
3. Implement account-state synchronization, open-position tracking, realized daily P&L, retries, idempotency, audit logging, and broker-specific tests.
4. Keep `LIVE_TRADING_ENABLED=false` as the default. Both live stubs refuse orders unless it is explicitly enabled.
5. Review the official [MetaTrader 5 Python integration](https://www.mql5.com/en/docs/python_metatrader5) or [OANDA v20 REST API](https://developer.oanda.com/rest-live-v20/introduction/) documentation before implementation.

For model-side schema behavior, see the official [OpenAI structured outputs guide](https://developers.openai.com/api/docs/guides/structured-outputs) and [Gemini structured outputs guide](https://ai.google.dev/gemini-api/docs/structured-output).
