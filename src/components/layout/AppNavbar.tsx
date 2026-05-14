import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../theme/ThemeProvider'

function NavbarLogoMark() {
  const maskId = `navbar-logo-mask-${useId().replace(/:/g, '')}`

  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse">
          <rect width="40" height="40" fill="white" />
          <path d="M20 2 L32 26 L8 26 Z" fill="black" />
        </mask>
      </defs>
      <circle cx="20" cy="21" r="11" fill="white" mask={`url(#${maskId})`} />
    </svg>
  )
}

function IconMoon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        fill="currentColor"
      />
    </svg>
  )
}

function IconSun() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="4"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

const menuItemClass =
  'block w-full px-4 py-2.5 text-left text-body text-ink no-underline transition-colors hover:bg-surface dark:hover:bg-white/5'

export type AppNavbarProps = {
  avatarSrc?: string
  avatarAlt?: string
  /** ถ้าไม่ส่ง จะใช้ ThemeProvider (สลับ light/dark ที่ `html`) */
  onThemeToggle?: () => void
}

const defaultAvatar = 'https://i.pravatar.cc/160?img=47'

export default function AppNavbar({
  avatarSrc = defaultAvatar,
  avatarAlt = '',
  onThemeToggle: onThemeToggleProp,
}: AppNavbarProps) {
  const { theme, toggleTheme } = useTheme()
  const { user, loading: authLoading, logout } = useAuth()
  const onThemeToggle = onThemeToggleProp ?? toggleTheme
  const isDark = theme === 'dark'

  const [menuOpen, setMenuOpen] = useState(false)
  const menuWrapRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!menuOpen) return
    const onDoc = (e: MouseEvent) => {
      if (
        menuWrapRef.current &&
        !menuWrapRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="sticky top-0 z-40 flex h-[72px] w-full shrink-0 items-stretch justify-between self-start bg-header-bar shadow-sm md:h-[88px]">
      <Link
        to="/"
        className="flex h-full items-stretch outline-none ring-primary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-header-bar"
        aria-label="หน้าแรก"
      >
        <span className="flex h-full w-[96px] items-center justify-center rounded-br-[22px] bg-primary transition-colors hover:bg-primary-light md:w-[103px] md:rounded-br-[24px]">
          <NavbarLogoMark />
        </span>
      </Link>

      <nav
        className="flex items-center gap-6 pr-6 md:gap-8 md:pr-10"
        aria-label="เมนูหลัก"
      >
        {authLoading ? (
          <span
            className="inline-block h-4 w-14 rounded bg-white/15"
            aria-hidden
          />
        ) : null}
        <button
          type="button"
          onClick={onThemeToggle}
          className="rounded-lg p-2.5 text-navbar-icon transition-colors hover:bg-white/10"
          aria-label={isDark ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด'}
          aria-pressed={isDark}
        >
          {isDark ? <IconSun /> : <IconMoon />}
        </button>
        <div className="h-10 w-px shrink-0 bg-navbar-divider" aria-hidden />
        <div className="relative shrink-0" ref={menuWrapRef}>
          <button
            type="button"
            id="navbar-account-trigger"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-controls={menuOpen ? menuId : undefined}
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded-full ring-white/30 transition-shadow hover:ring-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-header-bar"
          >
            <img
              src={avatarSrc}
              alt={avatarAlt || (user ? user.user_name : 'Account menu')}
              width={40}
              height={40}
              className="size-10 rounded-full border-2 border-white/15 object-cover"
            />
          </button>
          {menuOpen ? (
            <div
              id={menuId}
              role="menu"
              aria-labelledby="navbar-account-trigger"
              className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[220px] rounded-lg border border-slate-light bg-white py-1 shadow-lg dark:border-white/10 dark:bg-navy-dark"
            >
              {user ? (
                <>
                  <p
                    className="border-b border-slate-light px-4 py-2 text-body-tight text-muted dark:border-white/10"
                    role="presentation"
                  >
                    {user.user_name}
                  </p>
                  <Link
                    to="/profile"
                    role="menuitem"
                    className={menuItemClass}
                    onClick={closeMenu}
                  >
                    Edit profile
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    className={`${menuItemClass} font-medium text-error`}
                    onClick={() => {
                      closeMenu()
                      void logout()
                    }}
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    role="menuitem"
                    className={menuItemClass}
                    onClick={closeMenu}
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    role="menuitem"
                    className={menuItemClass}
                    onClick={closeMenu}
                  >
                    Create account
                  </Link>
                </>
              )}
            </div>
          ) : null}
        </div>
      </nav>
    </header>
  )
}
