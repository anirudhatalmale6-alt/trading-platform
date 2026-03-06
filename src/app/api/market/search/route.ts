import { NextRequest, NextResponse } from 'next/server'
import { searchStocks } from '@/lib/market-data'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || ''
  const results = searchStocks(q)
  return NextResponse.json(results)
}
