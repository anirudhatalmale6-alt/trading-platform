// Market data service - generates realistic demo data when Angel One API is not configured
// When API keys are provided, it will use real Angel One SmartAPI

import { POPULAR_STOCKS, MARKET_INDICES } from './utils'

export interface StockQuote {
  symbol: string
  name: string
  exchange: string
  ltp: number       // last traded price
  open: number
  high: number
  low: number
  close: number     // previous close
  change: number
  changePercent: number
  volume: number
  token?: string
}

export interface CandleData {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// Base prices for demo data (approximate real prices in INR as of 2025)
const BASE_PRICES: Record<string, number> = {
  'RELIANCE': 2950, 'TCS': 4200, 'HDFCBANK': 1720, 'INFY': 1850,
  'ICICIBANK': 1280, 'HINDUNILVR': 2500, 'SBIN': 780, 'BHARTIARTL': 1650,
  'ITC': 440, 'KOTAKBANK': 1850, 'LT': 3600, 'AXISBANK': 1150,
  'WIPRO': 520, 'TATAMOTORS': 760, 'MARUTI': 11500, 'SUNPHARMA': 1800,
  'BAJFINANCE': 7200, 'TITAN': 3500, 'ASIANPAINT': 2350, 'HCLTECH': 1700,
  'ADANIENT': 2800, 'TATASTEEL': 145, 'NTPC': 360, 'POWERGRID': 310,
  'ONGC': 260, 'TECHM': 1650, 'ULTRACEMCO': 11200, 'JSWSTEEL': 970,
  'M&M': 3000, 'COALINDIA': 380,
  'NIFTY 50': 23500, 'SENSEX': 77500, 'NIFTY BANK': 50200, 'NIFTY IT': 36800,
}

// Generate a random price fluctuation
function randomFluctuation(base: number, maxPercent = 3): number {
  const change = (Math.random() - 0.5) * 2 * (maxPercent / 100) * base
  return Math.round((base + change) * 100) / 100
}

// Generate realistic OHLCV for demo
function generateOHLCV(base: number): { open: number; high: number; low: number; close: number; volume: number } {
  const open = randomFluctuation(base, 1.5)
  const close = randomFluctuation(base, 2)
  const high = Math.max(open, close) + Math.random() * base * 0.01
  const low = Math.min(open, close) - Math.random() * base * 0.01
  const volume = Math.floor(Math.random() * 5000000 + 500000)
  return {
    open: Math.round(open * 100) / 100,
    high: Math.round(high * 100) / 100,
    low: Math.round(low * 100) / 100,
    close: Math.round(close * 100) / 100,
    volume,
  }
}

export function getStockQuote(symbol: string): StockQuote {
  const stock = [...POPULAR_STOCKS, ...MARKET_INDICES].find(s => s.symbol === symbol)
  const base = BASE_PRICES[symbol] || 1000
  const prevClose = randomFluctuation(base, 0.5)
  const ohlcv = generateOHLCV(base)
  const change = ohlcv.close - prevClose
  const changePercent = (change / prevClose) * 100

  return {
    symbol,
    name: stock?.name || symbol,
    exchange: stock?.exchange || 'NSE',
    ltp: ohlcv.close,
    open: ohlcv.open,
    high: ohlcv.high,
    low: ohlcv.low,
    close: prevClose,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    volume: ohlcv.volume,
    token: stock?.token,
  }
}

export function getMultipleQuotes(symbols: string[]): StockQuote[] {
  return symbols.map(getStockQuote)
}

export function getIndexQuotes(): StockQuote[] {
  return MARKET_INDICES.map(idx => getStockQuote(idx.symbol))
}

export function searchStocks(query: string): typeof POPULAR_STOCKS {
  if (!query) return POPULAR_STOCKS.slice(0, 10)
  const q = query.toUpperCase()
  return POPULAR_STOCKS.filter(s =>
    s.symbol.includes(q) || s.name.toUpperCase().includes(q)
  ).slice(0, 15)
}

export function generateCandleData(symbol: string, timeframe: string, count = 100): CandleData[] {
  const base = BASE_PRICES[symbol] || 1000
  const candles: CandleData[] = []
  const now = new Date()
  let currentPrice = base * 0.95 // Start slightly below base

  // Calculate interval in minutes
  const intervalMinutes: Record<string, number> = {
    '1m': 1, '5m': 5, '15m': 15, '1h': 60, '4h': 240, '1D': 1440, '1W': 10080,
  }
  const interval = intervalMinutes[timeframe] || 1440

  for (let i = count; i >= 0; i--) {
    const date = new Date(now.getTime() - i * interval * 60 * 1000)
    // Skip weekends for daily
    if (interval >= 1440 && (date.getDay() === 0 || date.getDay() === 6)) continue

    const drift = (Math.random() - 0.48) * 0.02 * currentPrice // Slight upward bias
    const volatility = currentPrice * (0.005 + Math.random() * 0.015)

    const open = currentPrice
    const close = open + drift
    const high = Math.max(open, close) + Math.random() * volatility
    const low = Math.min(open, close) - Math.random() * volatility
    const volume = Math.floor(Math.random() * 3000000 + 200000)

    candles.push({
      time: date.toISOString().split('T')[0],
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume,
    })

    currentPrice = close
  }

  return candles
}
