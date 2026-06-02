// Shared frontend view types. Network access now goes through the Convex
// React client (see main.tsx / App.tsx) rather than fetch, but the data
// shapes the UI consumes are unchanged.

export type Analysis = {
  market: {
    symbol: string
    bid: number
    ask: number
    spread: number
    session: string
    as_of: string
  }
  indicators: {
    regime: string
    ema_fast: number
    ema_slow: number
    rsi: number
    atr: number
    session_allowed: boolean
    spread_allowed: boolean
  }
  candidate: {
    side: string
    entry_price: number
    stop_loss: number
    take_profit: number
    units: number
    risk_amount: number
    rationale: string[]
  }
  consensus: {
    bias: string
    confidence: number
    trade_allowed: boolean
    disagreement_high: boolean
    reason: string
    openai: LLMAnalysis
    gemini: LLMAnalysis
  }
  risk: { approved: boolean; reasons: string[] }
}

export type LLMAnalysis = {
  bias: string
  confidence: number
  trade_allowed: boolean
  risk_flags: string[]
  reason: string
}

export type JournalEntry = {
  id: string
  created_at: string
  symbol: string
  side: string
  units: number
  entry_price: number
  status: string
  order_id: string
}
