import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AppNavbar from '../components/layout/AppNavbar'
import { useAuth } from '../context/AuthContext'
import { registerRequest } from '../lib/api'

const inputClass =
  'w-full rounded-lg border border-slate-light bg-white px-4 py-3 text-heading-s-tight text-ink outline-none transition-shadow placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/25 dark:border-slate-light/40 dark:bg-navy-medium'

const MIN_PASSWORD = 6

export default function RegisterPage() {
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const name = userName.trim()
    if (!name) {
      setError('กรุณากรอกชื่อผู้ใช้')
      return
    }
    if (password.length < MIN_PASSWORD) {
      setError(`รหัสผ่านต้องมีอย่างน้อย ${MIN_PASSWORD} ตัวอักษร`)
      return
    }
    if (password !== confirmPassword) {
      setError('รหัสผ่านยืนยันไม่ตรงกัน')
      return
    }
    setLoading(true)
    try {
      const { user } = await registerRequest(name, password)
      setUser(user)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'สมัครไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface font-sans">
      <AppNavbar />
      <main className="mx-auto w-full max-w-md flex-1 px-6 py-12 md:px-10">
        <h1 className="text-heading-l text-ink">Create account</h1>
        <p className="mt-2 text-body text-slate">
          สร้างบัญชีใหม่ ระบบจะล็อกอินให้อัตโนมัติหลังสมัครสำเร็จ
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          {error ? (
            <p className="rounded-lg bg-error/10 px-4 py-3 text-body text-error">
              {error}
            </p>
          ) : null}
          <div>
            <label
              htmlFor="register-user"
              className="mb-2 block text-body font-medium text-slate"
            >
              Username
            </label>
            <input
              id="register-user"
              className={inputClass}
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div>
            <label
              htmlFor="register-pass"
              className="mb-2 block text-body font-medium text-slate"
            >
              Password
            </label>
            <input
              id="register-pass"
              type="password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <p className="mt-1.5 text-body-tight text-muted">
              อย่างน้อย {MIN_PASSWORD} ตัวอักษร
            </p>
          </div>
          <div>
            <label
              htmlFor="register-pass2"
              className="mb-2 block text-body font-medium text-slate"
            >
              Confirm password
            </label>
            <input
              id="register-pass2"
              type="password"
              className={inputClass}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-primary py-3.5 text-heading-s-tight font-bold text-white transition-colors hover:bg-primary-light disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="mt-6 text-center text-body text-slate">
          มีบัญชีแล้ว?{' '}
          <Link
            to="/login"
            state={location.state}
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
        <p className="mt-3 text-center text-body text-slate">
          <Link to="/" className="font-medium text-primary hover:underline">
            Back to invoices
          </Link>
        </p>
      </main>
    </div>
  )
}
