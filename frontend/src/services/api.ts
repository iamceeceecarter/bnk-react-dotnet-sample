export type Account = {
  id: string
  name: string
  type: string
  balance: number
}

export type TransferRequest = {
  fromAccountId: string
  toAccountId: string
  amount: number
  memo?: string
}

export type TransferResponse = {
  confirmationId: string
  status: string
}

function apiBase(): string {
  // For production you can set VITE_API_BASE_URL to your deployed API (e.g., Azure Web App)
  // For local dev, Vite proxy handles /api and /health
  return import.meta.env.VITE_API_BASE_URL || ''
}

async function http<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw Object.assign(new Error(body.message || `Request failed: ${res.status}`), {
      status: res.status,
      errorCode: body.errorCode,
      details: body,
    })
  }

  return res.json()
}

export const api = {
  getAccounts: () => http<Account[]>('/api/accounts'),
  createTransfer: (req: TransferRequest) =>
    http<TransferResponse>('/api/transfers', {
      method: 'POST',
      body: JSON.stringify(req),
    }),
  health: () => http<{ status: string }>('/health'),
}
