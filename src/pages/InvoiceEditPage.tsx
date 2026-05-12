import type { ReactNode } from 'react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AppNavbar from '../components/layout/AppNavbar'
import InvoiceDatePicker from '../components/ui/InvoiceDatePicker'
import PaymentTermsSelect from '../components/ui/PaymentTermsSelect'
import type { PaymentTermValue } from '../components/ui/PaymentTermsSelect'
import { useAuth } from '../context/AuthContext'
import type { InvoiceDetail } from '../lib/api'
import { fetchInvoiceDetail, patchInvoice } from '../lib/api'
import { parseApiInvoiceDate } from '../lib/parseApiInvoiceDate'

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

function IconTrash({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M2 4h12M12.667 4v9.333a1.333 1.333 0 01-1.334 1.334H4.667a1.333 1.333 0 01-1.334-1.334V4m2.667 0V2.667a1.333 1.333 0 011.334-1.334h2.666a1.333 1.333 0 011.334 1.334V4M6.667 7.333v4M9.333 7.333v4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

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
        d="M5.5 1v9M1 5.5h9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string
  children: ReactNode
}) {
  const className = 'mb-2 block text-body font-medium text-slate'
  if (htmlFor) {
    return (
      <label htmlFor={htmlFor} className={className}>
        {children}
      </label>
    )
  }
  return <span className={className}>{children}</span>
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-6 text-body font-bold text-primary">{children}</h2>
  )
}

const inputClass =
  'w-full rounded-lg border border-slate-light bg-white px-4 py-3 text-heading-s-tight text-ink outline-none transition-shadow placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/25 dark:border-slate-light/40 dark:bg-navy-medium'

type ItemRow = { id: string; name: string; qty: string; price: string }

function formatMoney(n: number) {
  if (!Number.isFinite(n)) return '£ 0.00'
  return `£ ${n.toFixed(2)}`
}

function lineTotal(qty: string, price: string) {
  const q = Number.parseFloat(qty)
  const p = Number.parseFloat(price)
  if (Number.isNaN(q) || Number.isNaN(p)) return 0
  return q * p
}

