import { useState } from 'react'

const GENRE_COLORS = {
  Action: '#f97316',
  Comedy: '#f59e0b',
  Drama: '#8b5cf6',
  Thriller: '#ef4444',
  'Science Fiction': '#06b6d4',
  'Sci-Fi': '#06b6d4',
  Horror: '#dc2626',
  Romance: '#ec4899',
  Documentary: '#22c55e',
  Animation: '#f472b6',
  Crime: '#78716c',
  Adventure: '#fb923c',
  Family: '#84cc16',
  Mystery: '#a78bfa',
  Fantasy: '#c084fc',
  History: '#92400e',
  Music: '#0ea5e9',
  War: '#6b7280',
  Western: '#d97706',
}

/** Gradient placeholder shown when no poster URL is available */
function PosterFallback({ title, genres }) {
  const firstGenre = (genres || [])[0] || ''
  const accentColor = GENRE_COLORS[firstGenre] || '#7c6ff7'
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-3"
      style={{
        background: `linear-gradient(135deg, #0f1117 0%, ${accentColor}33 50%, #161b27 100%)`,
      }}>
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-lg"
        style={{ background: `${accentColor}22`, border: `2px solid ${accentColor}55` }}>
        🎬
      </div>
      <p className="text-white/60 text-xs text-center px-4 font-medium">{title}</p>
      <p className="text-white/30 text-xs">No poster available</p>
    </div>
  )
}

function Stars({ rating }) {
  const filled = Math.round(rating / 2)
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className="text-sm" style={{ color: i <= filled ? '#f59e0b' : '#374151' }}>★</span>
      ))}
      <span className="ml-1 text-xs font-semibold" style={{ color: '#f59e0b' }}>{rating}/10</span>
    </div>
  )
}

export default function ResultCard({ result, onReset, onWatchlist, inWatchlist }) {
  const { title, genres, overview, runtime, rating, cluster_id, similarity, reason, poster_url } = result
  const [imgFailed, setImgFailed] = useState(false)

  const showPoster = poster_url && !imgFailed

  return (
    <section
      className="rounded-2xl overflow-hidden glass animate-fade-slide-up"
      style={{ animationFillMode: 'forwards' }}>

      {/* Poster header */}
      <div className="relative h-64 overflow-hidden">
        {showPoster ? (
          <img
            src={poster_url}
            alt={`${title} poster`}
            className="w-full h-full object-cover"
            onError={() => setImgFailed(true)}
            style={{ filter: 'brightness(0.72)' }}
          />
        ) : (
          <PosterFallback title={title} genres={genres} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h2 className="text-2xl font-extrabold text-white leading-tight drop-shadow">{title}</h2>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {(genres || []).slice(0, 4).map(g => (
              <span key={g}
                className="px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
                style={{ background: GENRE_COLORS[g] || '#7c6ff7', opacity: 0.9 }}>
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* Meta */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--muted)' }}>
            <span>🕐</span>
            <span>{runtime} min</span>
          </div>
          <Stars rating={rating} />
        </div>

        {/* Overview */}
        <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
          {overview}
        </p>

        {/* Why this film */}
        <div className="rounded-xl p-4 border"
          style={{ background: 'rgba(124,111,247,0.08)', borderColor: 'rgba(124,111,247,0.25)' }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#7c6ff7' }}>
            Why this film?
          </p>
          <div className="flex gap-3 text-xs mb-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg font-semibold"
              style={{ background: 'rgba(124,111,247,0.2)', color: '#a89af9' }}>
              Cluster #{cluster_id}
            </span>
            <span className="px-2.5 py-1 rounded-lg font-semibold"
              style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}>
              {similarity}% match
            </span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
            {reason}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          {/* Watchlist toggle */}
          <button
            id="watchlist-btn"
            onClick={() => onWatchlist(result)}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
            style={{
              background: inWatchlist
                ? 'linear-gradient(135deg, #7c6ff7, #a89af9)'
                : 'rgba(124,111,247,0.12)',
              color: inWatchlist ? '#fff' : '#a89af9',
              border: inWatchlist ? 'none' : '1px solid rgba(124,111,247,0.3)',
              boxShadow: inWatchlist ? '0 4px 20px rgba(124,111,247,0.35)' : 'none',
            }}>
            {inWatchlist ? '✓ Saved' : '+ Watchlist'}
          </button>

          {/* Try again */}
          <button
            id="try-again-btn"
            onClick={onReset}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105"
            style={{ background: 'var(--surface)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
            ↺ Try again
          </button>
        </div>
      </div>
    </section>
  )
}
