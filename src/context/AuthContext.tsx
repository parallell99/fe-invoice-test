import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AuthUser } from '../lib/api'
import { fetchSessionUser, logoutRequest } from '../lib/api'

type AuthContextValue = {
  user: AuthUser | null
  /** true จนกว่าจะเช็ค /api/auth/me ครั้งแรกเสร็จ */
  loading: boolean
  setUser: (u: AuthUser | null) => void
  refreshSession: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshSession = useCallback(async () => {
    const u = await fetchSessionUser()
    setUser(u)
  }, [])

  useEffect(() => {
    let alive = true
    refreshSession().finally(() => {
      if (alive) setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [refreshSession])

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } finally {
      setUser(null)
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      setUser,
      refreshSession,
      logout,
    }),
    [user, loading, refreshSession, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
