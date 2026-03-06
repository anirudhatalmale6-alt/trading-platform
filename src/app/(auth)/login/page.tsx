'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await signIn('credentials', { email, password, redirect: false })
      if (res?.error) {
        setError('Invalid email or password')
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('Login failed')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-bg-card relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, #387ed1 40px, #387ed1 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, #387ed1 40px, #387ed1 41px)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            </div>
            <span className="text-xl font-bold tracking-tight">TRADING</span>
          </div>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-4 leading-tight" style={{ fontFamily: 'var(--font-geist-sans)' }}>
            Trade smarter.<br />
            <span className="text-accent">Execute faster.</span>
          </h1>
          <p className="text-txt-secondary text-base max-w-md leading-relaxed">
            Real-time market data, advanced charts, and seamless order execution for NSE & BSE markets.
          </p>
          <div className="flex gap-8 mt-10">
            <div>
              <div className="font-num text-2xl font-bold text-bull">23,547<span className="text-xs text-txt-muted">.85</span></div>
              <div className="text-xxs text-txt-muted mt-1 uppercase tracking-wider">NIFTY 50</div>
            </div>
            <div>
              <div className="font-num text-2xl font-bold text-bull">77,612<span className="text-xs text-txt-muted">.40</span></div>
              <div className="text-xxs text-txt-muted mt-1 uppercase tracking-wider">SENSEX</div>
            </div>
          </div>
        </div>
        <div className="relative z-10 text-xs text-txt-dim">
          NSE & BSE listed securities
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            </div>
            <span className="text-lg font-bold tracking-tight">TRADING</span>
          </div>

          <h2 className="text-xl font-semibold mb-1">Welcome back</h2>
          <p className="text-sm text-txt-secondary mb-8">Sign in to your trading account</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-bear/10 border border-bear/20 text-bear text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-txt-secondary mb-1.5 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full h-11 px-3.5 bg-bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
                placeholder="trader@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-txt-secondary mb-1.5 font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full h-11 px-3.5 bg-bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-txt-secondary">
            New here?{' '}
            <Link href="/register" className="text-accent hover:underline">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
