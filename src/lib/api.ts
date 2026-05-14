import { API_BASE } from './config'

const jsonHeaders = { 'Content-Type': 'application/json' }

function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`
  return fetch(url, { ...init, credentials: 'include' })
}

export type AuthUser = {
  id: string
  user_name: string
  created_at: string
}

export type PaymentTerm = 'net7' | 'net14' | 'net30' | 'net60'
export type InvoiceStatus = 'draft' | 'pending' | 'paid'

export type InvoiceListRow = {
  id: string
  invoice_number: string
  status: InvoiceStatus
  invoice_date: string
  payment_term: PaymentTerm
  project_description: string | null
  created_at: string
  updated_at: string
  bill_from_city: string
  client_name: string
  /** ยอดรวมจากรายการ (string จาก DB numeric) */
  total: string
}

export type BillFromJson = {
  id: string
  street_address: string
  city: string
  post_code: string
  country: string
}

export type BillToJson = {
  id: string
  client_name: string
  client_email: string
  street_address: string
  city: string
  post_code: string
  country: string
}

export type LineItemJson = {
  id: string
  sort_order: number
  item_name: string
  quantity: string
  unit_price: string
  line_total: string
}

export type InvoiceDetail = {
  id: string
  invoice_number: string
  bill_from_id: string
  bill_to_id: string
  status: InvoiceStatus
  project_description: string | null
  invoice_date: string
  payment_term: PaymentTerm
  created_by: string | null
  created_at: string
  updated_at: string
  bill_from: BillFromJson
  bill_to: BillToJson
  line_items: LineItemJson[]
}

export type CreateInvoiceBody = {
  invoice_number: string
  status: InvoiceStatus
  project_description?: string | null
  invoice_date: string
  payment_term: PaymentTerm
  bill_from: Omit<BillFromJson, 'id'>
  bill_to: Omit<BillToJson, 'id'>
  line_items: {
    sort_order?: number
    item_name: string
    quantity: number
    unit_price: number
  }[]
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text()
  if (!text) return {} as T
  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error('Invalid JSON from server')
  }
}

export async function fetchSessionUser(): Promise<AuthUser | null> {
  try {
    const res = await apiFetch('/api/auth/me')
    /** BE รุ่นเก่าที่ยังคืน 401 เมื่อยังไม่ล็อกอิน */
    if (res.status === 401) return null
    /** proxy ไม่ต่อถึง BE (502) หรือ error อื่น */
    if (!res.ok) {
      if (import.meta.env.DEV && (res.status === 502 || res.status === 503)) {
        console.warn(
          '[auth] /api/auth/me: proxy ต่อ API ไม่ได้ (มักเพราะยังไม่รัน BE) — ในโฟลเดอร์ BE รัน npm run dev (พอร์ต 4000)',
        )
      }
      return null
    }
    const data = await parseJson<{ user?: AuthUser | null; error?: string }>(res)
    return data.user ?? null
  } catch {
    return null
  }
}

export async function loginRequest(
  user_name: string,
  password: string,
): Promise<{ user: AuthUser }> {
  const res = await apiFetch('/api/auth/login', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ user_name, password }),
  })
  const text = await res.text()
  if (!res.ok) {
    let errFromBody: string | undefined
    try {
      errFromBody = (JSON.parse(text) as { error?: string }).error
    } catch {
      /* ignore */
    }
    if (res.status === 502 || res.status === 503) {
      throw new Error(
        errFromBody ??
          'ต่อ API ไม่ได้ (502) — รัน backend ก่อน: จากรากโปรเจกต์ `npm install` แล้ว `npm run dev` หรือในโฟลเดอร์ BE `npm run dev` (พอร์ต 4000)',
      )
    }
    throw new Error(errFromBody ?? `Login failed (${res.status})`)
  }
  let data: { user?: AuthUser; error?: string }
  try {
    data = JSON.parse(text) as { user?: AuthUser; error?: string }
  } catch {
    throw new Error('Invalid JSON from server')
  }
  if (!data.user) throw new Error('No user in response')
  return { user: data.user }
}

export async function registerRequest(
  user_name: string,
  password: string,
): Promise<{ user: AuthUser }> {
  const res = await apiFetch('/api/auth/register', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ user_name, password }),
  })
  const text = await res.text()
  if (!res.ok) {
    let errFromBody: string | undefined
    try {
      errFromBody = (JSON.parse(text) as { error?: string }).error
    } catch {
      /* ignore */
    }
    if (res.status === 502 || res.status === 503) {
      throw new Error(
        errFromBody ??
          'ต่อ API ไม่ได้ (502) — รัน backend ก่อน: จากรากโปรเจกต์ `npm install` แล้ว `npm run dev` หรือในโฟลเดอร์ BE `npm run dev` (พอร์ต 4000)',
      )
    }
    throw new Error(errFromBody ?? `Register failed (${res.status})`)
  }
  let data: { user?: AuthUser; error?: string }
  try {
    data = JSON.parse(text) as { user?: AuthUser; error?: string }
  } catch {
    throw new Error('Invalid JSON from server')
  }
  if (!data.user) throw new Error('No user in response')
  return { user: data.user }
}

export async function logoutRequest(): Promise<void> {
  await apiFetch('/api/auth/logout', { method: 'POST' })
}

export type PatchProfileBody = {
  user_name?: string
  current_password?: string
  new_password?: string
}

export async function patchAuthProfile(
  body: PatchProfileBody,
): Promise<{ user: AuthUser }> {
  const res = await apiFetch('/api/auth/me', {
    method: 'PATCH',
    headers: jsonHeaders,
    body: JSON.stringify(body),
  })
  const text = await res.text()
  if (!res.ok) {
    let errFromBody: string | undefined
    try {
      errFromBody = (JSON.parse(text) as { error?: string }).error
    } catch {
      /* ignore */
    }
    if (res.status === 502 || res.status === 503) {
      throw new Error(
        errFromBody ??
          'ต่อ API ไม่ได้ — รัน backend ที่พอร์ต 4000 ก่อน',
      )
    }
    throw new Error(errFromBody ?? `Update failed (${res.status})`)
  }
  let data: { user?: AuthUser; error?: string }
  try {
    data = JSON.parse(text) as { user?: AuthUser; error?: string }
  } catch {
    throw new Error('Invalid JSON from server')
  }
  if (!data.user) throw new Error('No user in response')
  return { user: data.user }
}

export async function fetchInvoicesList(): Promise<InvoiceListRow[]> {
  const res = await apiFetch('/api/invoices')
  const data = await parseJson<{ invoices?: InvoiceListRow[]; error?: string }>(
    res,
  )
  if (!res.ok) {
    throw new Error(data.error ?? `List failed (${res.status})`)
  }
  return data.invoices ?? []
}

export async function fetchInvoiceDetail(
  id: string,
): Promise<InvoiceDetail | null> {
  const res = await apiFetch(`/api/invoices/${id}`)
  const data = await parseJson<{ invoice?: InvoiceDetail; error?: string }>(
    res,
  )
  if (res.status === 404) return null
  if (!res.ok) {
    throw new Error(data.error ?? `Load failed (${res.status})`)
  }
  return data.invoice ?? null
}

export async function createInvoice(
  body: CreateInvoiceBody,
): Promise<{ id: string }> {
  const res = await apiFetch('/api/invoices', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(body),
  })
  const data = await parseJson<{ id?: string; error?: string; fields?: string[] }>(
    res,
  )
  if (!res.ok) {
    const msg =
      data.fields?.length ? data.fields.join(', ') : data.error
    throw new Error(msg ?? `Create failed (${res.status})`)
  }
  if (!data.id) throw new Error('No id in response')
  return { id: data.id }
}

export async function patchInvoice(
  id: string,
  body: Record<string, unknown>,
): Promise<void> {
  const res = await apiFetch(`/api/invoices/${id}`, {
    method: 'PATCH',
    headers: jsonHeaders,
    body: JSON.stringify(body),
  })
  const data = await parseJson<{ error?: string }>(res)
  if (!res.ok) {
    throw new Error(data.error ?? `Update failed (${res.status})`)
  }
}

export async function deleteInvoice(id: string): Promise<void> {
  const res = await apiFetch(`/api/invoices/${id}`, {
    method: 'DELETE',
  })
  if (res.status === 204) return
  const data = await parseJson<{ error?: string }>(res)
  throw new Error(data.error ?? `Delete failed (${res.status})`)
}
