import { NextRequest, NextResponse } from 'next/server'
import { generateCandleData } from '@/lib/market-data'

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol') || 'RELIANCE'
  const timeframe = req.nextUrl.searchParams.get('tf') || '1D'
  const count = parseInt(req.nextUrl.searchParams.get('count') || '100')

  const candles = generateCandleData(symbol, timeframe, count)
  return NextResponse.json(candles)
}