function toISODate(d: Date | null): string | null {
  if (!d) return null
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function hydrateFromInvoice(data: InvoiceDetail, itemCounter: { current: number }) {
  const rows: ItemRow[] = data.line_items
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((li) => ({
      id: li.id,
      name: li.item_name,
      qty: String(li.quantity),
      price: String(li.unit_price),
    }))
  if (rows.length === 0) {
    itemCounter.current += 1
    rows.push({ id: `new-${itemCounter.current}`, name: '', qty: '1', price: '0.00' })
  }
  return rows
}

export default function InvoiceEditPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const itemIdRef = useRef(0)
  const [loaded, setLoaded] = useState<InvoiceDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadErr, setLoadErr] = useState<string | null>(null)
  const [items, setItems] = useState<ItemRow[]>([])
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [fromStreet, setFromStreet] = useState('')
  const [fromCity, setFromCity] = useState('')
  const [fromPost, setFromPost] = useState('')
  const [fromCountry, setFromCountry] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [toStreet, setToStreet] = useState('')
  const [toCity, setToCity] = useState('')
  const [toPost, setToPost] = useState('')
  const [toCountry, setToCountry] = useState('')
  const [invoiceDate, setInvoiceDate] = useState<Date | null>(null)
  const [paymentTerm, setPaymentTerm] = useState<PaymentTermValue>('net30')
  const [projectDesc, setProjectDesc] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const paymentSelectId = useId()

  const applyInvoice = useCallback((data: InvoiceDetail) => {
    setLoaded(data)
    setInvoiceNumber(data.invoice_number)
    const bf = data.bill_from
    const bt = data.bill_to
    setFromStreet(bf.street_address)
    setFromCity(bf.city)
    setFromPost(bf.post_code)
    setFromCountry(bf.country)
    setClientName(bt.client_name)
    setClientEmail(bt.client_email)
    setToStreet(bt.street_address)
    setToCity(bt.city)
    setToPost(bt.post_code)
    setToCountry(bt.country)
    setInvoiceDate(parseApiInvoiceDate(data.invoice_date))
    setPaymentTerm(data.payment_term)
    setProjectDesc(data.project_description ?? '')
    setItems(hydrateFromInvoice(data, itemIdRef))
  }, [])

  useEffect(() => {
    if (!invoiceId) return
    let alive = true
    ;(async () => {
      setLoading(true)
      setLoadErr(null)
      try {
        const data = await fetchInvoiceDetail(invoiceId)
        if (!alive) return
        if (!data) {
          setLoadErr('Invoice not found')
          setLoaded(null)
        } else {
          applyInvoice(data)
        }
      } catch (e) {
        if (alive) {
          setLoadErr(e instanceof Error ? e.message : 'Failed to load')
        }
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [invoiceId, applyInvoice])

  const detailPath = `/invoice/${invoiceId}`

  const addItem = () => {
    itemIdRef.current += 1
    setItems((prev) => [
      ...prev,
      {
        id: `new-${itemIdRef.current}`,
        name: '',
        qty: '1',
        price: '0.00',
      },
    ])
  }

  const removeItem = (id: string) => {
    setItems((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)))
  }

  const updateItem = (id: string, patch: Partial<ItemRow>) => {
    setItems((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    )
  }

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!invoiceId || !user) {
      navigate('/login', { state: { from: `/invoice/${invoiceId}/edit` } })
      return
    }
    const num = invoiceNumber.trim()
    if (!num) {
      setFormError('กรอกเลขที่ใบแจ้งหนี้')
      return
    }
    const iso = toISODate(invoiceDate)
    if (!iso) {
      setFormError('เลือกวันที่')
      return
    }
    const line_items = items
      .map((row, i) => ({
        sort_order: i,
        item_name: row.name.trim(),
        quantity: Number.parseFloat(row.qty),
        unit_price: Number.parseFloat(row.price),
      }))
      .filter((l) => l.item_name.length > 0)
    if (line_items.length === 0) {
      setFormError('ต้องมีอย่างน้อยหนึ่งรายการที่มีชื่อ')
      return
    }
    if (line_items.some((l) => Number.isNaN(l.quantity) || Number.isNaN(l.unit_price))) {
      setFormError('Qty / Price ไม่ถูกต้อง')
      return
    }

    setSaving(true)
    try {
      await patchInvoice(
        invoiceId,
        {
          invoice_number: num,
          project_description: projectDesc.trim() || null,
          invoice_date: iso,
          payment_term: paymentTerm,
          bill_from: {
            street_address: fromStreet.trim(),
            city: fromCity.trim(),
            post_code: fromPost.trim(),
            country: fromCountry.trim(),
          },
          bill_to: {
            client_name: clientName.trim(),
            client_email: clientEmail.trim(),
            street_address: toStreet.trim(),
            city: toCity.trim(),
            post_code: toPost.trim(),
            country: toCountry.trim(),
          },
          line_items,
        },
      )
      navigate(detailPath)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-white font-sans dark:bg-navy-dark">
        <AppNavbar />
        <p className="flex flex-1 items-center justify-center text-body text-slate">
          Loading…
        </p>
      </div>
    )
  }

  if (loadErr || !loaded) {
    return (
      <div className="flex min-h-screen flex-col bg-white font-sans dark:bg-navy-dark">
        <AppNavbar />
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="text-error">{loadErr ?? 'Not found'}</p>
          <Link to="/" className="text-primary font-medium">
            Home
          </Link>
        </div>
      </div>
    )
  }

  const idLabel = loaded.invoice_number

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans dark:bg-navy-dark">
      <AppNavbar />

      <main className="min-h-0 flex-1 bg-white px-6 pt-8 pb-32 dark:bg-navy-dark md:px-10 md:pb-36">
        <Link
          to={detailPath}
          className="inline-flex items-center gap-2 text-heading-s text-ink outline-none transition-opacity hover:opacity-70 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-navy-dark"
        >
          <IconChevronLeft className="text-primary" />
          Go back
        </Link>

        <h1 className="mt-6 text-heading-l text-ink">Edit #{idLabel}</h1>

        {formError ? (
          <p className="mt-4 rounded-lg bg-error/10 px-4 py-3 text-body text-error">
            {formError}
          </p>
        ) : null}

        <form
          id="invoice-edit-form"
          className="mt-10 space-y-10"
          onSubmit={onSave}
        >
          <section>
            <SectionTitle>Invoice</SectionTitle>
            <div>
              <FieldLabel htmlFor="edit-inv-num">Invoice number</FieldLabel>
              <input
                id="edit-inv-num"
                className={inputClass}
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />
            </div>
          </section>

          <section>
            <SectionTitle>Bill From</SectionTitle>
            <div className="space-y-6">
              <div>
                <FieldLabel>Street Address</FieldLabel>
                <input
                  className={inputClass}
                  value={fromStreet}
                  onChange={(e) => setFromStreet(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>City</FieldLabel>
                  <input
                    className={inputClass}
                    value={fromCity}
                    onChange={(e) => setFromCity(e.target.value)}
                  />
                </div>
                <div>
                  <FieldLabel>Post Code</FieldLabel>
                  <input
                    className={inputClass}
                    value={fromPost}
                    onChange={(e) => setFromPost(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <FieldLabel>Country</FieldLabel>
                <input
                  className={inputClass}
                  value={fromCountry}
                  onChange={(e) => setFromCountry(e.target.value)}
                />
              </div>
            </div>
          </section>

          <section>
            <SectionTitle>Bill To</SectionTitle>
            <div className="space-y-6">
              <div>
                <FieldLabel>Client&apos;s Name</FieldLabel>
                <input
                  className={inputClass}
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>
              <div>
                <FieldLabel>Client&apos;s Email</FieldLabel>
                <input
                  type="email"
                  className={inputClass}
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                />
              </div>
              <div>
                <FieldLabel>Street Address</FieldLabel>
                <input
                  className={inputClass}
                  value={toStreet}
                  onChange={(e) => setToStreet(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>City</FieldLabel>
                  <input
                    className={inputClass}
                    value={toCity}
                    onChange={(e) => setToCity(e.target.value)}
                  />
                </div>
                <div>
                  <FieldLabel>Post Code</FieldLabel>
                  <input
                    className={inputClass}
                    value={toPost}
                    onChange={(e) => setToPost(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <FieldLabel>Country</FieldLabel>
                <input
                  className={inputClass}
                  value={toCountry}
                  onChange={(e) => setToCountry(e.target.value)}
                />
              </div>
            </div>
          </section>

          <section>
            <SectionTitle>Invoice Details</SectionTitle>
            <div className="space-y-6">
              <div>
                <FieldLabel>Invoice Date</FieldLabel>
                <InvoiceDatePicker
                  selected={invoiceDate}
                  onSelectedChange={setInvoiceDate}
                />
              </div>
              <div>
                <FieldLabel htmlFor={paymentSelectId}>Payment Terms</FieldLabel>
                <PaymentTermsSelect
                  id={paymentSelectId}
                  value={paymentTerm}
                  onValueChange={setPaymentTerm}
                />
              </div>
              <div>
                <FieldLabel>Project Description</FieldLabel>
                <input
                  className={inputClass}
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-6 text-heading-m text-navy-dark dark:text-white">
              Item List
            </h2>
            <ul className="space-y-8">
              {items.map((row) => (
                <li key={row.id} className="space-y-4">
                  <div>
                    <FieldLabel>Item Name</FieldLabel>
                    <input
                      className={inputClass}
                      value={row.name}
                      onChange={(e) =>
                        updateItem(row.id, { name: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-[minmax(0,4.5rem)_minmax(0,1fr)_minmax(0,5rem)_auto] items-end gap-3 md:grid-cols-[5rem_1fr_6rem_auto]">
                    <div>
                      <FieldLabel>Qty.</FieldLabel>
                      <input
                        className={inputClass}
                        inputMode="decimal"
                        value={row.qty}
                        onChange={(e) =>
                          updateItem(row.id, { qty: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <FieldLabel>Price</FieldLabel>
                      <input
                        className={inputClass}
                        inputMode="decimal"
                        value={row.price}
                        onChange={(e) =>
                          updateItem(row.id, { price: e.target.value })
                        }
                      />
                    </div>
                    <div className="pb-3">
                      <p className="mb-2 text-body font-medium text-slate">
                        Total
                      </p>
                      <p className="text-heading-s-tight text-ink">
                        {formatMoney(lineTotal(row.qty, row.price))}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="mb-1 flex size-11 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-error"
                      aria-label="Remove item"
                      onClick={() => removeItem(row.id)}
                    >
                      <IconTrash />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={addItem}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-[#F9FAFE] py-4 text-heading-s-tight text-slate transition-colors hover:bg-slate-light/50 dark:bg-navy-medium"
            >
              <IconPlus className="text-primary" />
              Add New Item
            </button>
          </section>
        </form>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-light/80 bg-white px-6 py-4 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] dark:border-slate-light/20 dark:bg-navy-dark md:px-10">
        <div className="mx-auto flex w-full max-w-5xl gap-3">
          <Link
            to={detailPath}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-[#F9FAFE] px-6 py-3.5 text-center text-heading-s-tight text-navy-dark transition-colors hover:bg-slate-light/80 dark:bg-navy-medium dark:text-white"
          >
            Cancel
          </Link>
          <button
            type="submit"
            form="invoice-edit-form"
            disabled={saving}
            className="inline-flex flex-[1.15] items-center justify-center rounded-full bg-primary px-6 py-3.5 text-heading-s-tight text-white transition-colors hover:bg-primary-light disabled:opacity-50"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
