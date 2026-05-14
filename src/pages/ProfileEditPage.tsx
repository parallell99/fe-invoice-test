import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppNavbar from '../components/layout/AppNavbar'
import { useAuth } from '../context/AuthContext'
import { patchAuthProfile } from '../lib/api'

const inputClass =
  'w-full rounded-lg border border-slate-light bg-white px-4 py-3 text-heading-s-tight text-ink outline-none transition-shadow placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/25 dark:border-slate-light/40 dark:bg-navy-medium'

const MIN_PASSWORD = 6

export default function ProfileEditPage() {
  const { user, loading: authLoading, setUser } = useAuth()
  const navigate = useNavigate()

  const [userName, setUserName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate('/login', { replace: true, state: { from: '/profile' } })
      return
    }
    setUserName(user.user_name)
  }, [authLoading, user, navigate])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!user) return

    const nameTrim = userName.trim()
    if (!nameTrim) {
      setError('กรุณากรอกชื่อผู้ใช้')
      return
    }

    const changingPass =
      newPassword.length > 0 ||
      confirmPassword.length > 0 ||
      currentPassword.length > 0

    if (changingPass) {
      if (!currentPassword) {
        setError('กรอกรหัสผ่านปัจจุบันเมื่อต้องการเปลี่ยนรหัส')
        return
      }
      if (newPassword.length < MIN_PASSWORD) {
        setError(`รหัสใหม่ต้องมีอย่างน้อย ${MIN_PASSWORD} ตัวอักษร`)
        return
      }
      if (newPassword !== confirmPassword) {
        setError('รหัสใหม่กับยืนยันไม่ตรงกัน')
        return
      }
    }

    const body: {
      user_name?: string
      current_password?: string
      new_password?: string
    } = {}

    if (nameTrim !== user.user_name) {
      body.user_name = nameTrim
    }
    if (changingPass && newPassword) {
      body.current_password = currentPassword
      body.new_password = newPassword
    }

    if (!body.user_name && !body.new_password) {
      setError('ไม่มีการเปลี่ยนแปลง')
      return
    }

    setSaving(true)
    try {
      const { user: next } = await patchAuthProfile(body)
      setUser(next)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSuccess('บันทึกแล้ว')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen flex-col bg-surface font-sans">
        <AppNavbar />
        <main className="mx-auto w-full max-w-md flex-1 px-6 py-12 md:px-10">
          <p className="text-body text-slate">กำลังโหลด…</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface font-sans">
      <AppNavbar />
      <main className="mx-auto w-full max-w-md flex-1 px-6 py-12 md:px-10">
        <h1 className="text-heading-l text-ink">Edit profile</h1>
        <p className="mt-2 text-body text-slate">
          เปลี่ยนชื่อผู้ใช้หรือรหัสผ่าน (ถ้าเปลี่ยนรหัส ต้องกรอกรหัสปัจจุบัน)
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          {error ? (
            <p className="rounded-lg bg-error/10 px-4 py-3 text-body text-error">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="rounded-lg bg-primary/10 px-4 py-3 text-body text-primary">
              {success}
            </p>
          ) : null}
          <div>
            <label
              htmlFor="profile-user"
              className="mb-2 block text-body font-medium text-slate"
            >
              Username
            </label>
            <input
              id="profile-user"
              className={inputClass}
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div className="border-t border-slate-light pt-5 dark:border-white/10">
            <p className="mb-4 text-body font-medium text-slate">
              เปลี่ยนรหัสผ่าน (ไม่บังคับ)
            </p>
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="profile-current"
                  className="mb-2 block text-body font-medium text-slate"
                >
                  Current password
                </label>
                <input
                  id="profile-current"
                  type="password"
                  className={inputClass}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              <div>
                <label
                  htmlFor="profile-new"
                  className="mb-2 block text-body font-medium text-slate"
                >
                  New password
                </label>
                <input
                  id="profile-new"
                  type="password"
                  className={inputClass}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <p className="mt-1.5 text-body-tight text-muted">
                  อย่างน้อย {MIN_PASSWORD} ตัวอักษร
                </p>
              </div>
              <div>
                <label
                  htmlFor="profile-confirm"
                  className="mb-2 block text-body font-medium text-slate"
                >
                  Confirm new password
                </label>
                <input
                  id="profile-confirm"
                  type="password"
                  className={inputClass}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-full bg-primary py-3.5 text-heading-s-tight font-bold text-white transition-colors hover:bg-primary-light disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save changes'}
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
