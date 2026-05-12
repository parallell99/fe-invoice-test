/**
 * ค่าว่าง = same-origin (แนะนำ dev: Vite proxy `/api` → BE)
 * production แยกโดเมน API: ตั้ง VITE_API_URL=https://api.example.com
 */
const raw = import.meta.env.VITE_API_URL
export const API_BASE =
  raw != null && String(raw).trim() !== ''
    ? String(raw).replace(/\/$/, '')
    : ''
