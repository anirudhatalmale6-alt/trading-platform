'use client'
import { useEffect, useState } from 'react'

interface Order {
  id: string; symbol: string; type: 'BUY' | 'SELL'; orderType: string
  quantity: number; price: number; triggerPrice?: number; status: string
  filledQty: number; avgPrice: number; timestamp: string
}

interface SearchResult {
  symbol: string; name: string; exchange: string
}

const ORDER_TYPES = ['MARKET', 'LIMIT', 'SL', 'SL-M']

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<'BUY' | 'SELL'>('BUY')
  const [orderType, setOrderType] = useState('MARKET')
  const [symbol, setSymbol] = useState('RELIANCE')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [triggerPrice, setTriggerPrice] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [flash, setFlash] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [quote, setQuote] = useState<any>(null)

  // Load orders
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await fetch('/api/orders')
        setOrders(await res.json())
      } catch {}
    }
    loadOrders()
    const interval = setInterval(loadOrders, 10000)
    return () => clearInterval(interval)
  }, [])

  // Live quote for selected symbol
  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const res = await fetch(`/api/market/quote?symbol=${symbol}`)
        setQuote(await res.json())
      } catch {}
    }
    fetchQuote()
    const interval = setInterval(fetchQuote, 3000)
    return () => clearInterval(interval)
  }, [symbol])

  // Search
  useEffect(() => {
    if (!searchQuery) { setSearchResults([]); return }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/market/search?q=${searchQuery}`)
      setSearchResults(await res.json())
    }, 200)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSubmit = async () => {
    if (!quantity || Number(quantity) <= 0) return
    setSubmitting(true)
    try {
      const body: Record<string, unknown> = {
        symbol, type: activeTab, orderType, quantity: Number(quantity),
      }
      if (orderType === 'LIMIT' || orderType === 'SL') body.price = Number(price)
      if (orderType === 'SL' || orderType === 'SL-M') body.triggerPrice = Number(triggerPrice)

      await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      setFlash(`${activeTab} order placed for ${quantity} ${symbol}`)
      setQuantity(''); setPrice(''); setTriggerPrice('')
      // Refresh orders
      const res = await fetch('/api/orders')
      setOrders(await res.json())
      setTimeout(() => setFlash(''), 3000)
    } catch {
      setFlash('Order failed')
    }
    setSubmitting(false)
  }

  const fmt = (n: number) => n?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'

  const statusColor = (s: string) => {
    if (s === 'COMPLETE' || s === 'EXECUTED') return 'text-bull'
    if (s === 'REJECTED' || s === 'CANCELLED') return 'text-bear'
    return 'text-amber'
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-lg font-semibold mb-4">Orders</h1>

      <div className="flex gap-5 flex-col lg:flex-row">
        {/* Order form */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-bg-card border border-border rounded-lg overflow-hidden">
            {/* Buy/Sell tabs */}
            <div className="flex">
              <button
                onClick={() => setActiveTab('BUY')}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'BUY' ? 'bg-bull/15 text-bull border-b-2 border-bull' : 'text-txt-muted hover:text-txt-secondary'}`}
              >
                BUY
              </button>
              <button
                onClick={() => setActiveTab('SELL')}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'SELL' ? 'bg-bear/15 text-bear border-b-2 border-bear' : 'text-txt-muted hover:text-txt-secondary'}`}
              >
                SELL
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Symbol selector */}
              <div className="relative">
                <label className="text-xxs text-txt-muted uppercase tracking-wider mb-1.5 block">Symbol</label>
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="w-full h-10 px-3.5 bg-bg border border-border rounded-lg text-sm text-left flex items-center justify-between hover:border-border-light transition-colors"
                >
                  <span className="font-medium">{symbol}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                </button>
                {showSearch && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-bg-card border border-border rounded-lg shadow-xl z-50 animate-slide-up">
                    <input
                      type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search..." className="w-full h-9 px-3 bg-transparent border-b border-border text-sm focus:outline-none" autoFocus
                    />
                    <div className="max-h-48 overflow-y-auto">
                      {searchResults.map(s => (
                        <button key={s.symbol} onClick={() => { setSymbol(s.symbol); setShowSearch(false); setSearchQuery('') }}
                          className="w-full px-3 py-2 hover:bg-bg-raised/60 transition-colors text-left text-sm">
                          <span className="font-medium">{s.symbol}</span>
                          <span className="text-xs text-txt-muted ml-2">{s.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Live price */}
              {quote && (
                <div className="flex items-center justify-between px-3 py-2 bg-bg-raised/40 rounded-lg">
                  <span className="text-xxs text-txt-muted">LTP</span>
                  <span className={`font-num text-sm font-bold ${quote.change >= 0 ? 'text-bull' : 'text-bear'}`}>{fmt(quote.ltp)}</span>
                </div>
              )}

              {/* Order type */}
              <div>
                <label className="text-xxs text-txt-muted uppercase tracking-wider mb-1.5 block">Order Type</label>
                <div className="flex bg-bg-raised rounded-lg p-0.5">
                  {ORDER_TYPES.map(t => (
                    <button key={t} onClick={() => setOrderType(t)}
                      className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${orderType === t ? 'bg-bg-card text-txt-primary shadow-sm' : 'text-txt-muted hover:text-txt-secondary'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="text-xxs text-txt-muted uppercase tracking-wider mb-1.5 block">Quantity</label>
                <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0"
                  className="w-full h-10 px-3.5 bg-bg border border-border rounded-lg text-sm font-num focus:outline-none focus:border-accent transition-colors" />
              </div>

              {/* Price (for LIMIT, SL) */}
              {(orderType === 'LIMIT' || orderType === 'SL') && (
                <div>
                  <label className="text-xxs text-txt-muted uppercase tracking-wider mb-1.5 block">Price</label>
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00"
                    className="w-full h-10 px-3.5 bg-bg border border-border rounded-lg text-sm font-num focus:outline-none focus:border-accent transition-colors" />
                </div>
              )}

              {/* Trigger price (for SL, SL-M) */}
              {(orderType === 'SL' || orderType === 'SL-M') && (
                <div>
                  <label className="text-xxs text-txt-muted uppercase tracking-wider mb-1.5 block">Trigger Price</label>
                  <input type="number" value={triggerPrice} onChange={e => setTriggerPrice(e.target.value)} placeholder="0.00"
                    className="w-full h-10 px-3.5 bg-bg border border-border rounded-lg text-sm font-num focus:outline-none focus:border-accent transition-colors" />
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={submitting || !quantity}
                className={`w-full h-11 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'BUY'
                    ? 'bg-bull text-white hover:bg-bull-light disabled:opacity-50'
                    : 'bg-bear text-white hover:bg-bear-light disabled:opacity-50'
                }`}
              >
                {submitting ? 'Placing...' : `${activeTab} ${symbol}`}
              </button>

              {/* Flash message */}
              {flash && (
                <div className={`text-xs text-center py-2 rounded-lg animate-slide-up ${flash.includes('failed') ? 'bg-bear/10 text-bear' : 'bg-bull/10 text-bull'}`}>
                  {flash}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order history */}
        <div className="flex-1 bg-bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold">Order Book</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xxs text-txt-muted uppercase tracking-wider border-b border-border bg-bg-raised/30">
                  <th className="text-left px-4 py-2.5 font-medium">Time</th>
                  <th className="text-left px-4 py-2.5 font-medium">Symbol</th>
                  <th className="text-left px-4 py-2.5 font-medium">Type</th>
                  <th className="text-right px-4 py-2.5 font-medium">Qty</th>
                  <th className="text-right px-4 py-2.5 font-medium">Price</th>
                  <th className="text-right px-4 py-2.5 font-medium">Avg</th>
                  <th className="text-left px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-bg-raised/30 transition-colors">
                    <td className="px-4 py-3 text-xs text-txt-muted font-num">
                      {new Date(order.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 font-medium">{order.symbol}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${order.type === 'BUY' ? 'text-bull' : 'text-bear'}`}>
                        {order.type}
                        <span className="text-txt-dim text-xxs">{order.orderType}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-num">{order.quantity}</td>
                    <td className="px-4 py-3 text-right font-num">{order.price > 0 ? fmt(order.price) : 'MKT'}</td>
                    <td className="px-4 py-3 text-right font-num">{order.avgPrice > 0 ? fmt(order.avgPrice) : '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${statusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-txt-muted text-sm">
                      No orders yet. Place your first order to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
