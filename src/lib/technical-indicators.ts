// Technical Analysis Indicators Library

export interface OHLCV {
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// Simple Moving Average
export function SMA(data: number[], period: number): number[] {
  const result: number[] = []
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) { result.push(NaN); continue }
    const slice = data.slice(i - period + 1, i + 1)
    result.push(slice.reduce((a, b) => a + b, 0) / period)
  }
  return result
}

// Exponential Moving Average
export function EMA(data: number[], period: number): number[] {
  const result: number[] = []
  const multiplier = 2 / (period + 1)
  for (let i = 0; i < data.length; i++) {
    if (i === 0) { result.push(data[0]); continue }
    if (i < period - 1) {
      // Use SMA until we have enough data
      const slice = data.slice(0, i + 1)
      result.push(slice.reduce((a, b) => a + b, 0) / (i + 1))
      continue
    }
    if (i === period - 1) {
      const slice = data.slice(0, period)
      result.push(slice.reduce((a, b) => a + b, 0) / period)
      continue
    }
    result.push((data[i] - result[i - 1]) * multiplier + result[i - 1])
  }
  return result
}

// Relative Strength Index
export function RSI(closes: number[], period = 14): number[] {
  const result: number[] = new Array(closes.length).fill(NaN)
  if (closes.length < period + 1) return result

  let avgGain = 0, avgLoss = 0
  for (let i = 1; i <= period; i++) {
    const change = closes[i] - closes[i - 1]
    if (change > 0) avgGain += change
    else avgLoss += Math.abs(change)
  }
  avgGain /= period
  avgLoss /= period

  result[period] = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss))

  for (let i = period + 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1]
    const gain = change > 0 ? change : 0
    const loss = change < 0 ? Math.abs(change) : 0
    avgGain = (avgGain * (period - 1) + gain) / period
    avgLoss = (avgLoss * (period - 1) + loss) / period
    result[i] = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss))
  }
  return result
}

// MACD (Moving Average Convergence Divergence)
export function MACD(closes: number[], fast = 12, slow = 26, signal = 9): {
  macd: number[], signal: number[], histogram: number[]
} {
  const emaFast = EMA(closes, fast)
  const emaSlow = EMA(closes, slow)
  const macdLine = emaFast.map((f, i) => f - emaSlow[i])
  const signalLine = EMA(macdLine, signal)
  const histogram = macdLine.map((m, i) => m - signalLine[i])
  return { macd: macdLine, signal: signalLine, histogram }
}

// Bollinger Bands
export function BollingerBands(closes: number[], period = 20, stdDev = 2): {
  upper: number[], middle: number[], lower: number[], bandwidth: number[]
} {
  const middle = SMA(closes, period)
  const upper: number[] = []
  const lower: number[] = []
  const bandwidth: number[] = []

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      upper.push(NaN); lower.push(NaN); bandwidth.push(NaN)
      continue
    }
    const slice = closes.slice(i - period + 1, i + 1)
    const mean = middle[i]
    const variance = slice.reduce((sum, v) => sum + (v - mean) ** 2, 0) / period
    const sd = Math.sqrt(variance) * stdDev
    upper.push(mean + sd)
    lower.push(mean - sd)
    bandwidth.push(sd * 2 / mean * 100)
  }
  return { upper, middle, lower, bandwidth }
}

// Average True Range (volatility)
export function ATR(candles: OHLCV[], period = 14): number[] {
  const result: number[] = new Array(candles.length).fill(NaN)
  const trueRanges: number[] = []

  for (let i = 0; i < candles.length; i++) {
    if (i === 0) {
      trueRanges.push(candles[i].high - candles[i].low)
      continue
    }
    const tr = Math.max(
      candles[i].high - candles[i].low,
      Math.abs(candles[i].high - candles[i - 1].close),
      Math.abs(candles[i].low - candles[i - 1].close)
    )
    trueRanges.push(tr)
  }

  if (trueRanges.length >= period) {
    let atr = trueRanges.slice(0, period).reduce((a, b) => a + b, 0) / period
    result[period - 1] = atr
    for (let i = period; i < trueRanges.length; i++) {
      atr = (atr * (period - 1) + trueRanges[i]) / period
      result[i] = atr
    }
  }
  return result
}

