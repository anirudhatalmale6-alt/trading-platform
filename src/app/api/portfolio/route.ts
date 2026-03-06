import { NextResponse } from 'next/server'
import { getMultipleQuotes } from '@/lib/market-data'

export async function GET() {
  // Demo holdings
  const holdingSymbols = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'SBIN', 'ITC']
  const quotes = getMultipleQuotes(holdingSymbols)

  const holdings = [
    { symbol: 'RELIANCE', name: 'Reliance Industries', exchange: 'NSE', quantity: 10, avgPrice: 2850.00 },
    { symbol: 'TCS', name: 'Tata Consultancy Services', exchange: 'NSE', quantity: 5, avgPrice: 4100.00 },
    { symbol: 'HDFCBANK', name: 'HDFC Bank', exchange: 'NSE', quantity: 15, avgPrice: 1680.00 },
    { symbol: 'INFY', name: 'Infosys', exchange: 'NSE', quantity: 20, avgPrice: 1780.00 },
    { symbol: 'SBIN', name: 'State Bank of India', exchange: 'NSE', quantity: 50, avgPrice: 750.00 },
    { symbol: 'ITC', name: 'ITC', exchange: 'NSE', quantity: 100, avgPrice: 420.00 },
  ].map(h => {
    const quote = quotes.find(q => q.symbol === h.symbol)
    const ltp = quote?.ltp || h.avgPrice
    const investedVal = h.quantity * h.avgPrice
    const currentVal = h.quantity * ltp
    const pnl = currentVal - investedVal
    const pnlPercent = (pnl / investedVal) * 100
    return { ...h, ltp, investedValue: investedVal, currentValue: currentVal, pnl, pnlPercent, dayChange: quote?.change || 0, dayChangePercent: quote?.changePercent || 0 }
  })

  // Demo positions (intraday)
  const positions = [
    { symbol: 'TATAMOTORS', name: 'Tata Motors', exchange: 'NSE', quantity: 100, avgPrice: 755.00, side: 'BUY', productType: 'INTRADAY' },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel', exchange: 'NSE', quantity: -50, avgPrice: 1660.00, side: 'SELL', productType: 'INTRADAY' },
  ].map(p => {
    const quote = getMultipleQuotes([p.symbol])[0]
    const ltp = quote?.ltp || p.avgPrice
    const pnl = (ltp - p.avgPrice) * Math.abs(p.quantity) * (p.side === 'SELL' ? -1 : 1)
    return { ...p, type: p.side === 'SELL' ? 'SHORT' : 'LONG', ltp, pnl, pnlPercent: (pnl / (p.avgPrice * Math.abs(p.quantity))) * 100 }
  })

  const totalInvested = holdings.reduce((s, h) => s + h.investedValue, 0)
  const totalCurrent = holdings.reduce((s, h) => s + h.currentValue, 0)
  const totalPnl = totalCurrent - totalInvested
  const dayPnl = holdings.reduce((s, h) => s + (h.dayChange * h.quantity), 0)

  return NextResponse.json({
    holdings,
    positions,
    summary: {
      totalInvested,
      currentValue: totalCurrent,
      totalPnl,
      totalPnlPercent: (totalPnl / totalInvested) * 100,
      dayPnl,
      dayPnlPercent: (dayPnl / totalCurrent) * 100,
    },
  })
}
