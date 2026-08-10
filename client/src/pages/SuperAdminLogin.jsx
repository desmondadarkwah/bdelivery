import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSuperAdmin } from '../context/SuperAdminContext'
import { loginSuperAdmin } from '../utils/api'

export default function SuperAdminLogin() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { login } = useSuperAdmin()
  const navigate  = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const data = await loginSuperAdmin({ email, password })
      if (data.success) { login(data.token, data.admin); navigate('/super') }
      else setError(data.error || 'Login failed.')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials.')
    } finally { setLoading(false) }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .sl-root { min-height: 100vh; background: #060810; display: flex; align-items: center; justify-content: center; padding: 40px 24px; font-family: 'Inter', sans-serif; }
        .sl-card { width: 100%; max-width: 400px; }
        .sl-logo { display: flex; align-items: center; gap: 10px; justify-content: center; margin-bottom: 36px; }
        .sl-logo-icon { width: 44px; height: 44px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .sl-logo-text { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; color: #fff; }
        .sl-logo-sub { font-size: 11px; color: rgba(255,255,255,0.3); text-align: center; margin-top: -28px; margin-bottom: 32px; letter-spacing: 0.1em; text-transform: uppercase; }
        .sl-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3); border-radius: 100px; padding: 5px 14px; margin: 0 auto 24px; font-size: 11px; color: #a5b4fc; font-weight: 600; letter-spacing: 0.04em; }
        .sl-badge-wrap { text-align: center; }
        .sl-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 26px; color: #fff; text-align: center; margin-bottom: 6px; }
        .sl-sub { font-size: 13px; color: rgba(255,255,255,0.35); text-align: center; margin-bottom: 32px; }
        .sl-field { margin-bottom: 16px; }
        .sl-label { display: block; font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.4); margin-bottom: 8px; }
        .sl-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); border-radius: 10px; padding: 13px 16px; font-size: 14px; color: #fff; outline: none; transition: border-color 0.2s; font-family: 'Inter', sans-serif; }
        .sl-input:focus { border-color: #6366f1; }
        .sl-input::placeholder { color: rgba(255,255,255,0.2); }
        .sl-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); border-radius: 10px; padding: 12px 16px; font-size: 13px; color: #fca5a5; margin-bottom: 16px; }
        .sl-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; margin-top: 8px; }
        .sl-btn:hover:not(:disabled) { opacity: 0.88; }
        .sl-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .sl-warning { display: flex; align-items: flex-start; gap: 8px; background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2); border-radius: 10px; padding: 12px 14px; margin-top: 20px; font-size: 12px; color: rgba(245,158,11,0.8); line-height: 1.6; }
      `}</style>

      <div className="sl-root">
        <div className="sl-card">
          <div className="sl-logo">
            <div className="sl-logo-icon">⚡</div>
            <div className="sl-logo-text">Bdelivery</div>
          </div>
          <div className="sl-badge-wrap">
            <div className="sl-badge">🔐 Super Admin Portal</div>
          </div>
          <div className="sl-title">Platform Control</div>
          <div className="sl-sub">Sign in to manage all tenants and platform settings</div>
          <form onSubmit={handleSubmit}>
            <div className="sl-field">
              <label className="sl-label">Email Address</label>
              <input className="sl-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="super@bdelivery.com" />
            </div>
            <div className="sl-field">
              <label className="sl-label">Password</label>
              <input className="sl-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>
            {error && <div className="sl-error">✕ {error}</div>}
            <button className="sl-btn" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In to Platform'}
            </button>
          </form>
          <div className="sl-warning">
            ⚠️ This portal is for Bdelivery platform administrators only. Unauthorized access is prohibited.
          </div>
        </div>
      </div>
    </>
  )
}