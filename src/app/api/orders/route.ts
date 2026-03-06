import { NextRequest, NextResponse } from 'next/server'

// Demo orders data
const demoOrders = [
  { id: '1', symbol: 'RELIANCE', exchange: 'NSE', side: 'BUY', orderType: 'LIMIT', productType: 'DELIVERY', quantity: 10, price: 2920.00, status: 'COMPLETE', filledQty: 10, avgFillPrice: 2918.50, placedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '2', symbol: 'TCS', exchange: 'NSE', side: 'BUY', orderType: 'MARKET', productType: 'DELIVERY', quantity: 5, price: null, status: 'COMPLETE', filledQty: 5, avgFillPrice: 4185.20, placedAt: new Date(Date.now() - 172800000).toISOString() },
  { id: '3', symbol: 'INFY', exchange: 'NSE', side: 'SELL', orderType: 'LIMIT', productType: 'INTRADAY', quantity: 20, price: 1870.00, status: 'PENDING', filledQty: 0, avgFillPrice: null, placedAt: new Date().toISOString() },
  { id: '4', symbol: 'SBIN', exchange: 'NSE', side: 'BUY', orderType: 'SL', productType: 'DELIVERY', quantity: 50, price: 790.00, triggerPrice: 785.00, status: 'OPEN', filledQty: 0, avgFillPrice: null, placedAt: new Date().toISOString() },
  { id: '5', symbol: 'HDFCBANK', exchange: 'NSE', side: 'BUY', orderType: 'MARKET', productType: 'DELIVERY', quantity: 15, price: null, status: 'COMPLETE', filledQty: 15, avgFillPrice: 1715.30, placedAt: new Date(Date.now() - 259200000).toISOString() },
]

export async function GET() {
  // Map to frontend expected format
  const mapped = demoOrders.map(o => ({
    id: o.id,
    symbol: o.symbol,
    type: o.side,
    orderType: o.orderType,
    quantity: o.quantity,
    price: o.price || 0,
    triggerPrice: ('triggerPrice' in o) ? (o as Record<string, unknown>).triggerPrice : undefined,
    status: o.status,
    filledQty: o.filledQty,
    avgPrice: o.avgFillPrice || 0,
    timestamp: o.placedAt,
  }))
  return NextResponse.json(mapped)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const newOrder = {
    id: Date.now().toString(),
    ...body,
    status: body.orderType === 'MARKET' ? 'COMPLETE' : 'PENDING',
    filledQty: body.orderType === 'MARKET' ? body.quantity : 0,
    avgFillPrice: body.orderType === 'MARKET' ? body.price || (Math.random() * 1000 + 500) : null,
    placedAt: new Date().toISOString(),
  }
  return NextResponse.json(newOrder)
}
