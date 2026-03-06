'use client'
import { useEffect, useRef, useState } from 'react'

interface CandleData {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface Props {
  symbol: string
  timeframe: string
  chartType: 'candlestick' | 'line'
  height?: number
}

export default function TradingChart({ symbol, timeframe, chartType, height = 480 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRef = useRef<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!containerRef.current) return

    let cancelled = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let resizeObserver: any = null

    const init = async () => {
      const lc = await import('lightweight-charts')
      if (cancelled || !containerRef.current) return

      // Destroy previous chart
      if (chartRef.current) {
        try { chartRef.current.remove() } catch {}
        chartRef.current = null
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const chart: any = lc.createChart(containerRef.current, {
        layout: {
          background: { type: lc.ColorType.Solid, color: '#141922' },
          textColor: '#8b93a7',
          fontSize: 11,
          fontFamily: 'ui-monospace, monospace',
        },
        grid: {
          vertLines: { color: '#1e253220' },
          horzLines: { color: '#1e253240' },
        },
        crosshair: {
          vertLine: { color: '#387ed150', width: 1, style: 2, labelBackgroundColor: '#387ed1' },
          horzLine: { color: '#387ed150', width: 1, style: 2, labelBackgroundColor: '#387ed1' },
        },
        rightPriceScale: {
          borderColor: '#1e2532',
          scaleMargins: { top: 0.1, bottom: 0.1 },
        },
        timeScale: {
          borderColor: '#1e2532',
          timeVisible: timeframe !== '1D' && timeframe !== '1W',
          secondsVisible: false,
        },
        width: containerRef.current.clientWidth,
        height: height,
      })

      chartRef.current = chart

      setLoading(true)
      try {
        const res = await fetch(`/api/market/candles?symbol=${symbol}&tf=${timeframe}&count=150`)
        const data: CandleData[] = await res.json()
        if (cancelled) return

        if (chartType === 'candlestick') {
          const series = chart.addCandlestickSeries({
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderUpColor: '#26a69a',
            borderDownColor: '#ef5350',
            wickUpColor: '#26a69a80',
            wickDownColor: '#ef535080',
          })
          series.setData(data.map(d => ({
            time: d.time, open: d.open, high: d.high, low: d.low, close: d.close,
          })))
        } else {
          const series = chart.addLineSeries({
            color: '#387ed1',
            lineWidth: 2,
            crosshairMarkerRadius: 4,
            crosshairMarkerBorderColor: '#387ed1',
            crosshairMarkerBackgroundColor: '#141922',
          })
          series.setData(data.map(d => ({ time: d.time, value: d.close })))
        }

        // Volume
        const volumeSeries = chart.addHistogramSeries({
          color: '#387ed130',
          priceFormat: { type: 'volume' },
          priceScaleId: '',
        })
        volumeSeries.priceScale().applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } })
        volumeSeries.setData(data.map(d => ({
          time: d.time, value: d.volume,
          color: d.close >= d.open ? '#26a69a20' : '#ef535020',
        })))

        chart.timeScale().fitContent()
      } catch (err) {
        console.error('Failed to load chart data:', err)
      }
      setLoading(false)

      // Resize handler
      resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          chart.applyOptions({ width: entry.contentRect.width })
        }
      })
      if (containerRef.current) resizeObserver.observe(containerRef.current)
    }

    init()

    return () => {
      cancelled = true
      if (resizeObserver) resizeObserver.disconnect()
      if (chartRef.current) {
        try { chartRef.current.remove() } catch {}
        chartRef.current = null
      }
    }
  }, [symbol, timeframe, chartType, height])

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-card/80 z-10">
          <div className="flex items-center gap-2 text-txt-muted text-sm">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Loading...
          </div>
        </div>
      )}
      <div ref={containerRef} />
    </div>
  )
}
