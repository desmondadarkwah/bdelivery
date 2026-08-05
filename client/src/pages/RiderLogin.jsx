import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRiderAuth } from '../context/RiderAuthContext'
import { loginRider } from '../utils/api'

export default function RiderLogin() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { login } = useRiderAuth()
  const navigate  = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const data = await loginRider({ email, password })
      if (data.success) { login(data.token, data.rider); navigate('/rider') }
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
        .rl-root { min-height: 100vh; background: #0b0f1a; display: flex; align-items: center; justify-content: center; padding: 40px 24px; font-family: 'Inter', sans-serif; }
        .rl-card { width: 100%; max-width: 400px; }
        .rl-logo { display: flex; align-items: center; gap: 10px; justify-content: center; margin-bottom: 36px; text-decoration: none; }
        .rl-logo-icon { width: 40px; height: 40px; background: #f97316; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .rl-logo-text { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; color: #fff; }
        .rl-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: #fff; text-align: center; margin-bottom: 8px; }
        .rl-sub { font-size: 13px; color: rgba(240,244,255,0.4); text-align: center; margin-bottom: 32px; }
        .rl-field { margin-bottom: 16px; }
        .rl-label { display: block; font-size: 12px; font-weight: 500; color: rgba(240,244,255,0.45); margin-bottom: 8px; }
        .rl-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); border-radius: 10px; padding: 13px 16px; font-size: 14px; color: #fff; outline: none; transition: border-color 0.2s; font-family: 'Inter', sans-serif; }
        .rl-input:focus { border-color: #f97316; }
        .rl-input::placeholder { color: rgba(240,244,255,0.2); }
        .rl-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); border-radius: 10px; padding: 12px 16px; font-size: 13px; color: #fca5a5; margin-bottom: 16px; }
        .rl-btn { width: 100%; padding: 14px; background: #f97316; color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; margin-top: 8px; }
        .rl-btn:hover:not(:disabled) { opacity: 0.88; }
        .rl-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .rl-back { display: block; text-align: center; margin-top: 20px; font-size: 13px; color: rgba(240,244,255,0.25); text-decoration: none; }
        .rl-back:hover { color: #f97316; }
        .rl-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.25); border-radius: 100px; padding: 5px 14px; margin: 0 auto 24px; font-size: 12px; color: #f97316; font-weight: 500; }
        .rl-badge-wrap { text-align: center; }
      `}</style>

      <div className="rl-root">
        <div className="rl-card">
          <a href="/" className="rl-logo">
            <div className="rl-logo-icon">🏍️</div>
            <div className="rl-logo-text">SwiftByGwyn</div>
          </a>
          <div className="rl-badge-wrap">
            <div className="rl-badge">🏍️ Rider Portal</div>
          </div>
          <div className="rl-title">Rider Login</div>
          <div className="rl-sub">Sign in to view your assigned deliveries</div>
          <form onSubmit={handleSubmit}>
            <div className="rl-field">
              <label className="rl-label">Email Address</label>
              <input className="rl-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your@email.com" />
            </div>
            <div className="rl-field">
              <label className="rl-label">Password</label>
              <input className="rl-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>
            {error && <div className="rl-error">✕ {error}</div>}
            <button className="rl-btn" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
          <a href="/" className="rl-back">← Back to Website</a>
        </div>
      </div>
    </>
  )
}