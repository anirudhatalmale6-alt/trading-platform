'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Get started with basic trading tools',
    features: [
      { text: 'Real-time market data', included: true },
      { text: 'Watchlist (up to 10 stocks)', included: true },
      { text: 'Basic candlestick charts', included: true },
      { text: 'Market orders', included: true },
      { text: 'Portfolio tracking', included: true },
      { text: 'AI predictions (3/day)', included: true },
      { text: 'Advanced technical indicators', included: false },
      { text: 'Price alerts', included: false },
      { text: 'Detailed AI analysis', included: false },
      { text: 'Priority signals', included: false },
    ],
    cta: 'Current Plan',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 499,
    period: '/month',
    description: 'For serious traders who want an edge',
    features: [
      { text: 'Everything in Free', included: true },
      { text: 'Unlimited watchlist', included: true },
      { text: 'Advanced charts (15+ indicators)', included: true },
      { text: 'All order types (Limit, SL, SL-M)', included: true },
      { text: 'AI predictions (unlimited)', included: true },
      { text: 'Detailed technical analysis', included: true },
      { text: 'Target price & stop loss levels', included: true },
      { text: 'Price alerts (up to 20)', included: true },
      { text: 'Prediction accuracy tracking', included: true },
      { text: 'Priority email support', included: false },
    ],
    cta: 'Upgrade to Pro',
    popular: true,
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 999,
    period: '/month',
    description: 'Maximum edge with premium features',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Priority AI signals (early access)', included: true },
      { text: 'Multi-timeframe analysis', included: true },
      { text: 'Sector rotation insights', included: true },
      { text: 'Custom screener with AI filters', included: true },
      { text: 'Portfolio risk analytics', included: true },
      { text: 'Backtesting engine', included: true },
      { text: 'Unlimited price alerts', included: true },
      { text: 'API access', included: true },
      { text: 'Priority support (chat + email)', included: true },
    ],
    cta: 'Upgrade to Elite',
    popular: false,
  },
]

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-5 max-w-[1100px] mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-txt-primary mb-2">Choose Your Plan</h1>
          <p className="text-sm text-txt-secondary max-w-md mx-auto">
            Get AI-powered stock predictions and advanced trading tools to maximize your returns
          </p>

          {/* Annual toggle */}
          <div className="flex items-center justify-center gap-3 mt-5">
            <span className={cn('text-sm', !annual ? 'text-txt-primary font-medium' : 'text-txt-muted')}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={cn('w-12 h-6 rounded-full transition-colors relative', annual ? 'bg-accent' : 'bg-bg-raised')}
            >
              <div className={cn('w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform', annual ? 'translate-x-6' : 'translate-x-0.5')} />
            </button>
            <span className={cn('text-sm', annual ? 'text-txt-primary font-medium' : 'text-txt-muted')}>
              Annual <span className="text-xxs text-bull font-medium ml-1">Save 20%</span>
            </span>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map(plan => {
            const displayPrice = plan.price === 0 ? 0 : annual ? Math.round(plan.price * 0.8) : plan.price
            return (
              <div
                key={plan.id}
                className={cn(
                  'bg-bg-card border rounded-2xl p-6 relative transition-all',
                  plan.popular ? 'border-accent/50 shadow-lg shadow-accent/5 scale-[1.02]' : 'border-border hover:border-border-light'
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-accent text-white text-xxs font-semibold px-3 py-1 rounded-full">MOST POPULAR</span>
                  </div>
                )}

                <div className="mb-5">
                  <h3 className="text-lg font-bold text-txt-primary">{plan.name}</h3>
                  <p className="text-xxs text-txt-muted mt-1">{plan.description}</p>
                </div>

                <div className="mb-5">
                  <div className="flex items-baseline gap-1">
                    {displayPrice === 0 ? (
                      <span className="text-3xl font-bold text-txt-primary">Free</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold text-txt-primary">{'\u20B9'}{displayPrice}</span>
                        <span className="text-sm text-txt-muted">{plan.period}</span>
                      </>
                    )}
                  </div>
                  {annual && plan.price > 0 && (
                    <div className="text-xxs text-txt-muted mt-1">
                      <span className="line-through">{'\u20B9'}{plan.price}/mo</span>
                      <span className="text-bull ml-1">Save {'\u20B9'}{(plan.price - displayPrice) * 12}/year</span>
                    </div>
                  )}
                </div>

                <button
                  className={cn(
                    'w-full py-2.5 rounded-lg text-sm font-semibold transition-colors mb-5',
                    plan.popular
                      ? 'bg-accent hover:bg-accent-hover text-white'
                      : plan.id === 'free'
                        ? 'bg-bg-raised text-txt-secondary cursor-default'
                        : 'bg-bg-raised hover:bg-bg-hover text-txt-primary border border-border'
                  )}
                >
                  {plan.cta}
                </button>

                <div className="space-y-2.5">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      {f.included ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#26a69a" strokeWidth="2.5" className="shrink-0 mt-0.5"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#525d73" strokeWidth="2" className="shrink-0 mt-0.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      )}
                      <span className={cn('text-xs', f.included ? 'text-txt-secondary' : 'text-txt-muted/60')}>
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* FAQ */}
        <div className="mt-12 mb-8">
          <h2 className="text-lg font-bold text-txt-primary text-center mb-6">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-4 max-w-[900px] mx-auto">
            {[
              { q: 'How accurate are AI predictions?', a: 'Our AI analyzes 10+ technical indicators in real-time. While no prediction is 100% accurate, our system provides confidence scores so you can make informed decisions. We also track prediction accuracy over time.' },
              { q: 'Can I cancel anytime?', a: 'Yes! All plans are month-to-month (or annual). Cancel anytime from your settings. No lock-in contracts.' },
              { q: 'Do I need a demat account?', a: 'Yes, you need a broker account (like Angel One) to execute trades. Our platform connects to your broker for seamless trading.' },
              { q: 'Is my money safe?', a: 'We never hold your funds. All trades are executed through SEBI-registered brokers. Your money stays in your broker account.' },
            ].map((faq, i) => (
              <div key={i} className="bg-bg-card border border-border rounded-xl p-4">
                <h3 className="text-sm font-semibold text-txt-primary mb-2">{faq.q}</h3>
                <p className="text-xs text-txt-secondary leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
