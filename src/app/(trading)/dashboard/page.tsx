'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface QuoteData {
  symbol: string; name: string; ltp: number; change: number; changePercent: number; high: number; low: number; volume: number
}

interface PortfolioSummary {
  totalInvested: number; totalCurrent: number; totalPnl: number; totalPnlPercent: number; dayPnl: number
}

export default function DashboardPage() {
  const [watchlist, setWatchlist] = useState<QuoteData[]>([])
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null)
  const [topGainers, setTopGainers] = useState<QuoteData[]>([])
  const [topLosers, setTopLosers] = useState<QuoteData[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const [wlRes, pfRes, quotesRes] = await Promise.all([
          fetch('/api/watchlist'),
          fetch('/api/portfolio'),
          fetch('/api/market/quote?symbols=RELIANCE,TCS,HDFCBANK,INFY,ICICIBANK,SBIN,ITC,BHARTIARTL,WIPRO,TATAMOTORS,MARUTI,BAJFINANCE,TITAN,HCLTECH,ADANIENT'),
        ])
        const wlData = await wlRes.json()
        const pfData = await pfRes.json()
        const allQuotes: QuoteData[] = await quotesRes.json()
        setWatchlist(wlData.slice(0, 6))
        setPortfolio(pfData.summary)
        const sorted = [...allQuotes].sort((a, b) => b.changePercent - a.changePercent)
        setTopGainers(sorted.filter(s => s.changePercent > 0).slice(0, 5))
        setTopLosers(sorted.filter(s => s.changePercent < 0).slice(0, 5))
      } catch {}
    }
    load()
    const interval = setInterval(load, 8000)
    return () => clearInterval(interval)
  }, [])

  const fmt = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const fmtLakh = (n: number) => {
    if (Math.abs(n) >= 10000000) return `${(n / 10000000).toFixed(2)} Cr`
    if (Math.abs(n) >= 100000) return `${(n / 100000).toFixed(2)} L`
    return fmt(n)
  }

  return (
    <div className="animate-fade-in space-y-5">
      {/* Portfolio summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-bg-card border border-border rounded-lg p-4">
          <div className="text-xxs text-txt-muted uppercase tracking-wider mb-2 font-medium">Invested</div>
          <div className="font-num text-lg font-semibold">{portfolio ? fmtLakh(portfolio.totalInvested) : '--'}</div>
        </div>
        <div className="bg-bg-card border border-border rounded-lg p-4">
          <div className="text-xxs text-txt-muted uppercase tracking-wider mb-2 font-medium">Current Value</div>
          <div className="font-num text-lg font-semibold">{portfolio ? fmtLakh(portfolio.totalCurrent) : '--'}</div>
        </div>
        <div className="bg-bg-card border border-border rounded-lg p-4">
          <div className="text-xxs text-txt-muted uppercase tracking-wider mb-2 font-medium">Total P&L</div>
          <div className={`font-num text-lg font-semibold ${portfolio && portfolio.totalPnl >= 0 ? 'text-bull' : 'text-bear'}`}>
            {portfolio ? `${portfolio.totalPnl >= 0 ? '+' : ''}${fmtLakh(portfolio.totalPnl)}` : '--'}
          </div>
          {portfolio && (
            <div className={`font-num text-xs mt-0.5 ${portfolio.totalPnlPercent >= 0 ? 'text-bull' : 'text-bear'}`}>
              {portfolio.totalPnlPercent >= 0 ? '+' : ''}{portfolio.totalPnlPercent.toFixed(2)}%
            </div>
          )}
        </div>
        <div className="bg-bg-card border border-border rounded-lg p-4">
          <div className="text-xxs text-txt-muted uppercase tracking-wider mb-2 font-medium">Day P&L</div>
          <div className={`font-num text-lg font-semibold ${portfolio && portfolio.dayPnl >= 0 ? 'text-bull' : 'text-bear'}`}>
            {portfolio ? `${portfolio.dayPnl >= 0 ? '+' : ''}${fmt(portfolio.dayPnl)}` : '--'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Watchlist preview */}
        <div className="lg:col-span-2 bg-bg-card border border-border rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold">Watchlist</h3>
            <Link href="/watchlist" className="text-xs text-accent hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-border/50">
            {watchlist.map(stock => (
              <div key={stock.symbol} className="flex items-center justify-between px-4 py-3 hover:bg-bg-raised/40 transition-colors">
                <div>
                  <div className="text-sm font-medium">{stock.symbol}</div>
                  <div className="text-xs text-txt-muted">{stock.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-num text-sm">{fmt(stock.ltp)}</div>
                  <div className={`font-num text-xs ${stock.change >= 0 ? 'text-bull' : 'text-bear'}`}>
                    {stock.change >= 0 ? '+' : ''}{fmt(stock.change)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gainers & Losers */}
        <div className="space-y-4">
          <div className="bg-bg-card border border-border rounded-lg">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-bull" /> Top Gainers
              </h3>
            </div>
            <div className="divide-y divide-border/50">
              {topGainers.map(s => (
                <div key={s.symbol} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs font-medium">{s.symbol}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-num text-xs">{fmt(s.ltp)}</span>
                    <span className="font-num text-xs text-bull bg-bull/10 px-1.5 py-0.5 rounded">+{s.changePercent.toFixed(2)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-bg-card border border-border rounded-lg">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-bear" /> Top Losers
              </h3>
            </div>
            <div className="divide-y divide-border/50">
              {topLosers.map(s => (
                <div key={s.symbol} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs font-medium">{s.symbol}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-num text-xs">{fmt(s.ltp)}</span>
                    <span className="font-num text-xs text-bear bg-bear/10 px-1.5 py-0.5 rounded">{s.changePercent.toFixed(2)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
