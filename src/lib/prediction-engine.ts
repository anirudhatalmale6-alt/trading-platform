// AI Stock Prediction Engine
// Uses technical indicators + momentum analysis to generate predictions

import { generateCandleData, getStockQuote, type CandleData } from './market-data'
import { RSI, MACD, BollingerBands, SMA, EMA, ATR, ADX, Stochastic, OBV, type OHLCV } from './technical-indicators'
import { POPULAR_STOCKS } from './utils'

export type Signal = 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL'

export interface TechnicalScore {
  name: string
  value: number
  signal: Signal
  weight: number
  detail: string
}

export interface StockPrediction {
  symbol: string
  name: string
  exchange: string
  ltp: number
  change: number
  changePercent: number
  overallSignal: Signal
  confidence: number       // 0-100
  score: number           // -100 to +100
  targetPrice: number
  stopLoss: number
  potentialUpside: number  // percentage
  riskReward: number
  technicals: TechnicalScore[]
  momentum: string
  trend: string
  volatility: string
  volumeSignal: string
  summary: string
  generatedAt: string
}

function candlesToOHLCV(candles: CandleData[]): OHLCV[] {
  return candles.map(c => ({ open: c.open, high: c.high, low: c.low, close: c.close, volume: c.volume }))
}

export function analyzeStock(symbol: string): StockPrediction {
  // Get 200 daily candles for thorough analysis
  const candles = generateCandleData(symbol, '1D', 200)
  const ohlcv = candlesToOHLCV(candles)
  const closes = candles.map(c => c.close)
  const quote = getStockQuote(symbol)
  const stock = POPULAR_STOCKS.find(s => s.symbol === symbol)

  const technicals: TechnicalScore[] = []
  let totalWeightedScore = 0
  let totalWeight = 0

  // 1. RSI (14) - Overbought/Oversold
  const rsiValues = RSI(closes, 14)
  const rsi = rsiValues[rsiValues.length - 1]
  if (!isNaN(rsi)) {
    // Inverted: low RSI = buy, high RSI = sell
    const rsiScore = rsi < 30 ? 80 : rsi < 40 ? 50 : rsi < 50 ? 20 : rsi < 60 ? -10 : rsi < 70 ? -40 : -80
    technicals.push({
      name: 'RSI (14)',
      value: Math.round(rsi * 100) / 100,
      signal: rsi < 30 ? 'STRONG_BUY' : rsi < 45 ? 'BUY' : rsi > 70 ? 'STRONG_SELL' : rsi > 55 ? 'SELL' : 'HOLD',
      weight: 15,
      detail: rsi < 30 ? 'Oversold - potential reversal upward' : rsi > 70 ? 'Overbought - potential correction' : `Neutral at ${rsi.toFixed(1)}`
    })
    totalWeightedScore += rsiScore * 15
    totalWeight += 15
  }

  // 2. MACD
  const macd = MACD(closes)
  const macdVal = macd.macd[macd.macd.length - 1]
  const macdSig = macd.signal[macd.signal.length - 1]
  const macdHist = macd.histogram[macd.histogram.length - 1]
  const prevHist = macd.histogram[macd.histogram.length - 2]
  if (!isNaN(macdVal) && !isNaN(macdSig)) {
    const crossover = macdVal > macdSig
    const histRising = macdHist > prevHist
    const macdScore = crossover ? (histRising ? 70 : 40) : (histRising ? -20 : -60)
    technicals.push({
      name: 'MACD',
      value: Math.round(macdHist * 100) / 100,
      signal: crossover && histRising ? 'STRONG_BUY' : crossover ? 'BUY' : !crossover && !histRising ? 'STRONG_SELL' : 'SELL',
      weight: 15,
      detail: crossover ? `Bullish crossover, histogram ${histRising ? 'expanding' : 'contracting'}` : `Bearish crossover, histogram ${histRising ? 'contracting' : 'expanding'}`
    })
    totalWeightedScore += macdScore * 15
    totalWeight += 15
  }

  // 3. Bollinger Bands
  const bb = BollingerBands(closes)
  const bbUpper = bb.upper[bb.upper.length - 1]
  const bbLower = bb.lower[bb.lower.length - 1]
  const currentPrice = closes[closes.length - 1]
  if (!isNaN(bbUpper) && !isNaN(bbLower)) {
    const bbPosition = (currentPrice - bbLower) / (bbUpper - bbLower)
    const bbScore = bbPosition < 0.2 ? 70 : bbPosition < 0.4 ? 30 : bbPosition > 0.8 ? -70 : bbPosition > 0.6 ? -30 : 0
    technicals.push({
      name: 'Bollinger Bands',
      value: Math.round(bbPosition * 100),
      signal: bbPosition < 0.2 ? 'STRONG_BUY' : bbPosition < 0.35 ? 'BUY' : bbPosition > 0.8 ? 'STRONG_SELL' : bbPosition > 0.65 ? 'SELL' : 'HOLD',
      weight: 10,
      detail: bbPosition < 0.2 ? 'Price near lower band - potential bounce' : bbPosition > 0.8 ? 'Price near upper band - potential pullback' : 'Price within normal range'
    })
    totalWeightedScore += bbScore * 10
    totalWeight += 10
  }

  // 4. Moving Average Crossover (SMA 20 vs SMA 50)
  const sma20 = SMA(closes, 20)
  const sma50 = SMA(closes, 50)
  const sma200 = SMA(closes, 200)
  const sma20Val = sma20[sma20.length - 1]
  const sma50Val = sma50[sma50.length - 1]
  if (!isNaN(sma20Val) && !isNaN(sma50Val)) {
    const maCross = sma20Val > sma50Val
    const priceAboveSMA = currentPrice > sma20Val
    const maScore = maCross && priceAboveSMA ? 60 : maCross ? 30 : !maCross && !priceAboveSMA ? -60 : -30
    technicals.push({
      name: 'MA Crossover (20/50)',
      value: Math.round((sma20Val - sma50Val) * 100) / 100,
      signal: maCross && priceAboveSMA ? 'STRONG_BUY' : maCross ? 'BUY' : !maCross && !priceAboveSMA ? 'STRONG_SELL' : 'SELL',
      weight: 12,
      detail: maCross ? `Bullish: SMA20 (${sma20Val.toFixed(0)}) above SMA50 (${sma50Val.toFixed(0)})` : `Bearish: SMA20 (${sma20Val.toFixed(0)}) below SMA50 (${sma50Val.toFixed(0)})`
    })
    totalWeightedScore += maScore * 12
    totalWeight += 12
  }

  // 5. EMA Trend (9 vs 21)
  const ema9 = EMA(closes, 9)
  const ema21 = EMA(closes, 21)
  const ema9Val = ema9[ema9.length - 1]
  const ema21Val = ema21[ema21.length - 1]
  if (!isNaN(ema9Val) && !isNaN(ema21Val)) {
    const emaCross = ema9Val > ema21Val
    const emaScore = emaCross ? 50 : -50
    technicals.push({
      name: 'EMA Trend (9/21)',
      value: Math.round((ema9Val - ema21Val) * 100) / 100,
      signal: emaCross ? 'BUY' : 'SELL',
      weight: 10,
      detail: emaCross ? 'Short-term trend bullish' : 'Short-term trend bearish'
    })
    totalWeightedScore += emaScore * 10
    totalWeight += 10
  }

  // 6. ADX (trend strength)
  const adxValues = ADX(ohlcv)
  const adx = adxValues[adxValues.length - 1]
  if (!isNaN(adx)) {
    const trendStrong = adx > 25
    const adxScore = trendStrong ? 20 : -10
    technicals.push({
      name: 'ADX (14)',
      value: Math.round(adx * 100) / 100,
      signal: adx > 40 ? 'STRONG_BUY' : adx > 25 ? 'BUY' : 'HOLD',
      weight: 8,
      detail: adx > 40 ? 'Very strong trend' : adx > 25 ? 'Strong trend in place' : 'Weak/no trend - ranging market'
    })
    totalWeightedScore += adxScore * 8
    totalWeight += 8
  }

  // 7. Stochastic
  const stoch = Stochastic(ohlcv)
  const stochK = stoch.k[stoch.k.length - 1]
  if (!isNaN(stochK)) {
    const stochScore = stochK < 20 ? 60 : stochK < 35 ? 30 : stochK > 80 ? -60 : stochK > 65 ? -30 : 0
    technicals.push({
      name: 'Stochastic %K',
      value: Math.round(stochK * 100) / 100,
      signal: stochK < 20 ? 'STRONG_BUY' : stochK < 35 ? 'BUY' : stochK > 80 ? 'STRONG_SELL' : stochK > 65 ? 'SELL' : 'HOLD',
      weight: 10,
      detail: stochK < 20 ? 'Oversold territory' : stochK > 80 ? 'Overbought territory' : 'Neutral range'
    })
    totalWeightedScore += stochScore * 10
    totalWeight += 10
  }

  // 8. Volume Analysis (OBV trend)
  const obvValues = OBV(ohlcv)
  const obvSMA = SMA(obvValues, 20)
  const obvCurrent = obvValues[obvValues.length - 1]
  const obvAvg = obvSMA[obvSMA.length - 1]
  if (!isNaN(obvCurrent) && !isNaN(obvAvg)) {
    const obvBullish = obvCurrent > obvAvg
    const obvScore = obvBullish ? 40 : -40
    technicals.push({
      name: 'OBV Trend',
      value: Math.round(obvCurrent),
      signal: obvBullish ? 'BUY' : 'SELL',
      weight: 8,
      detail: obvBullish ? 'Volume supports upward price movement' : 'Volume suggests selling pressure'
    })
    totalWeightedScore += obvScore * 8
    totalWeight += 8
  }

  // 9. ATR (volatility)
  const atrValues = ATR(ohlcv)
  const atr = atrValues[atrValues.length - 1]
  const atrPercent = !isNaN(atr) ? (atr / currentPrice) * 100 : 2
  if (!isNaN(atr)) {
    technicals.push({
      name: 'ATR (14)',
      value: Math.round(atr * 100) / 100,
      signal: 'HOLD',
      weight: 6,
      detail: `Daily volatility: ${atrPercent.toFixed(1)}% (${atr.toFixed(2)} points)`
    })
    totalWeight += 6
  }

  // 10. Price vs SMA 200 (long-term trend)
  const sma200Val = sma200[sma200.length - 1]
  if (!isNaN(sma200Val)) {
    const aboveSMA200 = currentPrice > sma200Val
    const distFromSMA200 = ((currentPrice - sma200Val) / sma200Val) * 100
    const sma200Score = aboveSMA200 ? 50 : -50
    technicals.push({
      name: 'Price vs SMA 200',
      value: Math.round(distFromSMA200 * 100) / 100,
      signal: aboveSMA200 ? 'BUY' : 'SELL',
      weight: 6,
      detail: aboveSMA200 ? `${distFromSMA200.toFixed(1)}% above SMA200 - long-term bullish` : `${Math.abs(distFromSMA200).toFixed(1)}% below SMA200 - long-term bearish`
    })
    totalWeightedScore += sma200Score * 6
    totalWeight += 6
  }

  // Calculate overall score (-100 to +100)
  const normalizedScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0
  const score = Math.round(Math.max(-100, Math.min(100, normalizedScore)))

  // Determine signal
  let overallSignal: Signal
  if (score >= 50) overallSignal = 'STRONG_BUY'
  else if (score >= 20) overallSignal = 'BUY'
  else if (score > -20) overallSignal = 'HOLD'
  else if (score > -50) overallSignal = 'SELL'
  else overallSignal = 'STRONG_SELL'

  // Confidence based on how many indicators agree
  const buySignals = technicals.filter(t => t.signal === 'BUY' || t.signal === 'STRONG_BUY').length
  const sellSignals = technicals.filter(t => t.signal === 'SELL' || t.signal === 'STRONG_SELL').length
  const agreement = Math.max(buySignals, sellSignals) / technicals.length
  const confidence = Math.round(Math.min(95, Math.max(30, agreement * 100 + Math.abs(score) * 0.3)))

  // Target price and stop loss
  const atrVal = !isNaN(atr) ? atr : currentPrice * 0.02
  const targetMultiplier = score > 0 ? 2.5 : 1.5
  const targetPrice = score >= 0
    ? Math.round((currentPrice + atrVal * targetMultiplier) * 100) / 100
    : Math.round((currentPrice - atrVal * targetMultiplier) * 100) / 100
  const stopLoss = score >= 0
    ? Math.round((currentPrice - atrVal * 1.5) * 100) / 100
    : Math.round((currentPrice + atrVal * 1.5) * 100) / 100

  const potentialUpside = Math.round(((targetPrice - currentPrice) / currentPrice) * 10000) / 100
  const risk = Math.abs(currentPrice - stopLoss)
  const reward = Math.abs(targetPrice - currentPrice)
  const riskReward = risk > 0 ? Math.round((reward / risk) * 100) / 100 : 0

  // Determine momentum, trend, volatility
  const momentum = score > 30 ? 'Strong Bullish' : score > 10 ? 'Bullish' : score > -10 ? 'Neutral' : score > -30 ? 'Bearish' : 'Strong Bearish'
  const trend = (!isNaN(sma20Val) && !isNaN(sma50Val) && sma20Val > sma50Val) ? 'Uptrend' : 'Downtrend'
  const volatility = atrPercent > 3 ? 'High' : atrPercent > 1.5 ? 'Moderate' : 'Low'
  const volumeSignal = technicals.find(t => t.name === 'OBV Trend')?.signal === 'BUY' ? 'Accumulation' : 'Distribution'

  // Generate summary
  const summaryParts: string[] = []
  if (overallSignal === 'STRONG_BUY') summaryParts.push(`Strong buy signal with ${confidence}% confidence.`)
  else if (overallSignal === 'BUY') summaryParts.push(`Buy signal with ${confidence}% confidence.`)
  else if (overallSignal === 'HOLD') summaryParts.push(`Hold/neutral signal.`)
  else if (overallSignal === 'SELL') summaryParts.push(`Sell signal with ${confidence}% confidence.`)
  else summaryParts.push(`Strong sell signal with ${confidence}% confidence.`)

  summaryParts.push(`${buySignals} of ${technicals.length} indicators bullish.`)
  summaryParts.push(`${trend} with ${volatility.toLowerCase()} volatility.`)
  if (potentialUpside > 0) summaryParts.push(`Target: +${potentialUpside}% upside potential.`)

  return {
    symbol,
    name: stock?.name || quote.name || symbol,
    exchange: stock?.exchange || 'NSE',
    ltp: quote.ltp,
    change: quote.change,
    changePercent: quote.changePercent,
    overallSignal,
    confidence,
    score,
    targetPrice,
    stopLoss,
    potentialUpside,
    riskReward,
    technicals,
    momentum,
    trend,
    volatility,
    volumeSignal,
    summary: summaryParts.join(' '),
    generatedAt: new Date().toISOString(),
  }
}

// Get top picks - analyze all stocks and return ranked by signal strength
export function getTopPicks(limit = 10): StockPrediction[] {
  const predictions = POPULAR_STOCKS.map(s => analyzeStock(s.symbol))

  // Sort by score (highest first for buys)
  predictions.sort((a, b) => b.score - a.score)

  return predictions.slice(0, limit)
}

// Get predictions for all stocks
export function getAllPredictions(): StockPrediction[] {
  return POPULAR_STOCKS.map(s => analyzeStock(s.symbol))
    .sort((a, b) => b.score - a.score)
}
