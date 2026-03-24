import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSubscription } from '../context/SubscriptionContext'
import { ROUTES } from '../routes'

export function LoginPage() {
  // AuthContext se naye functions nikaale
  const { user, loading, signIn, signUp } = useAuth()
  const { loading: subLoading, active } = useSubscription()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegistering, setIsRegistering] = useState(false) // Toggle for Login/Register

  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname

  useEffect(() => {
    document.title = isRegistering ? 'Register — Herbalife Stock' : 'Sign in — Herbalife Stock'
  }, [isRegistering])

  if (loading || (user && subLoading)) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    )
  }

  if (user) {
    if (active) {
      return <Navigate to={from || ROUTES.home} replace />
    }
    return <Navigate to={ROUTES.subscribe} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      alert("Please fill all fields")
      return
    }

    if (isRegistering) {
      await signUp(email, password)
    } else {
      await signIn(email, password)
    }
  }

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-slate-950 px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.2),transparent_50%),radial-gradient(ellipse_at_bottom,_rgba(13,148,136,0.15),transparent_55%)]" />
      
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-[0_0_60px_rgba(16,185,129,0.12)] backdrop-blur-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-xl font-black text-white shadow-lg shadow-emerald-500/30">
            H
          </div>
          <h1 className="text-2xl font-bold text-white">Herbalife Stock Manager</h1>
          <p className="mt-2 text-sm text-slate-400">
            {isRegistering ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-emerald-500 py-3.5 font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 active:scale-[0.98] mt-2"
          >
            {isRegistering ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-sm font-medium text-emerald-500 hover:text-emerald-400 transition"
          >
            {isRegistering 
              ? 'Already have an account? Sign In' 
              : "Don't have an account? Register Now"}
          </button>
        </div>
      </div>
    </div>
  )
}
