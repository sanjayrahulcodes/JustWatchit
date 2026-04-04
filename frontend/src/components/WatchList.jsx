import { useState } from 'react'

const GENRE_COLORS = {
  Action: '#f97316', Comedy: '#f59e0b', Drama: '#8b5cf6',
  Thriller: '#ef4444', 'Science Fiction': '#06b6d4', Horror: '#dc2626',
  Romance: '#ec4899', Documentary: '#22c55e', Animation: '#f472b6',
  Crime: '#78716c', Adventure: '#fb923c', Family: '#84cc16',
  Mystery: '#a78bfa', Fantasy: '#c084fc',
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
        style={{ background: 'rgba(124,111,247,0.1)', border: '2px dashed rgba(124,111,247,0.3)' }}>
        🎬
      </div>
      <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Your watchlist is empty</p>
      <p className="text-xs text-center max-w-xs" style={{ color: 'var(--muted)' }}>
        Get a recommendation and click <strong>+ Watchlist</strong> to save films here
      </p>
    </div>
  )
}

function WatchCard({ movie, onRemove, darkMode }) {
  const [removing, setRemoving] = useState(false)

  const handleRemove = () => {
    setRemoving(true)
    setTimeout(() => onRemove(movie.title), 280)
  }

  return (
    <div
      className={`rounded-xl overflow-hidden flex gap-0 transition-all duration-300 ${removing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
      style={{ background: darkMode ? '#1e2535' : '#fff', border: `1px solid ${darkMode ? '#2d3748' : '#e2e8f0'}` }}>

      {/* Poster thumbnail */}
      <div className="w-16 flex-shrink-0 relative overflow-hidden"
        style={{ minHeight: '96px' }}>
        {movie.poster_url ? (
          <img src={movie.poster_url} alt={movie.title}
            className="w-full h-full object-cover"
            onError={e => { e.target.style.display = 'none' }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl"
            style={{ background: 'linear-gradient(135deg, #1e2535, #7c6ff733)' }}>
            🎬
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 p-3 min-w-0">
        <p className="font-bold text-sm leading-tight truncate" style={{ color: 'var(--text)' }}>
          {movie.title}
        </p>
        <div className="flex gap-1 mt-1 flex-wrap">
          {(movie.genres || []).slice(0, 2).map(g => (
            <span key={g} className="px-1.5 py-0.5 rounded text-xs font-semibold"
              style={{ background: (GENRE_COLORS[g] || '#7c6ff7') + '22', color: GENRE_COLORS[g] || '#7c6ff7' }}>
              {g}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-1.5 text-xs" style={{ color: 'var(--muted)' }}>
          <span>⭐ {movie.rating}</span>
          <span>🕐 {movie.runtime}m</span>
        </div>
      </div>

      {/* Remove button */}
      <div className="flex-shrink-0 flex items-center pr-3">
        <button
          onClick={handleRemove}
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all duration-200 hover:scale-110"
          style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}
          title="Remove from watchlist">
          ✕
        </button>
      </div>
    </div>
  )
}

export default function WatchList({ watchlist, onRemove, darkMode }) {
  const [filter, setFilter] = useState('')

  const filtered = watchlist.filter(m =>
    m.title.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <section className="rounded-2xl glass p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gradient flex items-center gap-2">
            📋 My Watchlist
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
            {watchlist.length} {watchlist.length === 1 ? 'film' : 'films'} saved
          </p>
        </div>

        {watchlist.length > 0 && (
          <input
            type="text"
            placeholder="Search watchlist…"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm w-48 focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{
              background: darkMode ? '#0f1117' : '#f0f4ff',
              color: 'var(--text)',
              border: '1px solid var(--border)',
            }}
          />
        )}
      </div>

      {/* Content */}
      {watchlist.length === 0 ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <p className="text-center text-sm py-8" style={{ color: 'var(--muted)' }}>
          No films matching "{filter}"
        </p>
      ) : (
        <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
          {filtered.map(movie => (
            <WatchCard key={movie.title} movie={movie} onRemove={onRemove} darkMode={darkMode} />
          ))}
        </div>
      )}

      {/* Clear all */}
      {watchlist.length > 0 && (
        <button
          onClick={() => watchlist.forEach(m => onRemove(m.title))}
          className="mt-4 w-full py-2 rounded-xl text-xs font-semibold transition-all duration-200 hover:scale-105"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
          Clear all
        </button>
      )}
    </section>
  )
}
