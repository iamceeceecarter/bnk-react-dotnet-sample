import { useEffect, useState } from 'react'
import { api, type Account } from '../services/api'

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    api.getAccounts()
      .then(data => {
        if (active) setAccounts(data)
      })
      .catch(err => {
        if (active) setError(err.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  if (loading) return <div className="card">Loading accounts…</div>
  if (error) return <div className="card error">Error: {error}</div>

  return (
    <div className="card">
      <h2>Accounts</h2>
      <ul className="list">
        {accounts.map(a => (
          <li key={a.id} className="row">
            <div>
              <div className="name">{a.name}</div>
              <div className="meta">{a.type} • {a.id}</div>
            </div>
            <div className={a.balance < 0 ? 'balance negative' : 'balance'}>
              {a.balance.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
