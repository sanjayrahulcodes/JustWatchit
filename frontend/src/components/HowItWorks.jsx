import { useEffect, useRef, useState } from 'react'
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Scatter } from 'react-chartjs-2'

ChartJS.register(LinearScale, PointElement, Tooltip, Legend)

// 20 visually distinct cluster colors
const CLUSTER_COLORS = [
  '#7c6ff7', '#f97316', '#22c55e', '#3b82f6', '#ec4899',
  '#f59e0b', '#06b6d4', '#a855f7', '#14b8a6', '#ef4444',
  '#84cc16', '#e879f9', '#fb923c', '#34d399', '#60a5fa',
  '#f472b6', '#facc15', '#a78bfa', '#4ade80', '#38bdf8',
]

const PIPELINE_STEPS = [
  {
    icon: '🧠',
    title: 'Your Inputs',
    desc: 'Mood, genre preference & attention level are captured',
  },
  {
    icon: '📊',
    title: 'TF-IDF Vectorization',
    desc: 'Text features transformed into a 500-dimension numeric vector',
  },
  {
    icon: '🔮',
    title: 'KMeans Cluster Match',
    desc: 'Your vector is mapped to the nearest of 20 movie clusters',
  },
  {
    icon: '🏆',
    title: 'Cosine Similarity Ranking',
    desc: 'Top film chosen by highest directional similarity to your taste',
  },
]

