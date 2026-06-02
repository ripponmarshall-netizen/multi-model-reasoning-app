import { useEffect, useState } from 'react'
import { analyse, getJournal, paperTrade, type Analysis, type JournalEntry } from './api/client'
import { MarketPanel } from './components/MarketPanel'
import { RiskPanel } from './components/RiskPanel'
import { SignalPanel } from './components/SignalPanel'
import { TradeJournal } from './components/TradeJournal'
export default function App() { const [symbol, setSymbol] = useState('EUR_USD'); const [data, setData] = useState<Analysis>(); const [journal, setJournal] = useState<JournalEntry[]>([]); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false)
const refresh = async () => { setBusy(true); setMessage(''); try { setData(await analyse(symbol)); setJournal(await getJournal()) } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to analyse') } finally { setBusy(false) } }
useEffect(() => { refresh() }, [])
const trade = async () => { setBusy(true); try { await paperTrade(symbol); setMessage('Paper trade filled and written to the journal.'); await refresh() } catch (error) { setMessage(error instanceof Error ? error.message : 'Paper trade failed'); setBusy(false) } }
return <main><header><div><p className="eyebrow">Guarded FX intelligence</p><h1>Forex<span>Copilot</span></h1></div><div className="status"><i/> Paper mode</div></header><section className="toolbar"><select value={symbol} onChange={e => setSymbol(e.target.value)}><option>EUR_USD</option><option>GBP_USD</option></select><button onClick={refresh} disabled={busy}>Run analysis</button></section>{message && <div className="notice">{message}</div>}{data ? <><MarketPanel data={data}/><div className="layout"><SignalPanel data={data}/><RiskPanel data={data} onTrade={trade} busy={busy}/></div><TradeJournal entries={journal}/></> : <section className="card">Loading guarded market analysis…</section>}<footer>PaperBroker only · deterministic controls · structured model analysis</footer></main> }
