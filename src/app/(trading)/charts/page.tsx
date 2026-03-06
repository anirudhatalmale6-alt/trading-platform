'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const TradingChart = dynamic(() => import('@/components/charts/TradingChart'), { ssr: false })

interface StockOption {
  symbol: string; name: string; exchange: string
}

const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1D', '1W']

export default function ChartsPage() {
  const [symbol, setSymbol] = useState('RELIANCE')
  const [timeframe, setTimeframe] = useState('1D')
  const [chartType, setChartType] = useState<'candlestick' | 'line'>('candlestick')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<StockOption[]>([])
  const [showSearch, setShowSearch] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [quote, setQuote] = useState<any>(null)

  // Fetch quote for selected symbol
  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const res = await fetch(`/api/market/quote?symbol=${symbol}`)
        setQuote(await res.json())
      } catch {}
    }
    fetchQuote()
    const interval = setInterval(fetchQuote, 5000)
    return () => clearInterval(interval)
  }, [symbol])

  // Search stocks
  useEffect(() => {
    if (!searchQuery) { setSearchResults([]); return }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/market/search?q=${searchQuery}`)
      setSearchResults(await res.json())
    }, 200)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const fmt = (n: number) => n?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'

  return (
    <div className="animate-fade-in flex flex-col h-full">
      {/* Header bar */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        {/* Symbol selector */}
        <div className="relative">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="flex items-center gap-2 h-10 px-4 bg-bg-card border border-border rounded-lg hover:border-border-light transition-colors"
          >
            <span className="text-sm font-semibold">{symbol}</span>
            {quote && (
              <span className={`font-num text-xs ${quote.change >= 0 ? 'text-bull' : 'text-bear'}`}>
                {fmt(quote.ltp)}
              </span>
            )}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          {showSearch && (
            <div className="absolute top-full left-0 mt-1 w-80 bg-bg-card border border-border rounded-lg shadow-xl z-50 animate-slide-up">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search stocks..."
                className="w-full h-10 px-3.5 bg-transparent border-b border-border text-sm focus:outline-none"
                autoFocus
              />
              <div className="max-h-60 overflow-y-auto">
                {searchResults.map(s => (
                  <button
                    key={s.symbol}
                    onClick={() => { setSymbol(s.symbol); setShowSearch(false); setSearchQuery('') }}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-bg-raised/60 transition-colors text-left"
                  >
                    <div>
                      <span className="text-sm font-medium">{s.symbol}</span>
                      <span className="text-xs text-txt-muted ml-2">{s.name}</span>
                    </div>
                    <span className="text-xxs text-txt-dim bg-bg-raised px-2 py-0.5 rounded">{s.exchange}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quote info */}
        {quote && (
          <div className="flex items-center gap-3">
            <span className={`font-num text-lg font-bold ${quote.change >= 0 ? 'text-bull' : 'text-bear'}`}>
              {fmt(quote.ltp)}
            </span>
            <span className={`font-num text-xs ${quote.change >= 0 ? 'text-bull' : 'text-bear'}`}>
              {quote.change >= 0 ? '+' : ''}{fmt(quote.change)} ({quote.changePercent >= 0 ? '+' : ''}{quote.changePercent?.toFixed(2)}%)
            </span>
            <div className="flex items-center gap-3 text-xxs text-txt-muted ml-2">
              <span>O: <span className="font-num text-txt-secondary">{fmt(quote.open)}</span></span>
              <span>H: <span className="font-num text-txt-secondary">{fmt(quote.high)}</span></span>
              <span>L: <span className="font-num text-txt-secondary">{fmt(quote.low)}</span></span>
              <span>V: <span className="font-num text-txt-secondary">{(quote.volume / 100000).toFixed(1)}L</span></span>
            </div>
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          {/* Chart type toggle */}
          <div className="flex bg-bg-raised rounded-lg p-0.5">
            <button
              onClick={() => setChartType('candlestick')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${chartType === 'candlestick' ? 'bg-accent/20 text-accent' : 'text-txt-muted hover:text-txt-secondary'}`}
              title="Candlestick"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="9" y1="2" x2="9" y2="7"/><rect x="7" y="7" width="4" height="10" rx="0.5" fill="currentColor" opacity="0.3"/><line x1="9" y1="17" x2="9" y2="22"/>
                <line x1="17" y1="4" x2="17" y2="9"/><rect x="15" y="9" width="4" height="8" rx="0.5" fill="currentColor" opacity="0.3"/><line x1="17" y1="17" x2="17" y2="20"/>
              </svg>
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${chartType === 'line' ? 'bg-accent/20 text-accent' : 'text-txt-muted hover:text-txt-secondary'}`}
              title="Line"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3,17 9,11 13,15 21,7"/>
              </svg>
            </button>
          </div>

          {/* Timeframe buttons */}
          <div className="flex bg-bg-raised rounded-lg p-0.5">
            {TIMEFRAMES.map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${timeframe === tf ? 'bg-accent/20 text-accent' : 'text-txt-muted hover:text-txt-secondary'}`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 bg-bg-card border border-border rounded-lg overflow-hidden min-h-[480px]">
        <TradingChart symbol={symbol} timeframe={timeframe} chartType={chartType} height={480} />
      </div>
    </div>
  )
}
