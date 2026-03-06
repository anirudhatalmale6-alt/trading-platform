'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [name, setName] = useState('')
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
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Registration failed')
        setLoading(false)
        return
      }
      // Auto sign in
      await signIn('credentials', { email, password, redirect: false })
      router.push('/dashboard')
    } catch {
      setError('Registration failed')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          </div>
          <span className="text-lg font-bold tracking-tight">TRADING</span>
        </div>

        <h2 className="text-xl font-semibold mb-1">Create account</h2>
        <p className="text-sm text-txt-secondary mb-8">Start trading on NSE & BSE markets</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-bear/10 border border-bear/20 text-bear text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-txt-secondary mb-1.5 font-medium">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full h-11 px-3.5 bg-bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
              placeholder="Your name"
              required
            />
          </div>
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
              placeholder="Min 6 characters"
              minLength={6}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-txt-secondary">
          Already have an account?{' '}
          <Link href="/login" className="text-accent hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