export default function HowItWorks({ activeSteps, loading, darkMode }) {
  const [vizData, setVizData] = useState([])
  const [highlighted, setHighlighted] = useState(null)
  const chartRef = useRef(null)

  useEffect(() => {
    fetch('/cluster_viz.json')
      .then(r => r.json())
      .then(setVizData)
      .catch(() => setVizData([]))
  }, [])

  // Group by cluster for datasets
  const clusters = {}
  vizData.forEach(m => {
    const c = m.cluster
    if (!clusters[c]) clusters[c] = []
    clusters[c].push(m)
  })

  const datasets = Object.entries(clusters).map(([clusterIdStr, movies]) => {
    const clusterId = Number(clusterIdStr)
    const color = CLUSTER_COLORS[clusterId % CLUSTER_COLORS.length]
    return {
      label: `Cluster ${clusterId}`,
      data: movies.map(m => ({
        x: m.pca_x,
        y: m.pca_y,
        title: m.title,
        genres: m.genres_str,
        cluster: clusterId,
      })),
      backgroundColor: color + 'bb',
      borderColor: color,
      borderWidth: 1,
      pointRadius: 5,
      pointHoverRadius: 8,
    }
  })

  // Add highlighted movie as extra dataset
  if (highlighted) {
    datasets.push({
      label: '🎬 Your Match',
      data: [{ x: highlighted.pca_x, y: highlighted.pca_y, title: highlighted.title, genres: '' }],
      backgroundColor: '#fff',
      borderColor: '#7c6ff7',
      borderWidth: 3,
      pointRadius: 12,
      pointHoverRadius: 14,
    })
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 800 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: darkMode ? '#1e2535' : '#fff',
        titleColor: darkMode ? '#f1f5f9' : '#0f172a',
        bodyColor: darkMode ? '#94a3b8' : '#64748b',
        borderColor: '#7c6ff7',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          title: ctx => ctx[0]?.raw?.title || '',
          label: ctx => ctx.raw?.genres ? `Genres: ${ctx.raw.genres}` : 'Your recommended film',
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Principal Component 1',
          color: darkMode ? '#94a3b8' : '#64748b',
          font: { size: 11 },
        },
        grid: { color: darkMode ? '#1e2535' : '#e2e8f0' },
        ticks: { color: darkMode ? '#475569' : '#94a3b8', maxTicksLimit: 6 },
      },
      y: {
        title: {
          display: true,
          text: 'Principal Component 2',
          color: darkMode ? '#94a3b8' : '#64748b',
          font: { size: 11 },
        },
        grid: { color: darkMode ? '#1e2535' : '#e2e8f0' },
        ticks: { color: darkMode ? '#475569' : '#94a3b8', maxTicksLimit: 6 },
      },
    },
  }

  return (
    <section className="space-y-10">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gradient mb-1">How the model thinks</h2>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Powered by unsupervised machine learning on the TMDB 5000 dataset
        </p>
      </div>

      {/* Part A: Pipeline */}
      <div className="rounded-2xl p-6 glass">
        <h3 className="text-sm font-bold uppercase tracking-widest mb-6" style={{ color: 'var(--muted)' }}>
          Recommendation Pipeline
        </h3>

        {/* Desktop: horizontal */}
        <div className="hidden md:flex items-start gap-0">
          {PIPELINE_STEPS.map((step, i) => (
            <div key={i} className="flex items-start flex-1 gap-0">
              <div className="flex flex-col items-center flex-1">
                {/* Step bubble */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-3 transition-all duration-500 ${activeSteps.includes(i) ? 'step-active scale-110' : 'step-inactive'}`}>
                  {step.icon}
                </div>
                {/* Step number badge */}
                <div className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center mb-2"
                  style={{
                    background: activeSteps.includes(i) ? '#7c6ff7' : '#1e2535',
                    color: '#fff',
                  }}>
                  {i + 1}
                </div>
                <p className="text-xs font-bold text-center"
                  style={{ color: activeSteps.includes(i) ? '#7c6ff7' : 'var(--text)' }}>
                  {step.title}
                </p>
                <p className="text-xs text-center mt-1 leading-relaxed px-2"
                  style={{ color: 'var(--muted)' }}>
                  {step.desc}
                </p>
              </div>

              {/* Connector */}
              {i < PIPELINE_STEPS.length - 1 && (
                <div className="self-start mt-7 flex-shrink-0 w-8 h-0.5 transition-all duration-500"
                  style={{
                    background: activeSteps.includes(i + 1)
                      ? 'linear-gradient(90deg, #7c6ff7, #a89af9)'
                      : '#1e2535',
                  }} />
              )}
            </div>
          ))}
        </div>

        {/* Mobile: vertical */}
        <div className="md:hidden space-y-4">
          {PIPELINE_STEPS.map((step, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-xl transition-all duration-500 ${activeSteps.includes(i) ? 'step-active' : 'step-inactive'}`}>
                {step.icon}
              </div>
              <div>
                <p className="text-sm font-bold"
                  style={{ color: activeSteps.includes(i) ? '#7c6ff7' : 'var(--text)' }}>
                  {i + 1}. {step.title}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {loading && (
          <div className="mt-4 flex items-center gap-2 justify-center text-xs" style={{ color: '#7c6ff7' }}>
            <div className="animate-spin w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full" />
            Processing your inputs through the pipeline…
          </div>
        )}
      </div>

      {/* Part B: Scatter plot */}
      <div className="rounded-2xl p-6 glass">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
            Movie Cluster Landscape
          </h3>
          {vizData.length > 0 && (
            <span className="text-xs px-2 py-1 rounded-lg"
              style={{ background: 'rgba(124,111,247,0.15)', color: '#a89af9' }}>
              {vizData.length} movies · 20 clusters
            </span>
          )}
        </div>

        {vizData.length === 0 ? (
          <div className="h-72 flex items-center justify-center flex-col gap-3"
            style={{ color: 'var(--muted)' }}>
            <div className="text-4xl opacity-40">📊</div>
            <p className="text-sm">Run <code className="px-1.5 py-0.5 rounded text-xs"
              style={{ background: 'var(--surface)', color: '#7c6ff7' }}>
              python train_model.py
            </code> to generate the visualization</p>
          </div>
        ) : (
          <div className="h-80 md:h-96">
            <Scatter ref={chartRef} data={{ datasets }} options={chartOptions} />
          </div>
        )}

        {/* Legend */}
        {vizData.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: CLUSTER_COLORS[i] }} />
                <span className="text-xs" style={{ color: 'var(--muted)' }}>C{i}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
