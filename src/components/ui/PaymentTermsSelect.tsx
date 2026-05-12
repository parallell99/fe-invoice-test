import { useEffect, useId, useRef, useState } from 'react'

const OPTIONS = [
  { value: 'net7', label: 'Net 7 Days' },
  { value: 'net14', label: 'Net 14 Days' },
  { value: 'net30', label: 'Net 30 Days' },
  { value: 'net60', label: 'Net 60 Days' },
] as const

export type PaymentTermValue = (typeof OPTIONS)[number]['value']

type PaymentTermsSelectProps = {
  id?: string
  defaultValue?: PaymentTermValue
  /** controlled */
  value?: PaymentTermValue
  onValueChange?: (v: PaymentTermValue) => void
  name?: string
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="11"
      height="6"
      viewBox="0 0 11 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={`shrink-0 text-slate transition-transform dark:text-white ${open ? 'rotate-180' : ''}`}
    >
      <path
        d="M1 1L5.5 5L10 1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function PaymentTermsSelect({
  id: idProp,
  defaultValue = 'net30',
  value: valueProp,
  onValueChange,
  name = 'paymentTerms',
}: PaymentTermsSelectProps) {
  const autoId = useId()
  const id = idProp ?? autoId
  const [open, setOpen] = useState(false)
  const [inner, setInner] = useState<PaymentTermValue>(defaultValue)
  const controlled = valueProp !== undefined
  const value = controlled ? valueProp : inner
  const setValue = (v: PaymentTermValue) => {
    if (!controlled) setInner(v)
    onValueChange?.(v)
  }
  const rootRef = useRef<HTMLDivElement>(null)

  const label = OPTIONS.find((o) => o.value === value)?.label ?? ''

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name={name} value={value} readOnly />
      <button
        type="button"
        id={id}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={`${id}-listbox`}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-slate-light bg-white px-4 py-3 text-left text-heading-s-tight text-navy-dark outline-none transition-shadow focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 dark:border-slate-light/40 dark:bg-navy-dark dark:text-white"
      >
        <span className="min-w-0 truncate text-navy-dark dark:text-white">
          {label}
        </span>
        <Chevron open={open} />
      </button>

      {open ? (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          aria-labelledby={id}
          className="absolute left-0 right-0 top-full z-[70] mt-1 overflow-hidden rounded-lg border border-slate-light bg-white shadow-xl dark:border-navy-medium dark:bg-navy-dark dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
        >
          {OPTIONS.map((opt) => {
            const selected = opt.value === value
            return (
              <li key={opt.value} role="presentation" className="border-b border-slate-light last:border-b-0 dark:border-navy-medium">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`w-full cursor-pointer px-4 py-3 text-left text-heading-s-tight transition-colors hover:bg-surface dark:hover:bg-navy-medium ${
                    selected
                      ? 'font-bold text-primary dark:text-primary-light'
                      : 'text-ink dark:text-slate-light'
                  }`}
                  onClick={() => {
                    setValue(opt.value)
                    setOpen(false)
                  }}
                >
                  {opt.label}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
