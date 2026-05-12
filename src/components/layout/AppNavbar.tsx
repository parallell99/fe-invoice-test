import { useId } from 'react'
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

export type AppNavbarProps = {
  avatarSrc?: string
  avatarAlt?: string
  /** ถ้าไม่ส่ง จะใช้ ThemeProvider (สลับ light/dark ที่ `html`) */
  onThemeToggle?: () => void
}

const defaultAvatar =
  'https://i.pravatar.cc/160?img=47'

export default function AppNavbar({
  avatarSrc = defaultAvatar,
  avatarAlt = '',
  onThemeToggle: onThemeToggleProp,
}: AppNavbarProps) {
  const { theme, toggleTheme } = useTheme()
  const { user, loading: authLoading, logout } = useAuth()
  const onThemeToggle = onThemeToggleProp ?? toggleTheme
  const isDark = theme === 'dark'

  return (
    <header className="sticky top-0 z-40 flex h-[72px] w-full shrink-0 items-stretch justify-between self-start bg-header-bar shadow-sm md:h-[88px]">
      <Link
        to="/"
        className="flex h-full items-stretch outline-none ring-primary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-header-bar)"
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
        ) : user ? (
          <button
            type="button"
            onClick={() => {
              void logout()
            }}
            className="text-body-tight font-bold text-white/90 transition-opacity hover:opacity-80"
          >
            Log out
          </button>
        ) : (
          <Link
            to="/login"
            className="text-body-tight font-bold text-white/90 transition-opacity hover:opacity-80"
          >
            Log in
          </Link>
        )}
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
        <img
          src={avatarSrc}
          alt={avatarAlt}
          width={40}
          height={40}
          className="size-10 shrink-0 rounded-full border-2 border-white/15 object-cover"
        />
      </nav>
    </header>
  )
}
