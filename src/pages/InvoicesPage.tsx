import { format } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AppNavbar from '../components/layout/AppNavbar'
import InvoiceStatusFilter from '../components/ui/InvoiceStatusFilter'
import type { InvoiceStatusId } from '../components/ui/InvoiceStatusFilter'
import type { InvoiceListRow } from '../lib/api'
import { fetchInvoicesList } from '../lib/api'
import { formatGbp } from '../lib/formatMoney'
import { paymentDueDate } from '../lib/paymentDue'
import emptyIllustration from '../image/Group 8.svg'

function IconPlus({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="11"
      height="11"
      viewBox="0 0 11 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M5.5 1V10M1 5.5H10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** ป้ายสถานะบนการ์ด — รองรับ light / dark ผ่านโทเค็น */
function listStatusBadge(status: InvoiceStatusId) {
  if (status === 'paid') {
    return (
      <span className="inline-flex items-center gap-2 rounded-md bg-emerald-500/12 px-4 py-2.5 text-body-tight font-bold text-emerald-700 ring-1 ring-inset ring-emerald-500/25 dark:bg-white/6 dark:text-emerald-400 dark:ring-white/10">
        <span
          className="size-2 shrink-0 rounded-full bg-emerald-600 dark:bg-emerald-400"
          aria-hidden
        />
        Paid
      </span>
    )
  }
  if (status === 'draft') {
    return (
      <span className="inline-flex items-center gap-2 rounded-md bg-slate-light/60 px-4 py-2.5 text-body-tight font-bold text-muted ring-1 ring-inset ring-slate-light dark:bg-white/6 dark:text-slate-300 dark:ring-white/10">
        <span
          className="size-2 shrink-0 rounded-full bg-slate dark:bg-slate-400"
          aria-hidden
        />
        Draft
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-md bg-amber-500/12 px-4 py-2.5 text-body-tight font-bold text-amber-700 ring-1 ring-inset ring-amber-500/30 dark:bg-white/6 dark:text-[#FF8F00] dark:ring-white/10">
      <span
        className="size-2 shrink-0 rounded-full bg-amber-600 dark:bg-[#FF8F00]"
        aria-hidden
      />
      Pending
    </span>
  )
}

function dueDateLabel(inv: InvoiceListRow): string {
  try {
    const due = paymentDueDate(inv.invoice_date, inv.payment_term)
    return format(due, 'd MMM yyyy')
  } catch {
    return '—'
  }
}

export default function InvoicesPage() {
  const [rows, setRows] = useState<InvoiceListRow[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<Set<InvoiceStatusId>>(
    () => new Set(),
  )

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      setErr(null)
      try {
        const data = await fetchInvoicesList()
        if (alive) setRows(data)
      } catch (e) {
        if (alive) {
          setErr(e instanceof Error ? e.message : 'Failed to load invoices')
        }
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const filtered = useMemo(() => {
    if (statusFilter.size === 0) return rows
    return rows.filter((r) => statusFilter.has(r.status))
  }, [rows, statusFilter])

  const subtitle = loading
    ? 'Loading…'
    : err
      ? err
      : filtered.length === 0
        ? rows.length === 0
          ? 'No invoices'
          : 'No invoices match filter'
        : `${filtered.length} invoice${filtered.length !== 1 ? 's' : ''}`

  return (
    <div className="flex min-h-screen flex-col bg-surface font-sans">
      <AppNavbar />

      <div className="flex min-h-0 flex-1 flex-col px-6 md:px-10">
        <header className="flex shrink-0 flex-wrap items-end justify-between gap-6 pt-8 pb-10 md:pt-10 md:pb-12">
          <div>
            <h1 className="text-heading-l text-ink">Invoices</h1>
            <p className="mt-2 text-body text-muted">{subtitle}</p>
          </div>
          <div className="relative flex min-w-0 flex-1 flex-wrap items-center justify-end gap-5 md:gap-6">
            <InvoiceStatusFilter
              selected={statusFilter}
              onChange={setStatusFilter}
            />
            <Link
              to="/invoice/new"
              className="inline-flex items-center gap-3 rounded-full bg-primary py-2 pr-4 pl-2 text-heading-s-tight text-white shadow-sm transition-colors hover:bg-primary-light md:pr-5 md:pl-2.5"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white md:size-9">
                <IconPlus className="text-primary" />
              </span>
              New
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-1 items-center justify-center pb-20 text-body text-slate">
            Loading invoices…
          </div>
        ) : err ? (
          <div className="mx-auto max-w-md flex-1 px-4 pb-20 text-center text-body text-error">
            {err}
            <p className="mt-4 text-slate">
              ตรวจสอบว่า API รันที่{' '}
              <code className="rounded bg-slate-light/50 px-1">VITE_API_URL</code>{' '}
              และ CORS เปิดอยู่
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-4 pb-16 text-center md:pb-20">
            <img
              src={emptyIllustration}
              alt=""
              width={206}
              height={278}
              className="mx-auto h-auto w-full max-w-[min(100%,260px)] select-none md:max-w-[280px]"
            />
            <h2 className="mt-10 text-heading-m text-ink md:mt-12">
              There is nothing here
            </h2>
            <p className="mt-4 max-w-md text-body text-slate md:mt-5">
              Create an invoice by clicking the{' '}
              <span className="font-bold text-ink">New</span> button and get
              started
            </p>
          </div>
        ) : (
          <ul className="mx-auto w-full max-w-3xl space-y-4 pb-24">
            {filtered.map((inv) => {
              const totalNum = Number.parseFloat(inv.total ?? '0')
              return (
                <li key={inv.id}>
                  <Link
                    to={`/invoice/${inv.id}/edit`}
                    className="block rounded-lg bg-white px-6 py-5 shadow-md ring-1 ring-slate-light transition-[box-shadow,filter] hover:shadow-lg hover:brightness-[1.03] dark:bg-navy-dark dark:ring-white/5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <p className="min-w-0 text-heading-s-tight text-ink dark:text-white">
                        <span className="font-medium text-slate">#</span>
                        <span className="font-bold">{inv.invoice_number}</span>
                      </p>
                      <p className="shrink-0 text-right text-heading-s-tight font-normal text-ink dark:text-white">
                        {inv.client_name}
                      </p>
                    </div>
                    <div className="mt-5 flex items-end justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-body text-ink dark:text-white">
                          <span className="text-slate">Due </span>
                          <span>{dueDateLabel(inv)}</span>
                        </p>
                        <p className="mt-2 text-heading-m font-bold tracking-tight text-ink dark:text-white">
                          {formatGbp(totalNum)}
                        </p>
                      </div>
                      <div className="shrink-0 self-center">
                        {listStatusBadge(inv.status)}
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
