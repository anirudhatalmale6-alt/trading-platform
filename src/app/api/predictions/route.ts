import { NextRequest, NextResponse } from 'next/server'
import { getTopPicks, getAllPredictions, analyzeStock } from '@/lib/prediction-engine'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get('symbol')
  const top = searchParams.get('top')
  const all = searchParams.get('all')

  try {
    if (symbol) {
      const prediction = analyzeStock(symbol.toUpperCase())
      return NextResponse.json(prediction)
    }

    if (all === 'true') {
      const predictions = getAllPredictions()
      return NextResponse.json({ predictions, generatedAt: new Date().toISOString() })
    }

    // Default: top picks
    const limit = top ? parseInt(top) : 10
    const picks = getTopPicks(limit)
    return NextResponse.json({ picks, generatedAt: new Date().toISOString() })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Prediction failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
