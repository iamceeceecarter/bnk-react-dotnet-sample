import { useEffect, useMemo, useState } from 'react'
import { api, type Account } from '../services/api'

export default function TransferPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [fromId, setFromId] = useState('')
  const [toId, setToId] = useState('')
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  useEffect(() => {
    api.getAccounts()
      .then(data => {
        setAccounts(data)
        setFromId(data[0]?.id ?? '')
        setToId(data[1]?.id ?? '')
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const canSubmit = useMemo(() => {
    const a = Number(amount)
    return fromId && toId && fromId !== toId && a > 0
  }, [fromId, toId, amount])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)
    setSubmitting(true)

    try {
      const res = await api.createTransfer({
        fromAccountId: fromId,
        toAccountId: toId,
        amount: Number(amount),
        memo: memo || undefined,
      })
      setResult(`Transfer ${res.status}. Confirmation: ${res.confirmationId}`)
      setAmount('')
      setMemo('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="card">Loading…</div>

  return (
    <div className="card">
      <h2>Transfer</h2>
      <p className="hint">Demo transfer (server enforces validation and balances).</p>

      {error && <div className="error">{error}</div>}
      {result && <div className="success">{result}</div>}

      <form onSubmit={onSubmit} className="form">
        <label>
          From
          <select value={fromId} onChange={e => setFromId(e.target.value)}>
            {accounts.map(a => (
              <option key={a.id} value={a.id}>{a.name} ({a.id})</option>
            ))}
          </select>
        </label>

        <label>
          To
          <select value={toId} onChange={e => setToId(e.target.value)}>
            {accounts.map(a => (
              <option key={a.id} value={a.id}>{a.name} ({a.id})</option>
            ))}
          </select>
        </label>

        <label>
          Amount
          <input
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
        </label>

        <label>
          Memo (optional)
          <input value={memo} onChange={e => setMemo(e.target.value)} />
        </label>

        <button type="submit" disabled={!canSubmit || submitting}>
          {submitting ? 'Submitting…' : 'Submit Transfer'}
        </button>
      </form>
    </div>
  )
}
