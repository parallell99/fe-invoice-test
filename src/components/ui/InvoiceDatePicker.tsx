import { enGB } from 'date-fns/locale/en-GB'
import type { InputHTMLAttributes } from 'react'
import { forwardRef, useState } from 'react'
import DatePicker, { registerLocale } from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

registerLocale('en-GB', enGB)

function sanitizeDate(d: Date | null | undefined): Date | null {
  if (d == null) return null
  return Number.isNaN(d.getTime()) ? null : d
}

function IconCalendar({ className }: { className?: string }) {
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
        d="M12.667 2.667H3.333C2.597 2.667 2 3.263 2 4v9.333c0 .737.597 1.334 1.333 1.334h9.334c.736 0 1.333-.597 1.333-1.334V4c0-.737-.597-1.333-1.333-1.333zM10.667 1.333V4M5.333 1.333V4M2 6.667h12"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const inputClass =
  'w-full cursor-pointer rounded-lg border border-slate-light bg-white px-4 py-3 text-heading-s-tight text-ink outline-none transition-shadow placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/25 dark:border-slate-light/40 dark:bg-navy-medium'

const CustomInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function InvoiceDatePickerInput({ className, ...props }, ref) {
  return (
    <div className="relative w-full">
      <input
        ref={ref}
        {...props}
        readOnly
        className={`${inputClass} pr-11 ${className ?? ''}`}
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate">
        <IconCalendar />
      </span>
    </div>
  )
})

export type InvoiceDatePickerProps = {
  id?: string
  defaultSelected?: Date | null
  /** controlled: ส่งคู่กับ onSelectedChange */
  selected?: Date | null
  onSelectedChange?: (date: Date | null) => void
  placeholderText?: string
}

export default function InvoiceDatePicker({
  id,
  defaultSelected = null,
  selected: selectedProp,
  onSelectedChange,
  placeholderText = 'Select date',
}: InvoiceDatePickerProps) {
  const [inner, setInner] = useState<Date | null>(() =>
    sanitizeDate(defaultSelected),
  )
  const controlled = selectedProp !== undefined
  const selected = sanitizeDate(controlled ? selectedProp : inner)
  const setSelected = (date: Date | null) => {
    const next = sanitizeDate(date)
    if (!controlled) setInner(next)
    onSelectedChange?.(next)
  }

  return (
    <DatePicker
      id={id}
      selected={selected}
      onChange={(date: Date | null) => setSelected(date)}
      locale="en-GB"
      dateFormat="d MMM yyyy"
      placeholderText={placeholderText}
      customInput={<CustomInput />}
      wrapperClassName="block w-full"
      calendarStartDay={1}
      popperClassName="invoice-datepicker-popper z-[70]"
      popperPlacement="bottom-start"
      showPopperArrow={false}
    />
  )
}
