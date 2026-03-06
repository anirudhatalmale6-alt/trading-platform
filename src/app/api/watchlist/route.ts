import { NextRequest, NextResponse } from 'next/server'
import { getMultipleQuotes } from '@/lib/market-data'
import { POPULAR_STOCKS } from '@/lib/utils'

// Default watchlist for demo (when no DB)
const DEFAULT_WATCHLIST = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'SBIN', 'ITC', 'BHARTIARTL']

export async function GET() {
  // Return watchlist with live quotes
  const symbols = DEFAULT_WATCHLIST
  const quotes = getMultipleQuotes(symbols)
  const watchlist = quotes.map(q => ({
    id: q.symbol,
    symbol: q.symbol,
    name: POPULAR_STOCKS.find(s => s.symbol === q.symbol)?.name || q.symbol,
    exchange: q.exchange,
    ltp: q.ltp,
    change: q.change,
    changePercent: q.changePercent,
    open: q.open,
    high: q.high,
    low: q.low,
    close: q.close,
    volume: q.volume,
  }))
  return NextResponse.json(watchlist)
}

export async function POST(req: NextRequest) {
  const { symbol, exchange } = await req.json()
  if (!symbol) return NextResponse.json({ error: 'Symbol required' }, { status: 400 })
  return NextResponse.json({ id: symbol, symbol, exchange: exchange || 'NSE', addedAt: new Date() })
}

export async function DELETE(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol')
  if (!symbol) return NextResponse.json({ error: 'Symbol required' }, { status: 400 })
  return NextResponse.json({ removed: symbol })
}
