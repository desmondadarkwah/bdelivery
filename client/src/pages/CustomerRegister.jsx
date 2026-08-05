import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import { registerCustomer } from '../utils/api'

export default function CustomerRegister() {
  const [form, setForm]     = useState({ name:'', email:'', phone:'', password:'', confirm:'' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useCustomerAuth()
  const navigate  = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    try {
      const data = await registerCustomer({ name: form.name, email: form.email, phone: form.phone, password: form.password })
      if (data.success) { login(data.token, data.customer); navigate('/account') }
      else setError(data.error || 'Registration failed.')
    } catch (err) {
      setError(err.response?.data?.error || 'Server error. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .cr-root { min-height: 100vh; background: #0b0f1a; display: flex; align-items: center; justify-content: center; padding: 40px 24px; font-family: 'Inter', sans-serif; }
        .cr-card { width: 100%; max-width: 420px; }
        .cr-logo { display: flex; align-items: center; gap: 10px; justify-content: center; margin-bottom: 36px; text-decoration: none; }
        .cr-logo-icon { width: 40px; height: 40px; background: #f97316; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .cr-logo-text { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; color: #fff; }
        .cr-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: #fff; text-align: center; margin-bottom: 8px; }
        .cr-sub { font-size: 13px; color: rgba(240,244,255,0.4); text-align: center; margin-bottom: 32px; }
        .cr-field { margin-bottom: 16px; }
        .cr-label { display: block; font-size: 12px; font-weight: 500; color: rgba(240,244,255,0.45); margin-bottom: 8px; }
        .cr-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); border-radius: 10px; padding: 13px 16px; font-size: 14px; color: #fff; outline: none; transition: border-color 0.2s; font-family: 'Inter', sans-serif; }
        .cr-input:focus { border-color: #f97316; }
        .cr-input::placeholder { color: rgba(240,244,255,0.2); }
        .cr-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); border-radius: 10px; padding: 12px 16px; font-size: 13px; color: #fca5a5; margin-bottom: 16px; }
        .cr-btn { width: 100%; padding: 14px; background: #f97316; color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; margin-top: 8px; }
        .cr-btn:hover:not(:disabled) { opacity: 0.88; }
        .cr-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .cr-divider { width: 100%; height: 1px; background: rgba(255,255,255,0.07); margin: 24px 0; }
        .cr-foot { text-align: center; font-size: 13px; color: rgba(240,244,255,0.3); }
        .cr-foot a { color: #f97316; text-decoration: none; }
        .cr-back { display: block; text-align: center; margin-top: 16px; font-size: 13px; color: rgba(240,244,255,0.2); text-decoration: none; }
        .cr-back:hover { color: #f97316; }
      `}</style>

      <div className="cr-root">
        <div className="cr-card">
          <a href="/" className="cr-logo">
            <div className="cr-logo-icon">🚀</div>
            <div className="cr-logo-text">SwiftByGwyn</div>
          </a>
          <div className="cr-title">Create Account</div>
          <div className="cr-sub">Join SwiftByGwyn to track orders and manage deliveries</div>
          <form onSubmit={handleSubmit}>
            <div className="cr-field">
              <label className="cr-label">Full Name</label>
              <input className="cr-input" value={form.name} onChange={e => setForm({...form,name:e.target.value})} required placeholder="Your full name" />
            </div>
            <div className="cr-field">
              <label className="cr-label">Email Address</label>
              <input className="cr-input" type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} required placeholder="you@email.com" />
            </div>
            <div className="cr-field">
              <label className="cr-label">Phone Number</label>
              <input className="cr-input" type="tel" value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} placeholder="0244000000" />
            </div>
            <div className="cr-field">
              <label className="cr-label">Password</label>
              <input className="cr-input" type="password" value={form.password} onChange={e => setForm({...form,password:e.target.value})} required placeholder="Minimum 6 characters" minLength={6} />
            </div>
            <div className="cr-field">
              <label className="cr-label">Confirm Password</label>
              <input className="cr-input" type="password" value={form.confirm} onChange={e => setForm({...form,confirm:e.target.value})} required placeholder="Repeat your password" />
            </div>
            {error && <div className="cr-error">✕ {error}</div>}
            <button className="cr-btn" type="submit" disabled={loading}>
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>
          <div className="cr-divider" />
          <div className="cr-foot">Already have an account? <Link to="/login">Sign in</Link></div>
          <a href="/" className="cr-back">← Back to Home</a>
        </div>
      </div>
    </>
  )
}