import { NextRequest, NextResponse } from 'next/server'
import { getStockQuote, getMultipleQuotes, getIndexQuotes } from '@/lib/market-data'

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol')
  const symbols = req.nextUrl.searchParams.get('symbols')
  const indices = req.nextUrl.searchParams.get('indices')

  if (indices === 'true') {
    return NextResponse.json(getIndexQuotes())
  }

  if (symbols) {
    const list = symbols.split(',').map(s => s.trim())
    return NextResponse.json(getMultipleQuotes(list))
  }

  if (symbol) {
    return NextResponse.json(getStockQuote(symbol))
  }

  return NextResponse.json({ error: 'Provide symbol or symbols parameter' }, { status: 400 })
}
