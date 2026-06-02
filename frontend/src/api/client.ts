export type Analysis = {
  market: { symbol: string; bid: number; ask: number; spread: number; session: string; as_of: string }
  indicators: { regime: string; ema_fast: number; ema_slow: number; rsi: number; atr: number; session_allowed: boolean; spread_allowed: boolean }
  candidate: { side: string; entry_price: number; stop_loss: number; take_profit: number; units: number; risk_amount: number; rationale: string[] }
  consensus: { bias: string; confidence: number; trade_allowed: boolean; disagreement_high: boolean; reason: string; openai: LLMAnalysis; gemini: LLMAnalysis }
  risk: { approved: boolean; reasons: string[] }
}
export type LLMAnalysis = { bias: string; confidence: number; trade_allowed: boolean; risk_flags: string[]; reason: string }
export type JournalEntry = { id: number; created_at: string; symbol: string; side: string; units: number; entry_price: number; status: string; order_id: string }
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'
async function json<T>(path: string, init?: RequestInit): Promise<T> { const response = await fetch(`${API}${path}`, { headers: { 'Content-Type': 'application/json' }, ...init }); if (!response.ok) throw new Error((await response.json()).detail || 'Request failed'); return response.json() }
export const analyse = (symbol: string) => json<Analysis>('/analyse', { method: 'POST', body: JSON.stringify({ symbol }) })
export const paperTrade = (symbol: string) => json('/paper-trade', { method: 'POST', body: JSON.stringify({ symbol }) })
export const getJournal = () => json<JournalEntry[]>('/journal')
