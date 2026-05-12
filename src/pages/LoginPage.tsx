import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AppNavbar from '../components/layout/AppNavbar'
import { useAuth } from '../context/AuthContext'
import { loginRequest } from '../lib/api'

const inputClass =
  'w-full rounded-lg border border-slate-light bg-white px-4 py-3 text-heading-s-tight text-ink outline-none transition-shadow placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/25 dark:border-slate-light/40 dark:bg-navy-medium'

export default function LoginPage() {
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [userName, setUserName] = useState('demo_user')
  const [password, setPassword] = useState('secret12')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { user } = await loginRequest(userName.trim(), password)
      setUser(user)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface font-sans">
      <AppNavbar />
      <main className="mx-auto w-full max-w-md flex-1 px-6 py-12 md:px-10">
        <h1 className="text-heading-l text-ink">Sign in</h1>
        <p className="mt-2 text-body text-slate">
          ใช้บัญชีเดียวกับ API (เช่น demo_user จาก migration)
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          {error ? (
            <p className="rounded-lg bg-error/10 px-4 py-3 text-body text-error">
              {error}
            </p>
          ) : null}
          <div>
            <label htmlFor="login-user" className="mb-2 block text-body font-medium text-slate">
              Username
            </label>
            <input
              id="login-user"
              className={inputClass}
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="login-pass" className="mb-2 block text-body font-medium text-slate">
              Password
            </label>
            <input
              id="login-pass"
              type="password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-primary py-3.5 text-heading-s-tight font-bold text-white transition-colors hover:bg-primary-light disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="mt-6 text-center text-body text-slate">
          <Link to="/" className="font-medium text-primary hover:underline">
            Back to invoices
          </Link>
        </p>
      </main>
    </div>
  )
}
