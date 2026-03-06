'use client'
import { useEffect, useState } from 'react'

interface WatchlistItem {
  id: string; symbol: string; name: string; exchange: string; ltp: number; change: number; changePercent: number; open: number; high: number; low: number; volume: number
}

interface SearchResult {
  symbol: string; name: string; exchange: string; token: string
}

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  const loadWatchlist = async () => {
    try {
      const res = await fetch('/api/watchlist')
      setItems(await res.json())
    } catch {}
  }

  useEffect(() => {
    loadWatchlist()
    const interval = setInterval(loadWatchlist, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!searchQuery) { setSearchResults([]); return }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/market/search?q=${searchQuery}`)
      setSearchResults(await res.json())
    }, 200)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const fmt = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const fmtVol = (n: number) => {
    if (n >= 10000000) return `${(n / 10000000).toFixed(1)}Cr`
    if (n >= 100000) return `${(n / 100000).toFixed(1)}L`
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
    return n.toString()
  }

  const selectedItem = items.find(i => i.symbol === selected)

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">Watchlist</h1>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="flex items-center gap-2 h-9 px-4 bg-accent/10 text-accent rounded-lg text-xs font-medium hover:bg-accent/20 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Stock
        </button>
      </div>

      {/* Search panel */}
      {showSearch && (
        <div className="mb-4 bg-bg-card border border-border rounded-lg p-4 animate-slide-up">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search stocks... (e.g. RELIANCE, TCS)"
            className="w-full h-10 px-3.5 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors mb-2"
            autoFocus
          />
          {searchResults.length > 0 && (
            <div className="max-h-48 overflow-y-auto divide-y divide-border/50">
              {searchResults.map(s => (
                <button
                  key={s.symbol}
                  onClick={() => { setShowSearch(false); setSearchQuery('') }}
                  className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-bg-raised/60 transition-colors text-left"
                >
                  <div>
                    <span className="text-sm font-medium">{s.symbol}</span>
                    <span className="text-xs text-txt-muted ml-2">{s.name}</span>
                  </div>
                  <span className="text-xxs text-txt-dim bg-bg-raised px-2 py-0.5 rounded">{s.exchange}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-5">
        {/* Watchlist table */}
        <div className="flex-1 bg-bg-card border border-border rounded-lg overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_100px_100px_80px_80px_80px] px-4 py-2.5 border-b border-border bg-bg-raised/30 text-xxs text-txt-muted uppercase tracking-wider font-medium">
            <div>Symbol</div>
            <div className="text-right">LTP</div>
            <div className="text-right">Change</div>
            <div className="text-right">High</div>
            <div className="text-right">Low</div>
            <div className="text-right">Vol</div>
          </div>
          {/* Table rows */}
          <div className="divide-y divide-border/30">
            {items.map(item => (
              <div
                key={item.symbol}
                onClick={() => setSelected(item.symbol)}
                className={`grid grid-cols-[1fr_100px_100px_80px_80px_80px] px-4 py-3 cursor-pointer transition-colors ${
                  selected === item.symbol ? 'bg-accent/5 border-l-2 border-l-accent' : 'hover:bg-bg-raised/40 border-l-2 border-l-transparent'
                }`}
              >
                <div>
                  <div className="text-sm font-medium">{item.symbol}</div>
                  <div className="text-xxs text-txt-muted">{item.exchange}</div>
                </div>
                <div className="font-num text-sm text-right self-center">{fmt(item.ltp)}</div>
                <div className={`font-num text-xs text-right self-center ${item.change >= 0 ? 'text-bull' : 'text-bear'}`}>
                  {item.change >= 0 ? '+' : ''}{fmt(item.change)}<br />
                  <span className="text-xxs">({item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%)</span>
                </div>
                <div className="font-num text-xs text-right self-center text-txt-secondary">{fmt(item.high)}</div>
                <div className="font-num text-xs text-right self-center text-txt-secondary">{fmt(item.low)}</div>
                <div className="font-num text-xs text-right self-center text-txt-muted">{fmtVol(item.volume)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        {selectedItem && (
          <div className="w-72 shrink-0 bg-bg-card border border-border rounded-lg p-4 animate-slide-up hidden lg:block">
            <div className="mb-4">
              <h3 className="text-base font-semibold">{selectedItem.symbol}</h3>
              <p className="text-xs text-txt-muted">{selectedItem.name}</p>
            </div>
            <div className={`font-num text-2xl font-bold mb-1 ${selectedItem.change >= 0 ? 'text-bull' : 'text-bear'}`}>
              {fmt(selectedItem.ltp)}
            </div>
            <div className={`font-num text-sm mb-6 ${selectedItem.change >= 0 ? 'text-bull' : 'text-bear'}`}>
              {selectedItem.change >= 0 ? '+' : ''}{fmt(selectedItem.change)} ({selectedItem.changePercent >= 0 ? '+' : ''}{selectedItem.changePercent.toFixed(2)}%)
            </div>

            <div className="space-y-3 text-xs">
              {[
                ['Open', fmt(selectedItem.open)],
                ['High', fmt(selectedItem.high)],
                ['Low', fmt(selectedItem.low)],
                ['Volume', fmtVol(selectedItem.volume)],
              ].map(([label, val]) => (
                <div key={label as string} className="flex justify-between">
                  <span className="text-txt-muted">{label}</span>
                  <span className="font-num">{val}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-2">
              <button className="flex-1 h-9 bg-bull/15 text-bull rounded-lg text-xs font-semibold hover:bg-bull/25 transition-colors">BUY</button>
              <button className="flex-1 h-9 bg-bear/15 text-bear rounded-lg text-xs font-semibold hover:bg-bear/25 transition-colors">SELL</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
