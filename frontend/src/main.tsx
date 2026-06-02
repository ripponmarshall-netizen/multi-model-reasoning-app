import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import App from './App'
import { ConfigureNotice } from './ConfigureNotice'
import './styles.css'

const convexUrl = import.meta.env.VITE_CONVEX_URL
const root = createRoot(document.getElementById('root')!)

// Without a Convex deployment URL the backend is unreachable, so render a
// setup notice instead of crashing on an empty client URL.
if (!convexUrl) {
  root.render(<StrictMode><ConfigureNotice /></StrictMode>)
} else {
  const convex = new ConvexReactClient(convexUrl)
  root.render(
    <StrictMode>
      <ConvexProvider client={convex}>
        <App />
      </ConvexProvider>
    </StrictMode>,
  )
}
