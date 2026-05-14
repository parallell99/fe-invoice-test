import { useLayoutEffect, useRef, useState } from 'react'

/** ป้ายชื่อใน UI เท่านั้น — ค่าสีและลำดับมาจาก `App.css` */
const SWATCH_LABELS: Record<string, { name: string; note?: string }> = {
  primary: { name: 'Primary Purple' },
  'primary-light': { name: 'Light Purple' },
  'navy-dark': { name: 'Dark Navy', note: 'Sidebar / input BG' },
  'navy-medium': { name: 'Medium Navy' },
  'slate-light': { name: 'Light Grey/Blue' },
  muted: { name: 'Muted Blue/Grey' },
  slate: { name: 'Greyish Blue' },
  ink: { name: 'Near Black' },
  error: { name: 'Error Red' },
  'error-light': { name: 'Light Pink' },
  surface: { name: 'Light Background' },
  'deep-navy': { name: 'Deep Navy', note: 'Main BG' },
  'header-bar': { name: 'Header bar', note: 'Invoices top nav' },
  'navbar-icon': { name: 'Navbar icon', note: 'Moon / utility' },
  'navbar-divider': { name: 'Navbar divider' },
}

function parseColorTokensFromCss(): string[] {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--ds-color-tokens')
    .trim()
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function readColorVarFromAppCss(token: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--color-${token}`)
    .trim()
}

function rgbToHex(rgb: string): string | null {
  const m = rgb.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i)
  if (!m) return null
  const [, r, g, b] = m
  const h = (n: string) => Number.parseInt(n, 10).toString(16).padStart(2, '0')
  return `#${h(r)}${h(g)}${h(b)}`.toUpperCase()
}

function ColorSwatch({ token }: { token: string }) {
  const swatchRef = useRef<HTMLDivElement>(null)
  const [valueFromAppCss, setValueFromAppCss] = useState('')
  const [resolvedRgb, setResolvedRgb] = useState('')

  const label = SWATCH_LABELS[token]

  useLayoutEffect(() => {
    setValueFromAppCss(readColorVarFromAppCss(token))
    const el = swatchRef.current
    if (!el) return
    setResolvedRgb(getComputedStyle(el).backgroundColor)
  }, [token])

  const paint =
    valueFromAppCss &&
    (valueFromAppCss.startsWith('#') ||
      valueFromAppCss.startsWith('rgb') ||
      valueFromAppCss.startsWith('hsl'))
      ? valueFromAppCss
      : `var(--color-${token})`

  const hexFromResolved = resolvedRgb ? rgbToHex(resolvedRgb) : null

  return (
    <li className="overflow-hidden rounded-lg border border-navy-medium bg-navy-dark">
      <div
        ref={swatchRef}
        className="h-24 border-b border-navy-medium"
        style={{ backgroundColor: paint }}
      />
      <div className="p-4 text-left">
        <p className="text-heading-s text-white">
          {label?.name ?? token}
        </p>
        {label?.note && (
          <p className="text-body-tight mt-1 text-muted">{label.note}</p>
        )}
        <p className="text-body-tight mt-2 text-muted">
          จาก <code className="text-slate-light">App.css</code> (
          <code className="text-slate-light">--color-{token}</code>):
        </p>
        <p className="text-body mt-1 font-mono text-slate">
          {valueFromAppCss || '(ว่าง — ใช้ var บน swatch)'}
        </p>
        {resolvedRgb ? (
          <p className="text-body-tight mt-1 text-muted">
            แปลงใน browser: {resolvedRgb}
            {hexFromResolved ? ` · ${hexFromResolved}` : ''}
          </p>
        ) : null}
        <p className="text-body-tight mt-3 text-slate">
          CSS:{' '}
          <code className="rounded bg-navy-medium px-1.5 py-0.5 text-slate-light">
            var(--color-{token})
          </code>
        </p>
        <p className="text-body-tight mt-1 text-slate">
          Tailwind:{' '}
          <code className="rounded bg-navy-medium px-1.5 py-0.5 text-slate-light">
            bg-{token}
          </code>
        </p>
      </div>
    </li>
  )
}

export default function DesignSystemPage() {
  const [tokens, setTokens] = useState<string[]>([])

  useLayoutEffect(() => {
    setTokens(parseColorTokensFromCss())
  }, [])

  return (
    <div className="min-h-svh bg-deep-navy text-slate-light">
      <div className="mx-auto max-w-4xl px-5 py-10 pb-16">
        <header className="mb-12 flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-4">
            <div
              className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary"
              aria-hidden
            >
              <span className="text-heading-s text-white">◐</span>
            </div>
            <div>
              <p className="text-heading-m text-white">Design system</p>
              <p className="text-body text-muted">
                ลำดับสีจาก{' '}
                <code className="rounded bg-navy-medium px-1.5 text-slate-light">
                  --ds-color-tokens
                </code>{' '}
                ใน <code className="rounded bg-navy-medium px-1.5 text-slate-light">App.css</code>
              </p>
            </div>
          </div>
        </header>

        <section className="mb-14">
          <h2 className="text-heading-l mb-6 text-white">Colors</h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {tokens.map((token) => (
              <ColorSwatch key={token} token={token} />
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-navy-medium bg-navy-dark p-6 sm:p-8">
          <h2 className="text-heading-l mb-8 text-white">Typography</h2>
          <p className="text-body mb-8 text-muted">
            Font: <span className="text-slate-light">League Spartan</span> —
            Bold (headings), Medium (body)
          </p>

          <div className="space-y-8 text-left">
            <div>
              <p className="text-body-tight mb-2 text-muted">Heading L</p>
              <p className="text-heading-l text-white">
                Spartan Bold · 36px / 32px · -1px
              </p>
            </div>
            <div>
              <p className="text-body-tight mb-2 text-muted">Heading M</p>
              <p className="text-heading-m text-white">
                Spartan Bold · 24px / 22px · -0.75px
              </p>
            </div>
            <div>
              <p className="text-body-tight mb-2 text-muted">Heading S</p>
              <p className="text-heading-s text-white">
                Spartan Bold · 15px / 24px · -0.25px
              </p>
            </div>
            <div>
              <p className="text-body-tight mb-2 text-muted">
                Heading S (variant)
              </p>
              <p className="text-heading-s-tight text-white">
                Spartan Bold · 15px / 15px · -0.25px
              </p>
            </div>
            <div>
              <p className="text-body-tight mb-2 text-muted">Body</p>
              <p className="text-body text-slate-light">
                Spartan Medium · 13px / 18px · -0.1px — The quick brown fox
                jumps over the lazy dog.
              </p>
            </div>
            <div>
              <p className="text-body-tight mb-2 text-muted">Body (variant)</p>
              <p className="text-body-tight text-slate-light">
                Spartan Medium · 13px / 15px · -0.25px — Compact line for
                tables and labels.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
 