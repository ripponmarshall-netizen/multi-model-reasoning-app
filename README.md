# ForexCopilot

ForexCopilot is a guarded forex-analysis MVP. Deterministic TypeScript code creates strategy candidates, enforces risk limits, and controls execution. ChatGPT/OpenAI and Gemini may contribute **structured JSON analysis only**; neither adapter has access to a broker. The only implemented broker is a `PaperBroker`.

The backend runs on **Convex** (TypeScript serverless functions + database) and the React frontend is deployed to **GitHub Pages**.

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

Every order is re-analysed and passed through `RiskGovernor` immediately before a (paper) order can be submitted. The governor rejects orders when the daily-loss limit is reached, too many trades are open, spread or per-trade risk is excessive, model disagreement is high, confidence is too low, or model consensus does not allow trading. LLM prose never becomes an order.

## Stack

- Backend: Convex (Deno/TypeScript serverless functions, Convex database)
- Frontend: React 19, Vite, TypeScript — deployed to GitHub Pages
- Broker: `PaperBroker`
- Model adapters: OpenAI Responses API structured outputs and Gemini structured outputs; both use safe local fallback analysis when keys are absent

## Project layout

```text
frontend/
  convex/            # Convex backend (schema, functions, ported pipeline)
    lib/             # pure logic: market data, features, strategy, risk, consensus, LLM
    schema.ts        # journal + riskConfig tables
    analyse.ts       # action  -> /analyse
    paperTrade.ts    # action  -> /paper-trade
    journal.ts       # query + internal mutation -> /journal
    riskConfig.ts    # query + mutation -> /risk-config
  src/               # React dashboard (Convex React client)
```

## Setup

Install dependencies and start the Convex backend (this also generates `convex/_generated`):

```bash
cd frontend
npm install
npx convex dev        # logs in, creates/links a Convex project, runs the backend
```

In another shell, start the frontend:

```bash
cd frontend
npm run dev
```

`npx convex dev` writes `frontend/.env.local` with `VITE_CONVEX_URL`, which the dev server reads automatically. Open the printed Vite URL (default <http://localhost:5173>).

API keys are optional. Set them as Convex environment variables (never in the frontend):

```bash
npx convex env set OPENAI_API_KEY sk-...
npx convex env set GEMINI_API_KEY ...
```

With no keys configured, deterministic local demo analyses keep the entire MVP runnable offline.

## Convex functions (API parity)

| Type | Function | Replaces | Purpose |
| --- | --- | --- | --- |
| query | `health.health` | `GET /health` | API mode and status |
| action | `market.snapshot` | `GET /market/{symbol}` | Mock market snapshot |
| action | `analyse.analyse` | `POST /analyse` | Deterministic setup, structured analyses, consensus, risk decision |
| action | `paperTrade.paperTrade` | `POST /paper-trade` | Re-run the guarded pipeline and submit only approved paper orders |
| query | `journal.list` | `GET /journal` | Paper-trade journal (reactive) |
| query / mutation | `riskConfig.get` / `riskConfig.update` | `GET` / `PUT /risk-config` | Read or update deterministic risk limits |

## Deploy

**Backend (Convex):**

```bash
cd frontend
npx convex deploy     # deploys functions to your Convex production deployment
```

**Frontend (GitHub Pages):**

1. In the repository: **Settings → Pages → Build and deployment → Source = GitHub Actions**.
2. Add a repository variable **`VITE_CONVEX_URL`** (Settings → Secrets and variables → Actions → Variables) set to your Convex deployment URL (e.g. `https://your-deployment.convex.cloud`).
3. Push to `main`. The workflow in `.github/workflows/deploy.yml` builds `frontend/` and deploys it.

The site is served at `https://<owner>.github.io/multi-model-reasoning-app/`. If you host under a different path or a custom domain, set `VITE_BASE_PATH` accordingly (see `frontend/vite.config.ts`).

## Live adapter TODOs

Live brokers are intentionally not implemented. Before adding one (e.g. MetaTrader 5 or OANDA):

1. Add credential configuration and secret-management review (Convex environment variables).
2. Preserve the mandatory `RiskGovernor -> execution -> adapter` call path inside the guarded action.
3. Implement account-state synchronization, open-position tracking, realized daily P&L, retries, idempotency, audit logging, and broker-specific tests.
4. Keep `LIVE_TRADING_ENABLED=false` as the default and refuse orders unless it is explicitly enabled.
5. Review the official [MetaTrader 5 Python integration](https://www.mql5.com/en/docs/python_metatrader5) or [OANDA v20 REST API](https://developer.oanda.com/rest-live-v20/introduction/) documentation before implementation.

For model-side schema behavior, see the official [OpenAI structured outputs guide](https://developers.openai.com/api/docs/guides/structured-outputs) and [Gemini structured outputs guide](https://ai.google.dev/gemini-api/docs/structured-output).
