import { Link, Route, Routes } from 'react-router-dom'
import AccountsPage from './pages/AccountsPage'
import TransferPage from './pages/TransferPage'

export default function App() {
  return (
    <div className="container">
      <header className="header">
        <h1>Bnk Sample: React + .NET</h1>
        <nav className="nav">
          <Link to="/">Accounts</Link>
          <Link to="/transfer">Transfer</Link>
        </nav>
      </header>

      <main className="main">
        <Routes>
          <Route path="/" element={<AccountsPage />} />
          <Route path="/transfer" element={<TransferPage />} />
        </Routes>
      </main>

      <footer className="footer">
        <small>Demo only. Business rules are enforced server-side.</small>
      </footer>
    </div>
  )
}
