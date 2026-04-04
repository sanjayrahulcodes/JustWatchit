import { useState } from 'react'

const MOODS = [
  { id: 'happy', label: '😄 Happy', color: '#f59e0b' },
  { id: 'sad', label: '😢 Sad', color: '#3b82f6' },
  { id: 'excited', label: '🤩 Excited', color: '#f97316' },
  { id: 'anxious', label: '😬 Anxious', color: '#ef4444' },
  { id: 'relaxed', label: '😌 Relaxed', color: '#22c55e' },
  { id: 'bored', label: '😐 Bored', color: '#6b7280' },
  { id: 'romantic', label: '🥰 Romantic', color: '#ec4899' },
]

const GENRES = [
  'Action', 'Comedy', 'Drama', 'Thriller', 'Sci-Fi',
  'Horror', 'Romance', 'Documentary', 'Animation', 'Crime',
]

const ATTENTION_LEVELS = [
  { id: 'low', label: 'Low', desc: 'Want something easy' },
  { id: 'medium', label: 'Medium', desc: "I'm focused" },
  { id: 'high', label: 'High', desc: 'Give me something complex' },
]

export default function InputPanel({ onSubmit, loading, onReset, hasResult }) {
  const [mood, setMood] = useState('')
  const [genre, setGenre] = useState('')
  const [attention, setAttention] = useState('medium')

  const attentionIndex = ATTENTION_LEVELS.findIndex(a => a.id === attention)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!mood || !genre) return
    onSubmit({ mood, genre, attention })
  }

  const isValid = mood && genre

  return (
    <section className="rounded-2xl p-7 glass" style={{ minHeight: '420px' }}>
      {/* Hero text */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-extrabold text-gradient mb-2">
          What should I watch tonight?
        </h1>
        <p className="text-base" style={{ color: 'var(--muted)' }}>
          Tell us how you feel and we'll find your perfect film.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-7">
        {/* Mood selector */}
        <div>
          <label className="block text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
            Your mood
          </label>
          <div className="flex flex-wrap gap-2">
            {MOODS.map(m => (
              <button
                key={m.id}
                type="button"
                id={`mood-${m.id}`}
                onClick={() => setMood(m.id)}
                className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
                style={{
                  background: mood === m.id ? m.color : 'transparent',
                  color: mood === m.id ? '#fff' : 'var(--muted)',
                  border: `2px solid ${mood === m.id ? m.color : 'var(--border)'}`,
                  boxShadow: mood === m.id ? `0 0 16px ${m.color}55` : 'none',
                }}>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Genre dropdown */}
        <div>
          <label htmlFor="genre-select" className="block text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
            Genre preference
          </label>
          <select
            id="genre-select"
            value={genre}
            onChange={e => setGenre(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm font-medium appearance-none cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT"
            style={{
              background: 'var(--surface)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
            }}>
            <option value="">Select a genre…</option>
            {GENRES.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* Attention level slider */}
        <div>
          <label className="block text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
            Attention level
          </label>
          <div className="px-1">
            <input
              id="attention-slider"
              type="range"
              min={0}
              max={2}
              step={1}
              value={attentionIndex}
              onChange={e => setAttention(ATTENTION_LEVELS[Number(e.target.value)].id)}
              className="w-full h-2 rounded-full cursor-pointer accent-purple-500"
              style={{ accentColor: '#7c6ff7' }}
            />
            <div className="flex justify-between mt-2">
              {ATTENTION_LEVELS.map((a, i) => (
                <div key={a.id} className="text-center flex-1">
                  <p className={`text-xs font-semibold ${attention === a.id ? 'text-accent' : ''}`}
                    style={{ color: attention === a.id ? '#7c6ff7' : 'var(--muted)' }}>
                    {a.label}
                  </p>
                  <p className="text-xs mt-0.5 hidden sm:block" style={{ color: 'var(--muted)', opacity: 0.7 }}>
                    {a.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit / Reset buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            id="find-movie-btn"
            disabled={!isValid || loading}
            className="flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              background: isValid && !loading ? 'linear-gradient(135deg, #7c6ff7, #a89af9)' : '#2d3748',
              color: '#fff',
              boxShadow: isValid && !loading ? '0 4px 20px rgba(124,111,247,0.4)' : 'none',
            }}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Finding your film…
              </span>
            ) : '🎬 Find my movie'}
          </button>

          {hasResult && (
            <button
              type="button"
              id="reset-btn"
              onClick={onReset}
              className="px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105"
              style={{ background: 'var(--surface)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
              ↺ Reset
            </button>
          )}
        </div>

        {!isValid && (
          <p className="text-xs text-center" style={{ color: 'var(--muted)' }}>
            {!mood && !genre ? 'Pick a mood and genre to get started' : !mood ? 'Pick a mood' : 'Pick a genre'}
          </p>
        )}
      </form>
    </section>
  )
}
