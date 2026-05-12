import type { ReactNode } from 'react'
import { useId, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppNavbar from '../components/layout/AppNavbar'
import InvoiceDatePicker from '../components/ui/InvoiceDatePicker'
import PaymentTermsSelect from '../components/ui/PaymentTermsSelect'
import type { PaymentTermValue } from '../components/ui/PaymentTermsSelect'
import { useAuth } from '../context/AuthContext'
import type { InvoiceStatus } from '../lib/api'
import { createInvoice } from '../lib/api'

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

export default function InvoiceCreatePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const itemIdRef = useRef(0)
  const [items, setItems] = useState<ItemRow[]>([
    { id: 'i1', name: '', qty: '1', price: '0.00' },
  ])
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
  const [invoiceDate, setInvoiceDate] = useState<Date | null>(new Date())
  const [paymentTerm, setPaymentTerm] = useState<PaymentTermValue>('net30')
  const [projectDesc, setProjectDesc] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const paymentSelectId = useId()

  const addItem = () => {
    itemIdRef.current += 1
    setItems((prev) => [
      ...prev,
      {
        id: `i-${itemIdRef.current}`,
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

  const submit = async (status: InvoiceStatus) => {
    setFormError(null)
    if (!user) {
      navigate('/login', { state: { from: '/invoice/new' } })
      return
    }
    const num = invoiceNumber.trim()
    if (!num) {
      setFormError('กรอกเลขที่ใบแจ้งหนี้')
      return
    }
    const iso = toISODate(invoiceDate)
    if (!iso) {
      setFormError('เลือกวันที่ใบแจ้งหนี้')
      return
    }
    if (
      !fromStreet.trim() ||
      !fromCity.trim() ||
      !fromPost.trim() ||
      !fromCountry.trim()
    ) {
      setFormError('กรอก Bill From ให้ครบ')
      return
    }
    if (
      !clientName.trim() ||
      !clientEmail.trim() ||
      !toStreet.trim() ||
      !toCity.trim() ||
      !toPost.trim() ||
      !toCountry.trim()
    ) {
      setFormError('กรอก Bill To ให้ครบ')
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
      await createInvoice({
        invoice_number: num,
        status,
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
      })
      navigate('/')
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface font-sans">
      <AppNavbar />

      <main className="min-h-0 flex-1 pb-40 md:pb-44 px-[24px]">
        <div className="mx-auto w-full max-w-5xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-heading-s text-ink outline-none transition-opacity hover:opacity-70 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-navy-dark"
          >
            <IconChevronLeft className="text-primary" />
            Go back
          </Link>

          <h1 className="mt-6 text-heading-l text-ink">New Invoice</h1>

          {formError ? (
            <p className="mt-4 rounded-lg bg-error/10 px-4 py-3 text-body text-error">
              {formError}
            </p>
          ) : null}

          <form
            id="invoice-create-form"
            className="mt-10 space-y-10"
            onSubmit={(e) => e.preventDefault()}
          >
            <section>
              <SectionTitle>Invoice</SectionTitle>
              <div>
                <FieldLabel htmlFor="inv-num">Invoice number</FieldLabel>
                <input
                  id="inv-num"
                  className={inputClass}
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="e.g. INV-2026-003"
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
                    placeholder="e.g. 19 Union Terrace"
                    value={fromStreet}
                    onChange={(e) => setFromStreet(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>City</FieldLabel>
                    <input
                      className={inputClass}
                      placeholder="London"
                      value={fromCity}
                      onChange={(e) => setFromCity(e.target.value)}
                    />
                  </div>
                  <div>
                    <FieldLabel>Post Code</FieldLabel>
                    <input
                      className={inputClass}
                      placeholder="E1 3EZ"
                      value={fromPost}
                      onChange={(e) => setFromPost(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel>Country</FieldLabel>
                  <input
                    className={inputClass}
                    placeholder="United Kingdom"
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
                    placeholder="Alex Grim"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>
                <div>
                  <FieldLabel>Client&apos;s Email</FieldLabel>
                  <input
                    type="email"
                    className={inputClass}
                    placeholder="alexgrim@mail.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                  />
                </div>
                <div>
                  <FieldLabel>Street Address</FieldLabel>
                  <input
                    className={inputClass}
                    placeholder="84 Church Way"
                    value={toStreet}
                    onChange={(e) => setToStreet(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>City</FieldLabel>
                    <input
                      className={inputClass}
                      placeholder="Bradford"
                      value={toCity}
                      onChange={(e) => setToCity(e.target.value)}
                    />
                  </div>
                  <div>
                    <FieldLabel>Post Code</FieldLabel>
                    <input
                      className={inputClass}
                      placeholder="BD1 9PB"
                      value={toPost}
                      onChange={(e) => setToPost(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel>Country</FieldLabel>
                  <input
                    className={inputClass}
                    placeholder="United Kingdom"
                    value={toCountry}
                    onChange={(e) => setToCountry(e.target.value)}
                  />
                </div>
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
                    placeholder="Graphic Design"
                    value={projectDesc}
                    onChange={(e) => setProjectDesc(e.target.value)}
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-6 text-heading-m text-slate">Item List</h2>
              <ul className="space-y-8">
                {items.map((row) => (
                  <li key={row.id} className="space-y-4">
                    <div>
                      <FieldLabel>Item Name</FieldLabel>
                      <input
                        className={inputClass}
                        value={row.name}
                        placeholder="Banner Design"
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
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-[#F9FAFE] py-4 text-heading-s-tight text-primary transition-colors hover:bg-slate-light/50"
              >
                <IconPlus className="text-primary" />
                Add New Item
              </button>
            </section>
          </form>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-light/80 bg-white px-4 py-4 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] dark:border-slate-light/20 dark:bg-navy-dark md:px-10">
        <div className="mx-auto flex w-full max-w-5xl gap-2 md:gap-3">
          <Link
            to="/"
            className="inline-flex min-w-0 flex-1 items-center justify-center rounded-full bg-[#F9FAFE] px-3 py-3.5 text-center text-body-tight font-bold text-slate transition-colors hover:bg-slate-light/80 md:px-4 md:text-heading-s-tight"
          >
            Discard
          </Link>
          <button
            type="button"
            disabled={saving}
            onClick={() => submit('draft')}
            className="inline-flex min-w-0 flex-1 items-center justify-center rounded-full bg-navy-dark px-3 py-3.5 text-center text-body-tight font-bold text-white transition-colors hover:bg-navy-medium md:px-4 md:text-heading-s-tight disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => submit('pending')}
            className="inline-flex min-w-0 flex-[1.1] items-center justify-center rounded-full bg-primary px-3 py-3.5 text-center text-body-tight font-bold text-white transition-colors hover:bg-primary-light md:px-4 md:text-heading-s-tight disabled:opacity-50"
          >
            Save & Send
          </button>
        </div>
      </div>
    </div>
  )
}
