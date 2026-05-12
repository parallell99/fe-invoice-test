export function formatGbp(amount: number): string {
  if (!Number.isFinite(amount)) return '£ 0.00'
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
