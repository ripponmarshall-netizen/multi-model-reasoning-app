import { useEffect, useState } from 'react'
import { useAction, useQuery } from 'convex/react'
import { api } from '../convex/_generated/api'
import type { Analysis, JournalEntry } from './api/client'
import { MarketPanel } from './components/MarketPanel'
import { RiskPanel } from './components/RiskPanel'
import { SignalPanel } from './components/SignalPanel'
import { TradeJournal } from './components/TradeJournal'

// Pulls the human-readable message out of a Convex error (rejected trades
// throw a ConvexError whose data is the reason string).
function errorMessage(error: unknown, fallback: string): string {
  const data = (error as { data?: unknown })?.data
  if (typeof data === 'string') return data
  return error instanceof Error ? error.message : fallback
}

export default function App() {
  const [symbol, setSymbol] = useState('EUR_USD')
  const [data, setData] = useState<Analysis>()
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const analyse = useAction(api.analyse.analyse)
  const paperTrade = useAction(api.paperTrade.paperTrade)
  // Reactive journal: updates automatically after a paper trade is recorded.
  const journal = (useQuery(api.journal.list) ?? []) as JournalEntry[]

  const refresh = async () => {
    setBusy(true)
    setMessage('')
    try {
      setData((await analyse({ symbol })) as Analysis)
    } catch (error) {
      setMessage(errorMessage(error, 'Unable to analyse'))
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const trade = async () => {
    setBusy(true)
    try {
      await paperTrade({ symbol })
      setMessage('Paper trade filled and written to the journal.')
      await refresh()
    } catch (error) {
      setMessage(errorMessage(error, 'Paper trade failed'))
      setBusy(false)
    }
  }

  return (
    <main>
      <header>
        <div>
          <p className="eyebrow">Guarded FX intelligence</p>
          <h1>
            Forex<span>Copilot</span>
          </h1>
        </div>
        <div className="status">
          <i /> Paper mode
        </div>
      </header>
      <section className="toolbar">
        <select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
          <option>EUR_USD</option>
          <option>GBP_USD</option>
        </select>
        <button onClick={refresh} disabled={busy}>
          Run analysis
        </button>
      </section>
      {message && <div className="notice">{message}</div>}
      {data ? (
        <>
          <MarketPanel data={data} />
          <div className="layout">
            <SignalPanel data={data} />
            <RiskPanel data={data} onTrade={trade} busy={busy} />
          </div>
          <TradeJournal entries={journal} />
        </>
      ) : (
        <section className="card">Loading guarded market analysis…</section>
      )}
      <footer>
        PaperBroker only · deterministic controls · structured model analysis
      </footer>
    </main>
  )
}
