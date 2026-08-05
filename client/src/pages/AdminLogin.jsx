import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'
import { loginAdmin } from '../utils/api'

export default function AdminLogin() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { login } = useAdminAuth()
  const navigate  = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const data = await loginAdmin({ email, password })
      if (data.success) { login(data.token); navigate('/admin') }
      else setError(data.error || 'Login failed.')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password.')
    } finally { setLoading(false) }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .al-root { min-height: 100vh; background: #0b0f1a; display: flex; align-items: center; justify-content: center; padding: 40px 24px; font-family: 'Inter', sans-serif; }
        .al-card { width: 100%; max-width: 400px; }
        .al-logo { display: flex; align-items: center; gap: 10px; justify-content: center; margin-bottom: 36px; text-decoration: none; }
        .al-logo-icon { width: 40px; height: 40px; background: #f97316; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .al-logo-text { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; color: #fff; }
        .al-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: #fff; text-align: center; margin-bottom: 8px; }
        .al-sub { font-size: 13px; color: rgba(240,244,255,0.4); text-align: center; margin-bottom: 32px; }
        .al-field { margin-bottom: 16px; }
        .al-label { display: block; font-size: 12px; font-weight: 500; color: rgba(240,244,255,0.45); margin-bottom: 8px; }
        .al-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); border-radius: 10px; padding: 13px 16px; font-size: 14px; color: #fff; outline: none; transition: border-color 0.2s; font-family: 'Inter', sans-serif; }
        .al-input:focus { border-color: #f97316; }
        .al-input::placeholder { color: rgba(240,244,255,0.2); }
        .al-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); border-radius: 10px; padding: 12px 16px; font-size: 13px; color: #fca5a5; margin-bottom: 16px; }
        .al-btn { width: 100%; padding: 14px; background: #f97316; color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; margin-top: 8px; }
        .al-btn:hover:not(:disabled) { opacity: 0.88; }
        .al-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .al-back { display: block; text-align: center; margin-top: 20px; font-size: 13px; color: rgba(240,244,255,0.25); text-decoration: none; }
        .al-back:hover { color: #f97316; }
      `}</style>

      <div className="al-root">
        <div className="al-card">
          <a href="/" className="al-logo">
            <div className="al-logo-icon">🚀</div>
            <div className="al-logo-text">SwiftByGwyn</div>
          </a>
          <div className="al-title">Admin Login</div>
          <div className="al-sub">Sign in to access the dashboard</div>
          <form onSubmit={handleSubmit}>
            <div className="al-field">
              <label className="al-label">Email Address</label>
              <input className="al-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@swiftbygwyn.com" />
            </div>
            <div className="al-field">
              <label className="al-label">Password</label>
              <input className="al-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>
            {error && <div className="al-error">✕ {error}</div>}
            <button className="al-btn" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
          <a href="/" className="al-back">← Back to Website</a>
        </div>
      </div>
    </>
  )
}