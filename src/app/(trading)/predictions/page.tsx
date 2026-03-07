'use client'
import { useState, useEffect } from 'react'
import { formatCurrency, formatChangePercent, cn } from '@/lib/utils'

interface TechnicalScore {
  name: string
  value: number
  signal: string
  weight: number
  detail: string
}

interface Prediction {
  symbol: string
  name: string
  ltp: number
  change: number
  changePercent: number
  overallSignal: string
  confidence: number
  score: number
  targetPrice: number
  stopLoss: number
  potentialUpside: number
  riskReward: number
  technicals: TechnicalScore[]
  momentum: string
  trend: string
  volatility: string
  volumeSignal: string
  summary: string
}

const SIGNAL_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  STRONG_BUY: { label: 'Strong Buy', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  BUY: { label: 'Buy', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  HOLD: { label: 'Hold', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  SELL: { label: 'Sell', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  STRONG_SELL: { label: 'Strong Sell', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
}

function SignalBadge({ signal, size = 'sm' }: { signal: string; size?: 'sm' | 'lg' }) {
  const config = SIGNAL_CONFIG[signal] || SIGNAL_CONFIG.HOLD
  return (
    <span className={cn(
      'inline-flex items-center font-semibold rounded-md border',
      config.color, config.bg, config.border,
      size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2 py-0.5 text-xxs'
    )}>
      {config.label}
    </span>
  )
}

function ScoreGauge({ score }: { score: number }) {
  const normalized = (score + 100) / 200 * 100 // 0-100
  const color = score >= 40 ? '#26a69a' : score >= 10 ? '#4ade80' : score > -10 ? '#f59e0b' : score > -40 ? '#fb923c' : '#ef5350'
  return (
    <div className="relative w-full h-2.5 bg-bg rounded-full overflow-hidden">
      <div
        className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
        style={{ width: `${normalized}%`, backgroundColor: color }}
      />
      <div className="absolute left-1/2 top-0 w-px h-full bg-txt-muted/30" />
    </div>
  )
}

function ConfidenceRing({ confidence }: { confidence: number }) {
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (confidence / 100) * circumference
  const color = confidence >= 70 ? '#26a69a' : confidence >= 50 ? '#f59e0b' : '#ef5350'

  return (
    <div className="relative w-[72px] h-[72px]">
      <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="#1e2532" strokeWidth="4" />
        <circle cx="32" cy="32" r={radius} fill="none" stroke={color} strokeWidth="4"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-txt-primary">{confidence}%</span>
      </div>
    </div>
  )
}

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [topPicks, setTopPicks] = useState<Prediction[]>([])
  const [selected, setSelected] = useState<Prediction | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'top' | 'all'>('top')
  const [filter, setFilter] = useState<string>('ALL')

  useEffect(() => {
    Promise.all([
      fetch('/api/predictions?top=5').then(r => r.json()),
      fetch('/api/predictions?all=true').then(r => r.json()),
    ]).then(([topData, allData]) => {
      setTopPicks(topData.picks || [])
      setPredictions(allData.predictions || [])
      setLoading(false)
    })
  }, [])

  const filtered = predictions.filter(p => filter === 'ALL' || p.overallSignal === filter)
  const signalCounts = {
    STRONG_BUY: predictions.filter(p => p.overallSignal === 'STRONG_BUY').length,
    BUY: predictions.filter(p => p.overallSignal === 'BUY').length,
    HOLD: predictions.filter(p => p.overallSignal === 'HOLD').length,
    SELL: predictions.filter(p => p.overallSignal === 'SELL').length,
    STRONG_SELL: predictions.filter(p => p.overallSignal === 'STRONG_SELL').length,
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-txt-secondary text-sm">Analyzing 30 stocks across 10 indicators...</p>
      </div>
    </div>
  )

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-5 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-lg font-semibold text-txt-primary flex items-center gap-2">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-accent"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              AI Predictions
              <span className="text-xxs font-normal text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20 ml-1">BETA</span>
            </h1>
            <p className="text-xxs text-txt-muted mt-1">Technical analysis across 10 indicators for 30 NSE stocks</p>
          </div>
          <div className="flex gap-1 bg-bg-card rounded-lg p-0.5 border border-border">
            <button onClick={() => setView('top')} className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-colors', view === 'top' ? 'bg-accent text-white' : 'text-txt-secondary hover:text-txt-primary')}>Top Picks</button>
            <button onClick={() => setView('all')} className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-colors', view === 'all' ? 'bg-accent text-white' : 'text-txt-secondary hover:text-txt-primary')}>All Stocks</button>
          </div>
        </div>

        {/* Signal Summary Bar */}
        <div className="flex gap-2 mb-5">
          {Object.entries(signalCounts).map(([signal, count]) => (
            <button
              key={signal}
              onClick={() => { setFilter(filter === signal ? 'ALL' : signal); setView('all') }}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs transition-all',
                filter === signal ? `${SIGNAL_CONFIG[signal].bg} ${SIGNAL_CONFIG[signal].border}` : 'bg-bg-card border-border hover:border-border-light'
              )}
            >
              <span className={cn('font-semibold text-sm', SIGNAL_CONFIG[signal].color)}>{count}</span>
              <span className="text-txt-muted">{SIGNAL_CONFIG[signal].label}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-5">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {view === 'top' && (
              <>
                {/* Top Picks */}
                <div className="mb-6">
                  <h2 className="text-sm font-semibold text-txt-primary mb-3 flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/></svg>
                    Today&apos;s Top Picks
                  </h2>
                  <div className="grid gap-3">
                    {topPicks.map((p, i) => (
                      <button
                        key={p.symbol}
                        onClick={() => setSelected(p)}
                        className={cn(
                          'bg-bg-card border rounded-xl p-4 text-left transition-all hover:border-accent/40 hover:bg-bg-raised/50',
                          selected?.symbol === p.symbol ? 'border-accent/50 bg-bg-raised/30' : 'border-border'
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent font-bold text-sm shrink-0">
                            #{i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-txt-primary">{p.symbol}</span>
                              <span className="text-xxs text-txt-muted truncate">{p.name}</span>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-txt-primary font-mono">{formatCurrency(p.ltp)}</span>
                              <span className={cn('text-xxs font-mono', p.change >= 0 ? 'text-bull' : 'text-bear')}>
                                {formatChangePercent(p.changePercent)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <SignalBadge signal={p.overallSignal} />
                            <div className="flex items-center gap-1.5 mt-1.5 justify-end">
                              <span className="text-xxs text-txt-muted">Confidence</span>
                              <span className={cn('text-xs font-bold', p.confidence >= 70 ? 'text-bull' : p.confidence >= 50 ? 'text-amber-400' : 'text-bear')}>{p.confidence}%</span>
                            </div>
                          </div>
                          <div className="w-20 shrink-0">
                            <ScoreGauge score={p.score} />
                            <div className="text-center mt-1">
                              <span className="text-xxs text-txt-muted">Score: <span className="text-txt-secondary font-mono">{p.score > 0 ? '+' : ''}{p.score}</span></span>
                            </div>
                          </div>
                        </div>
                        {/* Quick stats */}
                        <div className="flex gap-4 mt-3 pl-12">
                          <div className="text-xxs">
                            <span className="text-txt-muted">Target </span>
                            <span className="text-bull font-mono">{formatCurrency(p.targetPrice)}</span>
                          </div>
                          <div className="text-xxs">
                            <span className="text-txt-muted">Upside </span>
                            <span className="text-bull font-mono">+{p.potentialUpside}%</span>
                          </div>
                          <div className="text-xxs">
                            <span className="text-txt-muted">R:R </span>
                            <span className="text-txt-secondary font-mono">{p.riskReward}x</span>
                          </div>
                          <div className="text-xxs">
                            <span className="text-txt-muted">Trend </span>
                            <span className="text-txt-secondary">{p.trend}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {view === 'all' && (
              <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xxs font-medium text-txt-muted px-4 py-3">STOCK</th>
                      <th className="text-right text-xxs font-medium text-txt-muted px-3 py-3">LTP</th>
                      <th className="text-right text-xxs font-medium text-txt-muted px-3 py-3">CHANGE</th>
                      <th className="text-center text-xxs font-medium text-txt-muted px-3 py-3">SIGNAL</th>
                      <th className="text-center text-xxs font-medium text-txt-muted px-3 py-3">SCORE</th>
                      <th className="text-center text-xxs font-medium text-txt-muted px-3 py-3">CONF.</th>
                      <th className="text-right text-xxs font-medium text-txt-muted px-3 py-3">TARGET</th>
                      <th className="text-right text-xxs font-medium text-txt-muted px-3 py-3">UPSIDE</th>
                      <th className="text-center text-xxs font-medium text-txt-muted px-3 py-3">TREND</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => (
                      <tr
                        key={p.symbol}
                        onClick={() => setSelected(p)}
                        className={cn(
                          'border-b border-border/50 cursor-pointer transition-colors',
                          selected?.symbol === p.symbol ? 'bg-accent/5' : 'hover:bg-bg-raised/30'
                        )}
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold text-xs text-txt-primary">{p.symbol}</div>
                          <div className="text-xxs text-txt-muted truncate max-w-[140px]">{p.name}</div>
                        </td>
                        <td className="text-right px-3 py-3 font-mono text-xs text-txt-primary">{formatCurrency(p.ltp)}</td>
                        <td className={cn('text-right px-3 py-3 font-mono text-xs', p.change >= 0 ? 'text-bull' : 'text-bear')}>
                          {formatChangePercent(p.changePercent)}
                        </td>
                        <td className="text-center px-3 py-3"><SignalBadge signal={p.overallSignal} /></td>
                        <td className="px-3 py-3">
                          <div className="w-16 mx-auto">
                            <ScoreGauge score={p.score} />
                            <div className="text-center text-xxs text-txt-muted font-mono mt-0.5">{p.score > 0 ? '+' : ''}{p.score}</div>
                          </div>
                        </td>
                        <td className={cn('text-center px-3 py-3 font-mono text-xs', p.confidence >= 70 ? 'text-bull' : p.confidence >= 50 ? 'text-amber-400' : 'text-txt-secondary')}>
                          {p.confidence}%
                        </td>
                        <td className="text-right px-3 py-3 font-mono text-xs text-bull">{formatCurrency(p.targetPrice)}</td>
                        <td className={cn('text-right px-3 py-3 font-mono text-xs', p.potentialUpside >= 0 ? 'text-bull' : 'text-bear')}>
                          {p.potentialUpside > 0 ? '+' : ''}{p.potentialUpside}%
                        </td>
                        <td className="text-center px-3 py-3 text-xxs text-txt-secondary">{p.trend}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Detail Panel */}
          {selected && (
            <div className="w-[340px] shrink-0 hidden xl:block">
              <div className="bg-bg-card border border-border rounded-xl p-5 sticky top-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-base text-txt-primary">{selected.symbol}</h3>
                    <p className="text-xxs text-txt-muted">{selected.name}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-txt-muted hover:text-txt-primary p-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>

                {/* Signal + Confidence */}
                <div className="flex items-center gap-4 mb-5">
                  <ConfidenceRing confidence={selected.confidence} />
                  <div>
                    <SignalBadge signal={selected.overallSignal} size="lg" />
                    <p className="text-xxs text-txt-muted mt-1.5">Score: <span className="font-mono text-txt-secondary">{selected.score > 0 ? '+' : ''}{selected.score}/100</span></p>
                  </div>
                </div>

                {/* Price targets */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-bull/5 border border-bull/20 rounded-lg p-3">
                    <div className="text-xxs text-bull/70">Target Price</div>
                    <div className="font-mono font-semibold text-sm text-bull mt-0.5">{formatCurrency(selected.targetPrice)}</div>
                    <div className="text-xxs text-bull/70 mt-0.5">+{selected.potentialUpside}%</div>
                  </div>
                  <div className="bg-bear/5 border border-bear/20 rounded-lg p-3">
                    <div className="text-xxs text-bear/70">Stop Loss</div>
                    <div className="font-mono font-semibold text-sm text-bear mt-0.5">{formatCurrency(selected.stopLoss)}</div>
                    <div className="text-xxs text-txt-muted mt-0.5">R:R {selected.riskReward}x</div>
                  </div>
                </div>

                {/* Meta */}
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {[
                    { label: 'Momentum', value: selected.momentum },
                    { label: 'Trend', value: selected.trend },
                    { label: 'Volatility', value: selected.volatility },
                    { label: 'Volume', value: selected.volumeSignal },
                  ].map(m => (
                    <div key={m.label} className="bg-bg-raised/50 rounded-lg px-3 py-2">
                      <div className="text-xxs text-txt-muted">{m.label}</div>
                      <div className="text-xs text-txt-primary font-medium mt-0.5">{m.value}</div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="bg-bg-raised/30 rounded-lg p-3 mb-5 border border-border/50">
                  <div className="text-xxs text-txt-muted mb-1">AI Summary</div>
                  <p className="text-xs text-txt-secondary leading-relaxed">{selected.summary}</p>
                </div>

                {/* Technical Indicators */}
                <div>
                  <h4 className="text-xs font-semibold text-txt-primary mb-3 flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                    Technical Indicators ({selected.technicals.length})
                  </h4>
                  <div className="space-y-2">
                    {selected.technicals.map(t => (
                      <div key={t.name} className="bg-bg-raised/30 rounded-lg px-3 py-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xxs text-txt-secondary font-medium">{t.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xxs font-mono text-txt-muted">{typeof t.value === 'number' ? t.value.toFixed(1) : t.value}</span>
                            <SignalBadge signal={t.signal} />
                          </div>
                        </div>
                        <p className="text-xxs text-txt-muted mt-1">{t.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="mt-5 pt-4 border-t border-border">
                  <p className="text-xxs text-txt-muted/60 leading-relaxed">
                    AI predictions are based on technical analysis only. Not financial advice. Past performance does not guarantee future results. Always do your own research.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
