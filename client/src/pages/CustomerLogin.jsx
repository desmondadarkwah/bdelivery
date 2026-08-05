import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import { loginCustomer } from '../utils/api'

export default function CustomerLogin() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { login } = useCustomerAuth()
  const navigate  = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const data = await loginCustomer({ email, password })
      if (data.success) { login(data.token, data.customer); navigate('/account') }
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
        .cl-root { min-height: 100vh; background: #0b0f1a; display: flex; align-items: center; justify-content: center; padding: 40px 24px; font-family: 'Inter', sans-serif; }
        .cl-card { width: 100%; max-width: 420px; }
        .cl-logo { display: flex; align-items: center; gap: 10px; justify-content: center; margin-bottom: 36px; text-decoration: none; }
        .cl-logo-icon { width: 40px; height: 40px; background: #f97316; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .cl-logo-text { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; color: #fff; }
        .cl-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: #fff; text-align: center; margin-bottom: 8px; }
        .cl-sub { font-size: 13px; color: rgba(240,244,255,0.4); text-align: center; margin-bottom: 32px; }
        .cl-field { margin-bottom: 16px; }
        .cl-label { display: block; font-size: 12px; font-weight: 500; color: rgba(240,244,255,0.45); margin-bottom: 8px; }
        .cl-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); border-radius: 10px; padding: 13px 16px; font-size: 14px; color: #fff; outline: none; transition: border-color 0.2s; font-family: 'Inter', sans-serif; }
        .cl-input:focus { border-color: #f97316; }
        .cl-input::placeholder { color: rgba(240,244,255,0.2); }
        .cl-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); border-radius: 10px; padding: 12px 16px; font-size: 13px; color: #fca5a5; margin-bottom: 16px; }
        .cl-btn { width: 100%; padding: 14px; background: #f97316; color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; margin-top: 8px; }
        .cl-btn:hover:not(:disabled) { opacity: 0.88; }
        .cl-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .cl-divider { width: 100%; height: 1px; background: rgba(255,255,255,0.07); margin: 24px 0; }
        .cl-foot { text-align: center; font-size: 13px; color: rgba(240,244,255,0.3); }
        .cl-foot a { color: #f97316; text-decoration: none; }
        .cl-back { display: block; text-align: center; margin-top: 16px; font-size: 13px; color: rgba(240,244,255,0.2); text-decoration: none; }
        .cl-back:hover { color: #f97316; }
      `}</style>

      <div className="cl-root">
        <div className="cl-card">
          <a href="/" className="cl-logo">
            <div className="cl-logo-icon">🚀</div>
            <div className="cl-logo-text">SwiftByGwyn</div>
          </a>
          <div className="cl-title">Welcome Back</div>
          <div className="cl-sub">Sign in to track your orders and manage your account</div>
          <form onSubmit={handleSubmit}>
            <div className="cl-field">
              <label className="cl-label">Email Address</label>
              <input className="cl-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@email.com" />
            </div>
            <div className="cl-field">
              <label className="cl-label">Password</label>
              <div style={{ position:'relative' }}>
                <input className="cl-input" type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={{ paddingRight:48 }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(240,244,255,0.35)', fontSize:16, padding:0 }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            {error && <div className="cl-error">✕ {error}</div>}
            <button className="cl-btn" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
          <div className="cl-divider" />
          <div className="cl-foot">Don't have an account? <Link to="/register">Create one free</Link></div>
          <a href="/" className="cl-back">← Back to Home</a>
        </div>
      </div>
    </>
  )
}