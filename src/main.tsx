import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import App from './App'
import { AdminPage } from './components/AdminPage'
import { ErrorBoundary } from './ErrorBoundary'

const isAdmin = new URLSearchParams(window.location.search).get("admin") === "1";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      {isAdmin ? <AdminPage /> : <App />}
    </ErrorBoundary>
  </StrictMode>,
)
