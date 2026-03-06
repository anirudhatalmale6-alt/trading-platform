'use client'
import { useEffect, useState } from 'react'

interface Holding {
  symbol: string; name: string; exchange: string; quantity: number
  avgPrice: number; ltp: number; currentValue: number; investedValue: number
  pnl: number; pnlPercent: number; dayChange: number; dayChangePercent: number
}

interface Position {
  symbol: string; name: string; exchange: string; type: 'LONG' | 'SHORT'
  quantity: number; avgPrice: number; ltp: number; pnl: number; pnlPercent: number
}

interface Summary {
  totalInvested: number; currentValue: number; totalPnl: number; totalPnlPercent: number
  dayPnl: number; dayPnlPercent: number
}

export default function PortfolioPage() {
  const [tab, setTab] = useState<'holdings' | 'positions'>('holdings')
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)

  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        const res = await fetch('/api/portfolio')
        const data = await res.json()
        setHoldings(data.holdings || [])
        setPositions(data.positions || [])
        setSummary(data.summary || null)
      } catch {}
    }
    loadPortfolio()
    const interval = setInterval(loadPortfolio, 5000)
    return () => clearInterval(interval)
  }, [])

  const fmt = (n: number) => n?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'
  const fmtInt = (n: number) => n?.toLocaleString('en-IN') || '0'

  return (
    <div className="animate-fade-in">
      <h1 className="text-lg font-semibold mb-4">Portfolio</h1>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <div className="bg-bg-card border border-border rounded-lg p-4">
            <div className="text-xxs text-txt-muted uppercase tracking-wider mb-1">Invested</div>
            <div className="font-num text-base font-semibold">{fmt(summary.totalInvested)}</div>
          </div>
          <div className="bg-bg-card border border-border rounded-lg p-4">
            <div className="text-xxs text-txt-muted uppercase tracking-wider mb-1">Current Value</div>
            <div className="font-num text-base font-semibold">{fmt(summary.currentValue)}</div>
          </div>
          <div className="bg-bg-card border border-border rounded-lg p-4">
            <div className="text-xxs text-txt-muted uppercase tracking-wider mb-1">Total P&L</div>
            <div className={`font-num text-base font-semibold ${summary.totalPnl >= 0 ? 'text-bull' : 'text-bear'}`}>
              {summary.totalPnl >= 0 ? '+' : ''}{fmt(summary.totalPnl)}
            </div>
            <div className={`font-num text-xxs ${summary.totalPnl >= 0 ? 'text-bull' : 'text-bear'}`}>
              ({summary.totalPnlPercent >= 0 ? '+' : ''}{summary.totalPnlPercent?.toFixed(2)}%)
            </div>
          </div>
          <div className="bg-bg-card border border-border rounded-lg p-4">
            <div className="text-xxs text-txt-muted uppercase tracking-wider mb-1">Day P&L</div>
            <div className={`font-num text-base font-semibold ${summary.dayPnl >= 0 ? 'text-bull' : 'text-bear'}`}>
              {summary.dayPnl >= 0 ? '+' : ''}{fmt(summary.dayPnl)}
            </div>
            <div className={`font-num text-xxs ${summary.dayPnl >= 0 ? 'text-bull' : 'text-bear'}`}>
              ({summary.dayPnlPercent >= 0 ? '+' : ''}{summary.dayPnlPercent?.toFixed(2)}%)
            </div>
          </div>
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex gap-1 mb-4 bg-bg-raised rounded-lg p-0.5 w-fit">
        <button
          onClick={() => setTab('holdings')}
          className={`px-4 py-2 rounded-md text-xs font-medium transition-colors ${tab === 'holdings' ? 'bg-bg-card text-txt-primary shadow-sm' : 'text-txt-muted hover:text-txt-secondary'}`}
        >
          Holdings ({holdings.length})
        </button>
        <button
          onClick={() => setTab('positions')}
          className={`px-4 py-2 rounded-md text-xs font-medium transition-colors ${tab === 'positions' ? 'bg-bg-card text-txt-primary shadow-sm' : 'text-txt-muted hover:text-txt-secondary'}`}
        >
          Positions ({positions.length})
        </button>
      </div>

      {/* Holdings table */}
      {tab === 'holdings' && (
        <div className="bg-bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xxs text-txt-muted uppercase tracking-wider border-b border-border bg-bg-raised/30">
                  <th className="text-left px-4 py-2.5 font-medium">Symbol</th>
                  <th className="text-right px-4 py-2.5 font-medium">Qty</th>
                  <th className="text-right px-4 py-2.5 font-medium">Avg Price</th>
                  <th className="text-right px-4 py-2.5 font-medium">LTP</th>
                  <th className="text-right px-4 py-2.5 font-medium">Invested</th>
                  <th className="text-right px-4 py-2.5 font-medium">Current</th>
                  <th className="text-right px-4 py-2.5 font-medium">P&L</th>
                  <th className="text-right px-4 py-2.5 font-medium">Day Chg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {holdings.map(h => (
                  <tr key={h.symbol} className="hover:bg-bg-raised/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium">{h.symbol}</div>
                      <div className="text-xxs text-txt-muted">{h.exchange}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-num">{fmtInt(h.quantity)}</td>
                    <td className="px-4 py-3 text-right font-num text-txt-secondary">{fmt(h.avgPrice)}</td>
                    <td className="px-4 py-3 text-right font-num font-medium">{fmt(h.ltp)}</td>
                    <td className="px-4 py-3 text-right font-num text-txt-secondary">{fmt(h.investedValue)}</td>
                    <td className="px-4 py-3 text-right font-num">{fmt(h.currentValue)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className={`font-num font-medium ${h.pnl >= 0 ? 'text-bull' : 'text-bear'}`}>
                        {h.pnl >= 0 ? '+' : ''}{fmt(h.pnl)}
                      </div>
                      <div className={`font-num text-xxs ${h.pnl >= 0 ? 'text-bull' : 'text-bear'}`}>
                        ({h.pnlPercent >= 0 ? '+' : ''}{h.pnlPercent?.toFixed(2)}%)
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className={`font-num text-xs ${h.dayChange >= 0 ? 'text-bull' : 'text-bear'}`}>
                        {h.dayChange >= 0 ? '+' : ''}{h.dayChangePercent?.toFixed(2)}%
                      </div>
                    </td>
                  </tr>
                ))}
                {holdings.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-txt-muted text-sm">No holdings yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Positions table */}
      {tab === 'positions' && (
        <div className="bg-bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xxs text-txt-muted uppercase tracking-wider border-b border-border bg-bg-raised/30">
                  <th className="text-left px-4 py-2.5 font-medium">Symbol</th>
                  <th className="text-left px-4 py-2.5 font-medium">Type</th>
                  <th className="text-right px-4 py-2.5 font-medium">Qty</th>
                  <th className="text-right px-4 py-2.5 font-medium">Avg Price</th>
                  <th className="text-right px-4 py-2.5 font-medium">LTP</th>
                  <th className="text-right px-4 py-2.5 font-medium">P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {positions.map(p => (
                  <tr key={`${p.symbol}-${p.type}`} className="hover:bg-bg-raised/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium">{p.symbol}</div>
                      <div className="text-xxs text-txt-muted">{p.exchange}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${p.type === 'LONG' ? 'bg-bull/10 text-bull' : 'bg-bear/10 text-bear'}`}>
                        {p.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-num">{fmtInt(p.quantity)}</td>
                    <td className="px-4 py-3 text-right font-num text-txt-secondary">{fmt(p.avgPrice)}</td>
                    <td className="px-4 py-3 text-right font-num font-medium">{fmt(p.ltp)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className={`font-num font-medium ${p.pnl >= 0 ? 'text-bull' : 'text-bear'}`}>
                        {p.pnl >= 0 ? '+' : ''}{fmt(p.pnl)}
                      </div>
                      <div className={`font-num text-xxs ${p.pnl >= 0 ? 'text-bull' : 'text-bear'}`}>
                        ({p.pnlPercent >= 0 ? '+' : ''}{p.pnlPercent?.toFixed(2)}%)
                      </div>
                    </td>
                  </tr>
                ))}
                {positions.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-txt-muted text-sm">No open positions</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
