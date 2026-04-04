import { useState, useEffect } from 'react'
import InputPanel from './components/InputPanel'
import ResultCard from './components/ResultCard'
import HowItWorks from './components/HowItWorks'
import WatchList from './components/WatchList'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const WATCHLIST_KEY = 'jwi_watchlist'

function loadWatchlist() {
  try {
    return JSON.parse(localStorage.getItem(WATCHLIST_KEY) || '[]')
  } catch {
    return []
  }
}

function saveWatchlist(list) {
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list))
}

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') !== 'light'
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [activeSteps, setActiveSteps] = useState([])
  const [watchlist, setWatchlist] = useState(loadWatchlist)
  const [activeTab, setActiveTab] = useState('explore') // 'explore' | 'watchlist'

  useEffect(() => {
    const root = document.documentElement
    if (darkMode) {
      root.classList.add('dark')
      root.classList.remove('light')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  const handleSubmit = async ({ mood, genre, attention }) => {
    setLoading(true)
    setResult(null)
    setError(null)
    setActiveSteps([0])

    setTimeout(() => setActiveSteps([0, 1]), 400)
    setTimeout(() => setActiveSteps([0, 1, 2]), 900)
    setTimeout(() => setActiveSteps([0, 1, 2, 3]), 1400)

    try {
      const res = await fetch(`${API_BASE}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, genre, attention }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Server error')
      }
      const data = await res.json()
      setTimeout(() => {
        setResult(data)
        setLoading(false)
      }, 1600)
    } catch (e) {
      setTimeout(() => {
        setError(e.message)
        setLoading(false)
        setActiveSteps([])
      }, 1600)
    }
  }

  const handleReset = () => {
    setResult(null)
    setError(null)
    setActiveSteps([])
  }

  const handleWatchlist = (movie) => {
    setWatchlist(prev => {
      const exists = prev.some(m => m.title === movie.title)
      const next = exists
        ? prev.filter(m => m.title !== movie.title)
        : [movie, ...prev]
      saveWatchlist(next)
      return next
    })
  }

  const handleRemoveFromWatchlist = (title) => {
    setWatchlist(prev => {
      const next = prev.filter(m => m.title !== title)
      saveWatchlist(next)
      return next
    })
  }

  const isInWatchlist = (title) => watchlist.some(m => m.title === title)

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark' : 'light'}`}
      style={{ background: darkMode ? '#0f1117' : '#f0f4ff' }}>

      {/* Ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse-slow"
          style={{ background: 'radial-gradient(circle, #7c6ff7, transparent)' }} />
        <div className="absolute top-1/2 -right-32 w-80 h-80 rounded-full opacity-15 blur-3xl animate-pulse-slow"
          style={{ background: 'radial-gradient(circle, #ec4899, transparent)', animationDelay: '1.5s' }} />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full opacity-10 blur-3xl animate-pulse-slow"
          style={{ background: 'radial-gradient(circle, #f97316, transparent)', animationDelay: '3s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: darkMode ? '#1e2535' : '#e2e8f0' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #7c6ff7, #a89af9)' }}>
            🎬
          </div>
          <span className="font-bold text-lg tracking-tight text-gradient">JustWatchIt</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab switcher */}
          <div className="flex rounded-xl overflow-hidden p-0.5 gap-0.5"
            style={{ background: darkMode ? '#1e2535' : '#e2e8f0' }}>
            <button
              id="tab-explore"
              onClick={() => setActiveTab('explore')}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
              style={{
                background: activeTab === 'explore' ? '#7c6ff7' : 'transparent',
                color: activeTab === 'explore' ? '#fff' : 'var(--muted)',
              }}>
              🔍 Explore
            </button>
            <button
              id="tab-watchlist"
              onClick={() => setActiveTab('watchlist')}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5"
              style={{
                background: activeTab === 'watchlist' ? '#7c6ff7' : 'transparent',
                color: activeTab === 'watchlist' ? '#fff' : 'var(--muted)',
              }}>
              📋 Watchlist
              {watchlist.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-xs font-bold leading-none"
                  style={{
                    background: activeTab === 'watchlist' ? 'rgba(255,255,255,0.25)' : '#7c6ff7',
                    color: '#fff',
                  }}>
                  {watchlist.length}
                </span>
              )}
            </button>
          </div>

          <button
            id="theme-toggle"
            onClick={() => setDarkMode(d => !d)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
            style={{
              background: darkMode ? '#1e2535' : '#e2e8f0',
              color: darkMode ? '#f1f5f9' : '#0f172a',
            }}>
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-10">

        {/* ── Explore tab ─────────────────────────────────────────────── */}
        {activeTab === 'explore' && (
          <>
            <div className={`gap-8 ${result ? 'lg:grid lg:grid-cols-2' : ''}`}>
              <div>
                <InputPanel onSubmit={handleSubmit} loading={loading} onReset={handleReset} hasResult={!!result} />
                {error && (
                  <div className="mt-4 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
                    ⚠️ {error}
                  </div>
                )}
              </div>

              {result && (
                <div>
                  <ResultCard
                    result={result}
                    onReset={handleReset}
                    darkMode={darkMode}
                    onWatchlist={handleWatchlist}
                    inWatchlist={isInWatchlist(result.title)}
                  />
                </div>
              )}
            </div>

            <div className="mt-16">
              <HowItWorks activeSteps={activeSteps} loading={loading} darkMode={darkMode} />
            </div>
          </>
        )}

        {/* ── Watchlist tab ────────────────────────────────────────────── */}
        {activeTab === 'watchlist' && (
          <div className="max-w-2xl mx-auto">
            <WatchList
              watchlist={watchlist}
              onRemove={handleRemoveFromWatchlist}
              darkMode={darkMode}
            />
          </div>
        )}
      </main>

      <footer className="relative z-10 text-center py-8 text-xs"
        style={{ color: darkMode ? '#475569' : '#94a3b8' }}>
        Built with FastAPI · scikit-learn · React · Chart.js &nbsp;·&nbsp; Dataset: TMDB 5000
      </footer>
    </div>
  )
}
