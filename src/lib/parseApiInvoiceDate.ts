import { isValid, parseISO } from 'date-fns'

/**
 * แปลง invoice_date จาก API (YYYY-MM-DD หรือ ISO datetime) เป็น Date local เที่ยงวัน
 * ไม่ใช้ `new Date(iso + 'T12:00:00')` กับ ISO เต็ม — จะได้สตริงเพี้ยนและ Invalid Date
 */
export function parseApiInvoiceDate(
  value: string | null | undefined,
): Date | null {
  if (value == null || String(value).trim() === '') return null
  const s = String(value).trim()

  const ymdOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  if (ymdOnly) {
    const y = Number(ymdOnly[1])
    const m = Number(ymdOnly[2]) - 1
    const day = Number(ymdOnly[3])
    const dt = new Date(y, m, day, 12, 0, 0, 0)
    return Number.isNaN(dt.getTime()) ? null : dt
  }

  const parsed = parseISO(s)
  if (!isValid(parsed)) return null
  return new Date(
    parsed.getFullYear(),
    parsed.getMonth(),
    parsed.getDate(),
    12,
    0,
    0,
    0,
  )
}
