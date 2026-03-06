'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface IndexData {
  symbol: string
  ltp: number
  change: number
  changePercent: number
}

export default function TopBar() {
  const { data: session } = useSession()
  const [indices, setIndices] = useState<IndexData[]>([])
  const [time, setTime] = useState('')

  useEffect(() => {
    const fetchIndices = async () => {
      try {
        const res = await fetch('/api/market/quote?indices=true')
        const data = await res.json()
        setIndices(data)
      } catch {}
    }
    fetchIndices()
    const interval = setInterval(fetchIndices, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const tick = () => {
      setTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }))
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="h-14 bg-bg-card border-b border-border flex items-center px-4 shrink-0">
      {/* Market indices ticker */}
      <div className="flex items-center gap-6 flex-1 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          <div className="dot-live" />
          <span className="text-xxs text-txt-muted uppercase tracking-wider font-medium">LIVE</span>
        </div>

        {indices.map((idx) => (
          <div key={idx.symbol} className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-txt-secondary font-medium">{idx.symbol}</span>
            <span className="font-num text-xs text-txt-primary">{idx.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            <span className={`font-num text-xs ${idx.change >= 0 ? 'text-bull' : 'text-bear'}`}>
              {idx.change >= 0 ? '+' : ''}{idx.change.toFixed(2)} ({idx.changePercent >= 0 ? '+' : ''}{idx.changePercent.toFixed(2)}%)
            </span>
          </div>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4 shrink-0 ml-4">
        <span className="font-num text-xs text-txt-muted">{time}</span>
        <div className="w-px h-5 bg-border" />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center">
            <span className="text-xs font-semibold text-accent">
              {(session?.user?.name || session?.user?.email || 'U')[0].toUpperCase()}
            </span>
          </div>
          <span className="text-xs text-txt-secondary hidden md:block">{session?.user?.name || session?.user?.email}</span>
        </div>
      </div>
    </header>
  )
}
