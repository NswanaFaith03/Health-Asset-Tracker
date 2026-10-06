import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { Toaster } from 'react-hot-toast'
import './index.css'
import { Analytics } from '@vercel/analytics/react'
import App from './App.jsx'

// Enable Tailwind-scoped light theme by default
if (typeof document !== 'undefined') {
  document.documentElement.classList.add('theme-light')
}

// Dev-only: suppress noisy extension-injected console messages (MetaMask/contentscript)
// Keeps real app errors visible while filtering known extension patterns.
if (import.meta.env.DEV && typeof window !== 'undefined') {
  const filterRegex = /MetaMask|inpage|contentscript|chrome-extension:\/\/|Could not establish connection|MaxListenersExceededWarning|Receiving end does not exist/i
  const origConsoleError = console.error.bind(console)
  const origConsoleWarn = console.warn.bind(console)

  console.error = (...args) => {
    try {
      if (args.some(a => typeof a === 'string' && filterRegex.test(a))) return
      if (args.some(a => a && typeof a.message === 'string' && filterRegex.test(a.message))) return
    } catch (e) { }
    origConsoleError(...args)
  }

  console.warn = (...args) => {
    try {
      if (args.some(a => typeof a === 'string' && filterRegex.test(a))) return
      if (args.some(a => a && typeof a.message === 'string' && filterRegex.test(a.message))) return
    } catch (e) { }
    origConsoleWarn(...args)
  }

  window.addEventListener(
    'error',
    (ev) => {
      try {
        const m = ev?.message || ev?.error?.message || ''
        if (filterRegex.test(m) || (ev?.filename && /chrome-extension:\/\//.test(ev.filename))) {
          ev.stopImmediatePropagation()
        }
      } catch (e) { }
    },
    true,
  )

  window.addEventListener(
    'unhandledrejection',
    (ev) => {
      try {
        const reason = ev?.reason
        const text = typeof reason === 'string' ? reason : (reason && reason.message) || ''
        if (filterRegex.test(text)) ev.preventDefault()
      } catch (e) { }
    },
    true,
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
        <Analytics />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
