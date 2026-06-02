// Shown when VITE_CONVEX_URL is not configured at build time, so the
// deployed page explains how to connect the Convex backend instead of
// failing silently.
export function ConfigureNotice() {
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
          <i /> Backend not configured
        </div>
      </header>
      <section className="card">
        <p className="eyebrow">Setup required</p>
        <h3>Connect the Convex backend</h3>
        <p>
          This site was built without a <code>VITE_CONVEX_URL</code>. Deploy
          the Convex functions with <code>npx convex deploy</code>, then set the
          repository variable <code>VITE_CONVEX_URL</code> to your Convex
          deployment URL and re-run the GitHub Pages workflow.
        </p>
      </section>
      <footer>
        PaperBroker only · deterministic controls · structured model analysis
      </footer>
    </main>
  )
}
