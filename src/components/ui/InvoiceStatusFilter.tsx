import { useEffect, useId, useRef, useState } from 'react'

const STATUSES = [
  { id: 'draft' as const, label: 'Draft' },
  { id: 'pending' as const, label: 'Pending' },
  { id: 'paid' as const, label: 'Paid' },
]

export type InvoiceStatusId = (typeof STATUSES)[number]['id']

function IconChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="6"
      viewBox="0 0 10 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={`shrink-0 text-primary transition-transform ${open ? 'rotate-180' : ''}`}
    >
      <path
        d="M1 1L5 5L9 1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg
      width="10"
      height="8"
      viewBox="0 0 10 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M1 4L3.5 6.5L9 1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

type InvoiceStatusFilterProps = {
  selected: Set<InvoiceStatusId>
  onChange: (next: Set<InvoiceStatusId>) => void
}

export default function InvoiceStatusFilter({
  selected,
  onChange,
}: InvoiceStatusFilterProps) {
  const menuId = useId()
  const btnId = useId()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

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

  const toggle = (id: InvoiceStatusId) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange(next)
  }

  return (
    <div ref={rootRef} className="inline-block">
      <button
        type="button"
        id={btnId}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex cursor-pointer items-center gap-2 text-heading-s-tight text-ink transition-opacity hover:opacity-80 dark:text-white"
      >
        Filter
        <IconChevronDown open={open} />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-labelledby={btnId}
          className="absolute right-0 top-full z-[70] mt-2 min-w-[220px] overflow-hidden rounded-lg border border-slate-light/80 bg-white py-1 shadow-xl dark:border-slate-light/25 dark:bg-navy-dark dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
        >
          {STATUSES.map((row) => {
            const checked = selected.has(row.id)
            return (
              <button
                key={row.id}
                type="button"
                role="menuitemcheckbox"
                aria-checked={checked}
                className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-light/25 dark:hover:bg-navy-medium"
                onClick={() => toggle(row.id)}
              >
                <span
                  className={`flex size-4 shrink-0 items-center justify-center rounded-sm border-2 transition-colors md:size-[1.125rem] ${
                    checked
                      ? 'border-primary bg-primary text-white'
                      : 'border-slate bg-slate-light/80 shadow-sm hover:border-primary hover:bg-slate-light dark:border-slate-light/50 dark:bg-white/10 dark:shadow-none dark:hover:border-primary'
                  }`}
                >
                  {checked ? <IconCheck /> : null}
                </span>
                <span className="text-heading-s-tight font-bold text-navy-dark dark:text-white">
                  {row.label}
                </span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
