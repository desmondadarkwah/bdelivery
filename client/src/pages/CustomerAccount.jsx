import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import { useTenant } from '../context/TenantContext'
import { fetchCustomerOrders, updateCustomerProfile, changeCustomerPassword } from '../utils/api'

const STATUS_LABELS = {
  received: 'Order Received', assigned: 'Rider Assigned',
  accepted: 'Accepted', 'picked-up': 'Picked Up',
  'in-transit': 'In Transit', delivered: 'Delivered', cancelled: 'Cancelled',
}

const STATUS_COLORS = {
  received:    { bg:'rgba(99,102,241,0.15)',  color:'#a5b4fc' },
  assigned:    { bg:'rgba(249,115,22,0.15)',  color:'#fdba74' },
  accepted:    { bg:'rgba(168,85,247,0.15)',  color:'#d8b4fe' },
  'picked-up': { bg:'rgba(234,179,8,0.15)',   color:'#fde047' },
  'in-transit':{ bg:'rgba(59,130,246,0.15)',  color:'#93c5fd' },
  delivered:   { bg:'rgba(34,197,94,0.15)',   color:'#86efac' },
  cancelled:   { bg:'rgba(239,68,68,0.15)',   color:'#fca5a5' },
}

export default function CustomerAccount() {
  const { customer, logout, updateCustomer, loading } = useCustomerAuth()
  const { tenant } = useTenant()
  const navigate = useNavigate()

  const bizName    = tenant?.businessName || 'Bdelivery'
  const brandColor = tenant?.brandColor   || '#f97316'
  const logo       = tenant?.logo         || null

  const [activeTab, setActiveTab]       = useState('orders')
  const [orders, setOrders]             = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [profileForm, setProfileForm]   = useState({ name:'', phone:'' })
  const [profileSaving, setProfileSaving]   = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError]     = useState('')
  const [pwForm, setPwForm]     = useState({ currentPassword:'', newPassword:'', confirmPassword:'' })
  const [pwSaving, setPwSaving]   = useState(false)
  const [pwSuccess, setPwSuccess] = useState(false)
  const [pwError, setPwError]     = useState('')

  useEffect(() => {
    if (loading) return
    if (!customer) { navigate('/login'); return }
    setProfileForm({ name: customer.name || '', phone: customer.phone || '' })
    fetchCustomerOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setOrdersLoading(false))
  }, [customer, loading])

  const handleLogout = () => { logout(); navigate('/') }

  const saveProfile = async () => {
    setProfileSaving(true); setProfileSuccess(false); setProfileError('')
    try {
      const updated = await updateCustomerProfile(profileForm)
      updateCustomer(updated)
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch(e) { setProfileError(e.response?.data?.error || 'Failed to save.') }
    finally { setProfileSaving(false) }
  }

  const changePassword = async () => {
    setPwError(''); setPwSuccess(false)
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) { setPwError('All fields required.'); return }
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwError('Passwords do not match.'); return }
    if (pwForm.newPassword.length < 6) { setPwError('Minimum 6 characters.'); return }
    setPwSaving(true)
    try {
      await changeCustomerPassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      setPwSuccess(true)
      setPwForm({ currentPassword:'', newPassword:'', confirmPassword:'' })
      setTimeout(() => setPwSuccess(false), 3000)
    } catch(e) { setPwError(e.response?.data?.error || 'Failed to change password.') }
    finally { setPwSaving(false) }
  }

  const activeOrders    = orders.filter(o => !['delivered','cancelled'].includes(o.status))
  const completedOrders = orders.filter(o => o.status === 'delivered')

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#0b0f1a', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(240,244,255,0.4)', fontFamily:'Inter,sans-serif', fontSize:14 }}>
      Loading...
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --brand: ${brandColor}; }
        .ca-root { min-height: 100vh; background: #0b0f1a; font-family: 'Inter', sans-serif; color: #f0f4ff; }
        .ca-nav { background: rgba(11,15,26,0.95); border-bottom: 1px solid rgba(255,255,255,0.07); padding: 0 24px; height: 62px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 50; backdrop-filter: blur(12px); }
        .ca-nav-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: #fff; text-decoration: none; display: flex; align-items: center; gap: 8px; }
        .ca-nav-logo-icon { width: 32px; height: 32px; background: var(--brand); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; }
        .ca-nav-right { display: flex; align-items: center; gap: 12px; }
        .ca-nav-user { font-size: 13px; color: rgba(240,244,255,0.5); }
        .ca-nav-book { padding: 7px 16px; background: var(--brand); color: #fff; border-radius: 8px; font-size: 12px; font-weight: 600; text-decoration: none; transition: opacity 0.2s; }
        .ca-nav-book:hover { opacity: 0.88; }
        .ca-nav-logout { padding: 7px 14px; background: transparent; color: rgba(240,244,255,0.3); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; font-size: 12px; cursor: pointer; transition: all 0.2s; }
        .ca-nav-logout:hover { border-color: var(--brand); color: var(--brand); }
        .ca-main { max-width: 700px; margin: 0 auto; padding: 32px 20px 80px; }
        .ca-header { margin-bottom: 28px; }
        .ca-welcome { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 24px; color: #fff; margin-bottom: 4px; }
        .ca-welcome-sub { font-size: 13px; color: rgba(240,244,255,0.4); }
        .ca-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 24px; }
        .ca-stat { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 16px; text-align: center; }
        .ca-stat-num { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 24px; color: var(--brand); margin-bottom: 4px; }
        .ca-stat-label { font-size: 10px; color: rgba(240,244,255,0.3); text-transform: uppercase; letter-spacing: 0.04em; }
        .ca-tabs { display: flex; gap: 8px; margin-bottom: 20px; }
        .ca-tab { padding: 8px 18px; border-radius: 100px; font-size: 13px; font-weight: 500; cursor: pointer; border: 1px solid rgba(255,255,255,0.08); background: transparent; color: rgba(240,244,255,0.4); transition: all 0.2s; }
        .ca-tab.active { background: var(--brand); color: #fff; border-color: var(--brand); }
        .ca-order-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 18px; margin-bottom: 10px; transition: all 0.2s; }
        .ca-order-card:hover { border-color: rgba(249,115,22,0.3); }
        .ca-order-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 10px; gap: 10px; }
        .ca-order-id { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: var(--brand); }
        .ca-order-date { font-size: 11px; color: rgba(240,244,255,0.3); margin-top: 3px; }
        .ca-status-badge { padding: 4px 12px; border-radius: 100px; font-size: 11px; font-weight: 600; white-space: nowrap; }
        .ca-route { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
        .ca-route-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: rgba(240,244,255,0.6); }
        .ca-route-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .ca-order-footer { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
        .ca-order-meta { font-size: 12px; color: rgba(240,244,255,0.35); }
        .ca-track-btn { padding: 6px 14px; background: rgba(249,115,22,0.15); border: 1px solid rgba(249,115,22,0.3); border-radius: 8px; color: var(--brand); font-size: 12px; font-weight: 600; text-decoration: none; transition: all 0.2s; }
        .ca-track-btn:hover { background: var(--brand); color: #fff; }
        .ca-empty { padding: 48px 0; text-align: center; color: rgba(240,244,255,0.25); }
        .ca-empty-icon { font-size: 40px; margin-bottom: 12px; }
        .ca-empty-text { font-size: 14px; margin-bottom: 20px; }
        .ca-empty-btn { padding: 12px 28px; background: var(--brand); color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; }
        .ca-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px; margin-bottom: 16px; }
        .ca-card-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #fff; margin-bottom: 20px; }
        .ca-field { margin-bottom: 16px; }
        .ca-label { display: block; font-size: 12px; font-weight: 500; color: rgba(240,244,255,0.4); margin-bottom: 7px; }
        .ca-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); border-radius: 10px; padding: 12px 14px; font-size: 14px; color: #fff; outline: none; font-family: 'Inter', sans-serif; transition: border-color 0.2s; }
        .ca-input:focus { border-color: var(--brand); }
        .ca-input::placeholder { color: rgba(240,244,255,0.2); }
        .ca-input:disabled { opacity: 0.5; cursor: not-allowed; }
        .ca-save-btn { padding: 12px 28px; background: var(--brand); color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
        .ca-save-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .ca-success { padding: 10px 14px; background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.25); border-radius: 8px; color: #86efac; font-size: 13px; margin-bottom: 14px; }
        .ca-error { padding: 10px 14px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); border-radius: 8px; color: #fca5a5; font-size: 13px; margin-bottom: 14px; }
      `}</style>

      <div className="ca-root">
        <nav className="ca-nav">
          <a href="/" className="ca-nav-logo">
            {logo
              ? <img src={logo} alt="logo" style={{ width:32, height:32, borderRadius:8, objectFit:'cover' }} />
              : <div className="ca-nav-logo-icon">🚀</div>
            }
            {bizName}
          </a>
          <div className="ca-nav-right">
            <span className="ca-nav-user">👤 {customer?.name?.split(' ')[0]}</span>
            <a href="/book" className="ca-nav-book">+ Book Delivery</a>
            <button className="ca-nav-logout" onClick={handleLogout}>Sign Out</button>
          </div>
        </nav>

        <main className="ca-main">
          <div className="ca-header">
            <div className="ca-welcome">My Account</div>
            <div className="ca-welcome-sub">{customer?.email}</div>
          </div>

          <div className="ca-stats">
            <div className="ca-stat"><div className="ca-stat-num">{orders.length}</div><div className="ca-stat-label">Total Orders</div></div>
            <div className="ca-stat"><div className="ca-stat-num">{activeOrders.length}</div><div className="ca-stat-label">Active</div></div>
            <div className="ca-stat"><div className="ca-stat-num">{completedOrders.length}</div><div className="ca-stat-label">Completed</div></div>
          </div>

          <div className="ca-tabs">
            <button className={`ca-tab${activeTab === 'orders' ? ' active' : ''}`} onClick={() => setActiveTab('orders')}>My Orders</button>
            <button className={`ca-tab${activeTab === 'profile' ? ' active' : ''}`} onClick={() => setActiveTab('profile')}>Profile</button>
            <button className={`ca-tab${activeTab === 'security' ? ' active' : ''}`} onClick={() => setActiveTab('security')}>Security</button>
          </div>

          {activeTab === 'orders' && (
            ordersLoading ? (
              <div className="ca-empty"><div className="ca-empty-icon">⏳</div><div className="ca-empty-text">Loading your orders...</div></div>
            ) : orders.length === 0 ? (
              <div className="ca-empty">
                <div className="ca-empty-icon">📦</div>
                <div className="ca-empty-text">You haven't placed any orders yet.</div>
                <a href="/book" className="ca-empty-btn">📦 Book a Delivery</a>
              </div>
            ) : (
              orders.map(order => {
                const sc = STATUS_COLORS[order.status] || STATUS_COLORS.received
                const isActive = !['delivered','cancelled'].includes(order.status)
                return (
                  <div key={order._id} className="ca-order-card" style={{ borderColor: isActive ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.07)' }}>
                    <div className="ca-order-head">
                      <div>
                        <div className="ca-order-id">{order.orderID}</div>
                        <div className="ca-order-date">{new Date(order.createdAt).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
                      </div>
                      <span className="ca-status-badge" style={{ background:sc.bg, color:sc.color }}>{STATUS_LABELS[order.status]}</span>
                    </div>
                    <div className="ca-route">
                      <div className="ca-route-item"><div className="ca-route-dot" style={{ background: brandColor }} />{order.pickupLocation}</div>
                      <div className="ca-route-item"><div className="ca-route-dot" style={{ background:'#22c55e' }} />{order.dropoffLocation}</div>
                    </div>
                    <div className="ca-order-footer">
                      <div className="ca-order-meta">GHS {order.deliveryFee} · {order.paymentMethod?.replace('-',' ')}{order.assignedRider && ` · Rider: ${order.assignedRider.name}`}</div>
                      <a href={`/track/${order.orderID}`} className="ca-track-btn">🔍 Track Order</a>
                    </div>
                  </div>
                )
              })
            )
          )}

          {activeTab === 'profile' && (
            <div className="ca-card">
              <div className="ca-card-title">Personal Information</div>
              <div className="ca-field"><label className="ca-label">Full Name</label><input className="ca-input" value={profileForm.name} onChange={e => setProfileForm({...profileForm,name:e.target.value})} placeholder="Your full name" /></div>
              <div className="ca-field"><label className="ca-label">Phone Number</label><input className="ca-input" value={profileForm.phone} onChange={e => setProfileForm({...profileForm,phone:e.target.value})} placeholder="0244000000" /></div>
              <div className="ca-field"><label className="ca-label">Email Address</label><input className="ca-input" value={customer?.email || ''} disabled /></div>
              {profileError && <div className="ca-error">✕ {profileError}</div>}
              {profileSuccess && <div className="ca-success">✓ Profile updated successfully!</div>}
              <button className="ca-save-btn" onClick={saveProfile} disabled={profileSaving}>{profileSaving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="ca-card">
              <div className="ca-card-title">Change Password</div>
              <div className="ca-field"><label className="ca-label">Current Password</label><input type="password" className="ca-input" value={pwForm.currentPassword} onChange={e => setPwForm({...pwForm,currentPassword:e.target.value})} placeholder="••••••••" /></div>
              <div className="ca-field"><label className="ca-label">New Password</label><input type="password" className="ca-input" value={pwForm.newPassword} onChange={e => setPwForm({...pwForm,newPassword:e.target.value})} placeholder="Minimum 6 characters" /></div>
              <div className="ca-field"><label className="ca-label">Confirm New Password</label><input type="password" className="ca-input" value={pwForm.confirmPassword} onChange={e => setPwForm({...pwForm,confirmPassword:e.target.value})} placeholder="Repeat new password" /></div>
              {pwError && <div className="ca-error">✕ {pwError}</div>}
              {pwSuccess && <div className="ca-success">✓ Password changed successfully!</div>}
              <button className="ca-save-btn" onClick={changePassword} disabled={pwSaving}>{pwSaving ? 'Changing...' : 'Change Password'}</button>
            </div>
          )}
        </main>
      </div>
    </>
  )
}