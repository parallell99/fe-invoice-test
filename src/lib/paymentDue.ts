import type { PaymentTerm } from './api'
import { parseApiInvoiceDate } from './parseApiInvoiceDate'

const NET_DAYS: Record<PaymentTerm, number> = {
  net7: 7,
  net14: 14,
  net30: 30,
  net60: 60,
}

/** `invoiceDate` เป็น string จาก API (YYYY-MM-DD หรือ ISO) */
export function paymentDueDate(invoiceDate: string, term: PaymentTerm): Date {
  const base = parseApiInvoiceDate(invoiceDate) ?? new Date()
  const d = new Date(base)
  d.setDate(d.getDate() + NET_DAYS[term])
  return d
}
