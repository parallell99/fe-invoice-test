import { format, parseISO } from 'date-fns'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AppNavbar from '../components/layout/AppNavbar'
import { useAuth } from '../context/AuthContext'
import type { InvoiceDetail, InvoiceStatus } from '../lib/api'
import {
  deleteInvoice,
  fetchInvoiceDetail,
  patchInvoice,
} from '../lib/api'
import { paymentDueDate } from '../lib/paymentDue'

function IconChevronLeft({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="7"
      height="10"
      viewBox="0 0 7 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M6 1L1 5L6 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DetailLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-1 text-body font-medium text-slate">{children}</p>
  )
}

function statusBlock(status: InvoiceStatus) {
  if (status === 'paid') {
    return (
      <span className="inline-flex items-center gap-2 rounded-md bg-emerald-500/15 px-4 py-2 text-body-tight font-bold text-emerald-700 dark:text-emerald-400">
        <span className="size-2 shrink-0 rounded-full bg-emerald-500" aria-hidden />
        Paid
      </span>
    )
  }
  if (status === 'draft') {
    return (
      <span className="inline-flex items-center gap-2 rounded-md bg-slate-200/80 px-4 py-2 text-body-tight font-bold text-slate-700 dark:bg-white/10 dark:text-slate-200">
        <span className="size-2 shrink-0 rounded-full bg-slate-500" aria-hidden />
        Draft
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-md bg-[#FFF4EC] px-4 py-2 text-body-tight font-bold text-[#FF8F00]">
      <span className="size-2 shrink-0 rounded-full bg-[#FF8F00]" aria-hidden />
      Pending
    </span>
  )
}

export default function InvoiceDetailPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [inv, setInv] = useState<InvoiceDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    if (!invoiceId) return
    setLoading(true)
    setErr(null)
    try {
      const data = await fetchInvoiceDetail(invoiceId)
      if (!data) {
        setErr('Invoice not found')
        setInv(null)
      } else {
        setInv(data)
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to load')
      setInv(null)
    } finally {
      setLoading(false)
    }
  }, [invoiceId])

  useEffect(() => {
    load()
  }, [load])

  const requireAuth = () => {
    if (!user) {
      navigate('/login', { state: { from: `/invoice/${invoiceId}` } })
      return false
    }
    return true
  }

  const onMarkPaid = async () => {
    if (!invoiceId || !inv || !requireAuth()) return
    setBusy(true)
    try {
      await patchInvoice(invoiceId, { status: 'paid' })
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setBusy(false)
    }
  }

  const onDelete = async () => {
    if (!invoiceId || !requireAuth()) return
    if (!window.confirm('Delete this invoice permanently?')) return
    setBusy(true)
    try {
      await deleteInvoice(invoiceId)
      navigate('/')
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setBusy(false)
    }
  }

  const editPath = `/invoice/${invoiceId}/edit`

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-surface font-sans">
        <AppNavbar />
        <p className="flex flex-1 items-center justify-center text-body text-slate">
          Loading…
        </p>
      </div>
    )
  }

  if (err || !inv) {
    return (
      <div className="flex min-h-screen flex-col bg-surface font-sans">
        <AppNavbar />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
          <p className="text-body text-error">{err ?? 'Not found'}</p>
          <Link to="/" className="text-primary font-medium hover:underline">
            Back to list
          </Link>
        </div>
      </div>
    )
  }

  const bf = inv.bill_from
  const bt = inv.bill_to
  const due = paymentDueDate(inv.invoice_date, inv.payment_term)
  const dateFmt = (iso: string) => {
    try {
      return format(parseISO(iso), 'd MMM yyyy')
    } catch {
      return iso
    }
  }
  const grandTotal = inv.line_items.reduce(
    (s, li) => s + Number.parseFloat(li.line_total || '0'),
    0,
  )

  return (
    <div className="flex min-h-screen flex-col bg-surface font-sans">
      <AppNavbar />

      <main className="min-h-0 flex-1 px-6 pt-8 pb-36 md:px-10 md:pb-40">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-heading-s text-ink outline-none transition-opacity hover:opacity-70 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          <IconChevronLeft className="text-primary" />
          Go back
        </Link>

        <div className="mt-6 flex flex-col gap-4">
          <section className="rounded-lg bg-white px-6 py-6 shadow-sm dark:bg-navy-dark md:px-8">
            <div className="flex items-center justify-between gap-4">
              <span className="text-body font-medium text-slate">Status</span>
              {statusBlock(inv.status)}
            </div>
          </section>

          <article className="overflow-hidden rounded-lg bg-white shadow-sm dark:bg-navy-dark">
            <div className="px-6 pt-8 pb-8 md:px-8">
              <h1 className="text-heading-m text-ink">#{inv.invoice_number}</h1>
              <p className="mt-2 text-body text-slate">
                {inv.project_description ?? '—'}
              </p>

              <address className="mt-8 not-italic">
                <p className="text-body leading-relaxed text-slate">
                  {bf.street_address}
                  <br />
                  {bf.city}
                  <br />
                  {bf.post_code}
                  <br />
                  {bf.country}
                </p>
              </address>

              <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-0">
                <div className="space-y-10">
                  <div>
                    <DetailLabel>Invoice Date</DetailLabel>
                    <p className="text-heading-s-tight text-ink">
                      {dateFmt(inv.invoice_date)}
                    </p>
                  </div>
                  <div>
                    <DetailLabel>Payment Due</DetailLabel>
                    <p className="text-heading-s-tight text-ink">
                      {format(due, 'd MMM yyyy')}
                    </p>
                  </div>
                </div>
                <div>
                  <DetailLabel>Bill To</DetailLabel>
                  <p className="text-heading-s-tight text-ink">
                    {bt.client_name}
                  </p>
                  <p className="mt-2 text-body leading-relaxed text-slate">
                    {bt.street_address}
                    <br />
                    {bt.city}
                    <br />
                    {bt.post_code}
                    <br />
                    {bt.country}
                  </p>
                </div>
              </div>

              <div className="mt-10">
                <DetailLabel>Sent to</DetailLabel>
                <p className="text-heading-s-tight text-ink">
                  {bt.client_email}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-light/60">
              <div className="bg-[#F9FAFE] px-6 py-6 dark:bg-navy-medium/50 md:px-8">
                <ul className="space-y-5">
                  {inv.line_items.map((item) => {
                    const unit = Number.parseFloat(item.unit_price).toFixed(2)
                    const total = `£ ${Number.parseFloat(item.line_total).toFixed(2)}`
                    return (
                      <li
                        key={item.id}
                        className="flex items-start justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <p className="text-heading-s-tight text-ink">
                            {item.item_name}
                          </p>
                          <p className="mt-1 text-body text-slate">
                            {item.quantity} x £ {unit}
                          </p>
                        </div>
                        <p className="shrink-0 text-heading-s-tight text-ink">
                          {total}
                        </p>
                      </li>
                    )
                  })}
                </ul>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-b-lg bg-header-bar px-6 py-6 md:px-8">
                <span className="text-body font-medium text-white/90">
                  Grand Total
                </span>
                <span className="text-heading-l text-white">
                  £ {grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </article>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-light/80 bg-white px-6 py-4 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] dark:border-slate-light/20 dark:bg-navy-dark md:px-10">
        <div className="mx-auto flex w-full max-w-5xl gap-3">
          <Link
            to={editPath}
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#F9FAFE] px-6 py-3.5 text-heading-s-tight text-slate transition-colors hover:bg-slate-light/80 dark:bg-navy-medium dark:hover:bg-navy-medium/80"
          >
            Edit
          </Link>
          <button
            type="button"
            disabled={busy}
            onClick={onDelete}
            className="shrink-0 rounded-full bg-error px-6 py-3.5 text-heading-s-tight text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Delete
          </button>
          {inv.status !== 'paid' ? (
            <button
              type="button"
              disabled={busy}
              onClick={onMarkPaid}
              className="min-w-0 flex-1 rounded-full bg-primary px-6 py-3.5 text-heading-s-tight text-white transition-colors hover:bg-primary-light disabled:opacity-50"
            >
              Mark as Paid
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