// Volume Weighted Average Price
export function VWAP(candles: OHLCV[]): number[] {
  let cumVol = 0, cumTP = 0
  return candles.map(c => {
    const tp = (c.high + c.low + c.close) / 3
    cumVol += c.volume
    cumTP += tp * c.volume
    return cumVol > 0 ? cumTP / cumVol : tp
  })
}

// Stochastic Oscillator
export function Stochastic(candles: OHLCV[], kPeriod = 14, dPeriod = 3): {
  k: number[], d: number[]
} {
  const k: number[] = []
  for (let i = 0; i < candles.length; i++) {
    if (i < kPeriod - 1) { k.push(NaN); continue }
    const slice = candles.slice(i - kPeriod + 1, i + 1)
    const high = Math.max(...slice.map(c => c.high))
    const low = Math.min(...slice.map(c => c.low))
    k.push(high === low ? 50 : ((candles[i].close - low) / (high - low)) * 100)
  }
  const d = SMA(k.filter(v => !isNaN(v)), dPeriod)
  // Pad d with NaN to align
  const dPadded = new Array(candles.length - d.length).fill(NaN).concat(d)
  return { k, d: dPadded }
}

// On-Balance Volume
export function OBV(candles: OHLCV[]): number[] {
  const result: number[] = [candles[0]?.volume || 0]
  for (let i = 1; i < candles.length; i++) {
    if (candles[i].close > candles[i - 1].close) result.push(result[i - 1] + candles[i].volume)
    else if (candles[i].close < candles[i - 1].close) result.push(result[i - 1] - candles[i].volume)
    else result.push(result[i - 1])
  }
  return result
}

// Average Directional Index (trend strength)
export function ADX(candles: OHLCV[], period = 14): number[] {
  const result: number[] = new Array(candles.length).fill(NaN)
  if (candles.length < period * 2) return result

  const plusDM: number[] = []
  const minusDM: number[] = []
  const tr: number[] = []

  for (let i = 1; i < candles.length; i++) {
    const upMove = candles[i].high - candles[i - 1].high
    const downMove = candles[i - 1].low - candles[i].low
    plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0)
    minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0)
    tr.push(Math.max(
      candles[i].high - candles[i].low,
      Math.abs(candles[i].high - candles[i - 1].close),
      Math.abs(candles[i].low - candles[i - 1].close)
    ))
  }

  // Smoothed averages
  let smoothPlusDM = plusDM.slice(0, period).reduce((a, b) => a + b, 0)
  let smoothMinusDM = minusDM.slice(0, period).reduce((a, b) => a + b, 0)
  let smoothTR = tr.slice(0, period).reduce((a, b) => a + b, 0)

  const dx: number[] = []
  for (let i = period; i < tr.length; i++) {
    if (i > period) {
      smoothPlusDM = smoothPlusDM - smoothPlusDM / period + plusDM[i]
      smoothMinusDM = smoothMinusDM - smoothMinusDM / period + minusDM[i]
      smoothTR = smoothTR - smoothTR / period + tr[i]
    }
    const plusDI = smoothTR > 0 ? (smoothPlusDM / smoothTR) * 100 : 0
    const minusDI = smoothTR > 0 ? (smoothMinusDM / smoothTR) * 100 : 0
    const diSum = plusDI + minusDI
    dx.push(diSum > 0 ? Math.abs(plusDI - minusDI) / diSum * 100 : 0)
  }

  if (dx.length >= period) {
    let adx = dx.slice(0, period).reduce((a, b) => a + b, 0) / period
    const offset = period * 2
    result[offset] = adx
    for (let i = period; i < dx.length; i++) {
      adx = (adx * (period - 1) + dx[i]) / period
      result[offset + i - period + 1] = adx
    }
  }
  return result
}
