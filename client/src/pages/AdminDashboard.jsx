import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'
import { useTenant } from '../context/TenantContext'
import {
  getStats, getAllOrders, getAllRiders,
  createRider, updateRiderStatus, deleteRider,
  assignRider, updateOrderStatus,
  fetchSettings, updateSettings, updateTenantMe, changeAdminPassword,
  fetchAllCustomers, deleteCustomer, fetchTenantPlanInfo,
  markPaymentCollected,
} from '../utils/api'
import { useSocket } from '../context/SocketContext'
import NotificationBell from '../components/NotificationBell'


const STATUS_COLORS = {
  received: { bg: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: 'rgba(99,102,241,0.3)' },
  assigned: { bg: 'rgba(249,115,22,0.15)', color: '#fdba74', border: 'rgba(249,115,22,0.3)' },
  accepted: { bg: 'rgba(168,85,247,0.15)', color: '#d8b4fe', border: 'rgba(168,85,247,0.3)' },
  'picked-up': { bg: 'rgba(234,179,8,0.15)', color: '#fde047', border: 'rgba(234,179,8,0.3)' },
  'in-transit': { bg: 'rgba(59,130,246,0.15)', color: '#93c5fd', border: 'rgba(59,130,246,0.3)' },
  delivered: { bg: 'rgba(34,197,94,0.15)', color: '#86efac', border: 'rgba(34,197,94,0.3)' },
  cancelled: { bg: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: 'rgba(239,68,68,0.3)' },
}

const STATUS_LABELS = {
  received: 'Order Received', assigned: 'Rider Assigned',
  accepted: 'Accepted', 'picked-up': 'Picked Up',
  'in-transit': 'In Transit', delivered: 'Delivered', cancelled: 'Cancelled',
}

const DELIVERY_TYPE_LABELS = {
  standard: 'Standard', 'same-day': 'Same-Day',
  express: 'Express', scheduled: 'Scheduled',
}

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.received
  return (
    <span style={{ padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 600, background: c.bg, color: c.color, border: `1px solid ${c.border}`, whiteSpace: 'nowrap' }}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}

function SettingsTab({ brand }) {
  const [form, setForm] = useState({
    businessName: '', whatsapp: '', email: '', phone: '',
    address: '', coverageArea: '', brandColor: '#f97316',
    standardFee: 30, sameDayFee: 50, expressFee: 80, scheduledFee: 40,
  })
  const [logo, setLogo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    fetchSettings()
      .then(s => {
        setForm({
          businessName: s.businessName || '',
          whatsapp: s.whatsapp || '',
          email: s.email || '',
          phone: s.phone || '',
          address: s.address || '',
          coverageArea: s.coverageArea || '',
          brandColor: s.brandColor || '#f97316',
          standardFee: s.standardFee || 30,
          sameDayFee: s.sameDayFee || 50,
          expressFee: s.expressFee || 80,
          scheduledFee: s.scheduledFee || 40,
        })
        setLoading(false)
      })
      .catch(console.error)
  }, [])

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLogo(file)
    setPreview(URL.createObjectURL(file))
  }

  const save = async () => {
    setSaving(true); setSuccess(false); setError('')
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (logo) fd.append('logo', logo)
      await updateTenantMe(fd)
      setSuccess(true)
      // Update CSS variable live
      document.documentElement.style.setProperty('--brand', form.brandColor)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) { setError(e.response?.data?.error || 'Failed to save settings.') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="adm-empty">Loading settings...</div>

  return (
    <div>
      <div className="adm-page-title">Settings</div>

      {/* BRANDING */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 24, marginBottom: 16 }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 20 }}>Branding</div>

        {/* Logo Upload */}
        <div style={{ marginBottom: 20 }}>
          <div className="adm-form-label" style={{ marginBottom: 10 }}>Business Logo</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ width: 72, height: 72, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {preview || brand?.logo
                ? <img src={preview || brand?.logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: 28 }}>🚀</span>
              }
            </div>
            <div>
              <button type="button" onClick={() => document.getElementById('logo-upload').click()} style={{ padding: '9px 18px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'rgba(240,244,255,0.7)', fontSize: 13, cursor: 'pointer', marginBottom: 6, display: 'block' }}>
                📷 Upload Logo
              </button>
              <div style={{ fontSize: 11, color: 'rgba(240,244,255,0.25)' }}>PNG, JPG recommended. Square works best.</div>
              <input id="logo-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
            </div>
          </div>
        </div>

        {/* Brand Color */}
        <div className="adm-form-field">
          <label className="adm-form-label">Brand Color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              type="color"
              value={form.brandColor}
              onChange={e => {
                setForm({ ...form, brandColor: e.target.value })
                document.documentElement.style.setProperty('--brand', e.target.value)
              }}
              style={{ width: 48, height: 44, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 8, padding: 0 }}
            />
            <input
              className="adm-form-input"
              value={form.brandColor}
              onChange={e => {
                setForm({ ...form, brandColor: e.target.value })
                document.documentElement.style.setProperty('--brand', e.target.value)
              }}
              placeholder="#f97316"
              style={{ maxWidth: 140 }}
            />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['#f97316', '#6366f1', '#22c55e', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'].map(c => (
                <div
                  key={c}
                  onClick={() => {
                    setForm({ ...form, brandColor: c })
                    document.documentElement.style.setProperty('--brand', c)
                  }}
                  style={{ width: 24, height: 24, borderRadius: '50%', background: c, cursor: 'pointer', border: form.brandColor === c ? '2px solid #fff' : '2px solid transparent', transition: 'border 0.2s' }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BUSINESS INFO */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 24, marginBottom: 16 }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 20 }}>Business Information</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[
            { label: 'Business Name', key: 'businessName', placeholder: 'SwiftByGwyn' },
            { label: 'WhatsApp Number (with country code)', key: 'whatsapp', placeholder: '233244000000' },
            { label: 'Email Address', key: 'email', placeholder: 'info@swiftbygwyn.com' },
            { label: 'Phone Number', key: 'phone', placeholder: '0244000000' },
            { label: 'Business Address', key: 'address', placeholder: 'Accra, Ghana' },
            { label: 'Coverage Area', key: 'coverageArea', placeholder: 'Greater Accra Region' },
          ].map(f => (
            <div key={f.key} className="adm-form-field">
              <label className="adm-form-label">{f.label}</label>
              <input className="adm-form-input" value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} />
            </div>
          ))}
        </div>
      </div>

      {/* FEES */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 24, marginBottom: 16 }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 20 }}>Delivery Fees (GHS)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[
            { label: 'Standard Delivery', key: 'standardFee' },
            { label: 'Same-Day Delivery', key: 'sameDayFee' },
            { label: 'Express / Urgent', key: 'expressFee' },
            { label: 'Scheduled Delivery', key: 'scheduledFee' },
          ].map(f => (
            <div key={f.key} className="adm-form-field">
              <label className="adm-form-label">{f.label}</label>
              <input className="adm-form-input" type="number" value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: Number(e.target.value) })} />
            </div>
          ))}
        </div>
      </div>

      {error && <div className="adm-form-error" style={{ marginBottom: 14 }}>✕ {error}</div>}
      {success && <div style={{ padding: '12px 16px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 10, color: '#86efac', fontSize: 13, marginBottom: 14 }}>✓ Settings saved! Refresh to see all changes.</div>}
      <button className="adm-form-btn" style={{ maxWidth: 200 }} onClick={save} disabled={saving}>
        {saving ? 'Saving...' : success ? '✓ Saved!' : 'Save Changes'}
      </button>
    </div>
  )
}

function AccountTab() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const save = async () => {
    setError(''); setSuccess(false)
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) { setError('All fields are required.'); return }
    if (form.newPassword !== form.confirmPassword) { setError('New passwords do not match.'); return }
    if (form.newPassword.length < 6) { setError('Password must be at least 6 characters.'); return }
    setSaving(true)
    try {
      await changeAdminPassword({ currentPassword: form.currentPassword, newPassword: form.newPassword })
      setSuccess(true)
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) { setError(e.response?.data?.error || 'Failed to change password.') }
    finally { setSaving(false) }
  }

  return (
    <div>
      <div className="adm-page-title">Account</div>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 24, maxWidth: 440 }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 20 }}>Change Password</div>
        <div className="adm-form-field">
          <label className="adm-form-label">Current Password</label>
          <input type="password" className="adm-form-input" value={form.currentPassword} onChange={e => setForm({ ...form, currentPassword: e.target.value })} placeholder="••••••••" />
        </div>
        <div className="adm-form-field">
          <label className="adm-form-label">New Password</label>
          <input type="password" className="adm-form-input" value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} placeholder="Minimum 6 characters" />
        </div>
        <div className="adm-form-field">
          <label className="adm-form-label">Confirm New Password</label>
          <input type="password" className="adm-form-input" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Repeat new password" />
        </div>
        {error && <div className="adm-form-error">✕ {error}</div>}
        {success && <div style={{ padding: '12px 16px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 10, color: '#86efac', fontSize: 13, marginBottom: 14 }}>✓ Password changed!</div>}
        <button className="adm-form-btn" onClick={save} disabled={saving}>
          {saving ? 'Changing...' : 'Change Password'}
        </button>
      </div>
    </div>
  )
}

function CustomersTab() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { load() }, [])

  const load = () => fetchAllCustomers()
    .then(d => { setCustomers(d); setLoading(false) })
    .catch(console.error)

  const del = async (id) => {
    if (!confirm('Delete this customer?')) return
    await deleteCustomer(id); load()
  }

  const filtered = customers.filter(c => {
    if (!search) return true
    const s = search.toLowerCase()
    return c.name?.toLowerCase().includes(s) || c.email?.toLowerCase().includes(s) || c.phone?.includes(s)
  })

  return (
    <div>
      <div className="adm-page-title">Customers</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <input className="adm-search" placeholder="Search by name, email or phone..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 0 }} />
        <div style={{ fontSize: 13, color: 'rgba(240,244,255,0.35)' }}>{filtered.length} customer{filtered.length !== 1 ? 's' : ''}</div>
      </div>
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5}><div className="adm-empty">Loading...</div></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5}><div className="adm-empty">No customers found.</div></td></tr>
            ) : (
              filtered.map(c => (
                <tr key={c._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: 'var(--brand)', flexShrink: 0 }}>
                        {c.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="adm-table-name">{c.name}</div>
                    </div>
                  </td>
                  <td><span style={{ fontSize: 12 }}>{c.email}</span></td>
                  <td><span style={{ fontSize: 12 }}>{c.phone || '—'}</span></td>
                  <td><span style={{ fontSize: 11, color: 'rgba(240,244,255,0.35)' }}>{new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span></td>
                  <td><button className="adm-btn-sm adm-btn-red" onClick={() => del(c._id)}>Delete</button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PlanBanner({ planInfo }) {
  if (!planInfo) return null

  const { plan, status, trialDaysLeft, limits, usage } = planInfo

  const orderPercent = limits.orders === Infinity ? 0 : Math.round((usage.ordersThisMonth / limits.orders) * 100)
  const riderPercent = limits.riders === Infinity ? 0 : Math.round((usage.riderCount / limits.riders) * 100)

  if (status === 'trial') {
    const isUrgent = trialDaysLeft <= 3
    const isWarning = trialDaysLeft <= 7

    return (
      <div style={{
        background: isUrgent ? 'rgba(239,68,68,0.08)' : isWarning ? 'rgba(245,158,11,0.08)' : 'rgba(99,102,241,0.08)',
        border: `1px solid ${isUrgent ? 'rgba(239,68,68,0.25)' : isWarning ? 'rgba(245,158,11,0.25)' : 'rgba(99,102,241,0.25)'}`,
        borderRadius: 14, padding: '14px 20px', marginBottom: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>{isUrgent ? '🚨' : isWarning ? '⚠️' : '⏳'}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: isUrgent ? '#fca5a5' : isWarning ? '#fcd34d' : '#a5b4fc' }}>
              {trialDaysLeft === 0
                ? 'Your trial has ended — contact Bdelivery to upgrade'
                : `Free trial ends in ${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''}`
              }
            </div>
            <div style={{ fontSize: 11, color: 'rgba(240,244,255,0.35)', marginTop: 2 }}>
              {usage.ordersThisMonth}/{limits.orders} orders · {usage.riderCount}/{limits.riders} riders used
            </div>
          </div>
        </div>
        <a href={`https://wa.me/233000000000?text=${encodeURIComponent('Hi Bdelivery! I want to upgrade my plan.')}`} target="_blank" rel="noreferrer"
          style={{ padding: '8px 16px', background: isUrgent ? '#ef4444' : isWarning ? '#f59e0b' : '#6366f1', color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
          Upgrade Now →
        </a>
      </div>
    )
  }

  // Active plan — show usage
  return (
    <div style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 14, padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>📊</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#86efac', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{plan} Plan</span>
      </div>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 12, color: 'rgba(240,244,255,0.4)' }}>
          Orders: <span style={{ color: '#fff', fontWeight: 600 }}>{usage.ordersThisMonth}{limits.orders !== Infinity ? `/${limits.orders}` : ' (unlimited)'}</span>
          {limits.orders !== Infinity && (
            <div style={{ width: 80, height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginTop: 4 }}>
              <div style={{ width: `${Math.min(orderPercent, 100)}%`, height: '100%', background: orderPercent > 80 ? '#ef4444' : '#22c55e', borderRadius: 2 }} />
            </div>
          )}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(240,244,255,0.4)' }}>
          Riders: <span style={{ color: '#fff', fontWeight: 600 }}>{usage.riderCount}{limits.riders !== Infinity ? `/${limits.riders}` : ' (unlimited)'}</span>
          {limits.riders !== Infinity && (
            <div style={{ width: 80, height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginTop: 4 }}>
              <div style={{ width: `${Math.min(riderPercent, 100)}%`, height: '100%', background: riderPercent > 80 ? '#ef4444' : '#22c55e', borderRadius: 2 }} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { logout } = useAdminAuth()
  const { tenant } = useTenant()
  const { adminTenant } = useAdminAuth()
  const { socket } = useSocket()
  const tenantId = adminTenant?.id || adminTenant?._id

  const navigate = useNavigate()

  const brand = tenant || adminTenant
  const SITE_URL = `https://${brand?.subdomain || 'swiftbygwyn'}.bdelivery.com`
  const brandColor = brand?.brandColor || '#f97316'

  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [orders, setOrders] = useState([])
  const [riders, setRiders] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [riderModal, setRiderModal] = useState(false)
  const [riderForm, setRiderForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [riderLoading, setRiderLoading] = useState(false)
  const [riderError, setRiderError] = useState('')
  const [historySearch, setHistorySearch] = useState('')
  const [planInfo, setPlanInfo] = useState(null)

  useEffect(() => {
    loadAll()

    if (socket && tenantId) {
      socket.emit('admin:join', tenantId)

      socket.on('order:new', () => { loadAll() })
      socket.on('order:updated', () => { loadAll() })

      return () => {
        socket.off('order:new')
        socket.off('order:updated')
      }
    }
  }, [socket, tenantId])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [s, o, r, c, p] = await Promise.all([
        getStats(), getAllOrders(), getAllRiders(),
        fetchAllCustomers(), fetchTenantPlanInfo()
      ])
      setStats(s); setOrders(o); setRiders(r); setCustomers(c); setPlanInfo(p)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const loadOrders = async (status) => {
    try { const o = await getAllOrders(status); setOrders(o) }
    catch (e) { console.error(e) }
  }

  const handleStatusFilter = (status) => { setStatusFilter(status); loadOrders(status) }

  const handleAssignRider = async (orderId, riderId) => {
    try { await assignRider(orderId, riderId); loadAll() }
    catch (e) { alert(e.response?.data?.error || 'Failed to assign rider') }
  }

  const handleUpdateStatus = async (orderId, status) => {
    try { await updateOrderStatus(orderId, status); loadAll(); setSelectedOrder(null) }
    catch (e) { alert(e.response?.data?.error || 'Failed to update status') }
  }

  const handleCreateRider = async (e) => {
    e.preventDefault()
    setRiderLoading(true); setRiderError('')
    try {
      await createRider(riderForm)
      setRiderModal(false)
      setRiderForm({ name: '', email: '', password: '', phone: '' })
      loadAll()
    } catch (e) { setRiderError(e.response?.data?.error || 'Failed to create rider') }
    finally { setRiderLoading(false) }
  }

  const handleLogout = () => { logout(); navigate('/admin/login') }

  const deliveredOrders = orders.filter(o => o.status === 'delivered')
  const cancelledOrders = orders.filter(o => o.status === 'cancelled')
  const historyOrders = [...deliveredOrders, ...cancelledOrders].filter(o => {
    if (!historySearch) return true
    const s = historySearch.toLowerCase()
    return o.orderID?.toLowerCase().includes(s) ||
      o.customerName?.toLowerCase().includes(s) ||
      o.recipientName?.toLowerCase().includes(s)
  })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --brand: ${brandColor}; }
        .adm-root { min-height: 100vh; background: #0b0f1a; font-family: 'Inter', sans-serif; color: #f0f4ff; display: flex; }
        .adm-sidebar { width: 220px; flex-shrink: 0; background: rgba(255,255,255,0.03); border-right: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; padding: 24px 0; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
        .adm-sidebar-logo { display: flex; align-items: center; gap: 10px; padding: 0 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 16px; text-decoration: none; }
        .adm-sidebar-logo-icon { width: 34px; height: 34px; background: var(--brand); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }
        .adm-sidebar-logo-text { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 15px; color: #fff; }
        .adm-nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 20px; font-size: 13px; font-weight: 500; color: rgba(240,244,255,0.45); cursor: pointer; transition: all 0.2s; border-left: 2px solid transparent; }
        .adm-nav-item:hover { color: #fff; background: rgba(255,255,255,0.04); }
        .adm-nav-item.active { color: var(--brand); background: rgba(255,255,255,0.06); border-left-color: var(--brand); }
        .adm-nav-icon { font-size: 16px; }
        .adm-sidebar-bottom { margin-top: auto; padding: 16px 20px; border-top: 1px solid rgba(255,255,255,0.06); }
        .adm-logout-btn { width: 100%; padding: 10px; background: transparent; color: rgba(240,244,255,0.35); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .adm-logout-btn:hover { border-color: var(--brand); color: var(--brand); }
        .adm-main { flex: 1; padding: 32px; overflow-x: hidden; }
        .adm-page-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 24px; color: #fff; margin-bottom: 24px; }
        .adm-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 28px; }
        .adm-stat { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 20px; position: relative; overflow: hidden; }
        .adm-stat-num { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 32px; color: #fff; margin-bottom: 4px; }
        .adm-stat-label { font-size: 12px; color: rgba(240,244,255,0.35); }
        .adm-stat-icon { position: absolute; top: 16px; right: 16px; font-size: 22px; opacity: 0.2; }
        .adm-filters { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
        .adm-filter-btn { padding: 7px 16px; border-radius: 100px; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s; border: 1px solid rgba(255,255,255,0.08); background: transparent; color: rgba(240,244,255,0.4); }
        .adm-filter-btn:hover { border-color: var(--brand); color: var(--brand); }
        .adm-filter-btn.active { background: var(--brand); color: #fff; border-color: var(--brand); }
        .adm-table-wrap { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; overflow: hidden; }
        .adm-table { width: 100%; border-collapse: collapse; }
        .adm-table th { padding: 14px 16px; text-align: left; font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: rgba(240,244,255,0.3); border-bottom: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); }
        .adm-table td { padding: 14px 16px; font-size: 13px; color: rgba(240,244,255,0.7); border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle; }
        .adm-table tr:last-child td { border-bottom: none; }
        .adm-table tr:hover td { background: rgba(255,255,255,0.02); }
        .adm-table-name { font-weight: 600; color: #fff; margin-bottom: 2px; }
        .adm-table-sub { font-size: 11px; color: rgba(240,244,255,0.35); }
        .adm-btn-sm { padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s; border: none; }
        .adm-btn-orange { background: rgba(249,115,22,0.15); color: var(--brand); border: 1px solid rgba(249,115,22,0.3); }
        .adm-btn-orange:hover { background: var(--brand); color: #fff; }
        .adm-btn-red { background: rgba(239,68,68,0.15); color: #fca5a5; border: 1px solid rgba(239,68,68,0.3); }
        .adm-btn-red:hover { background: #ef4444; color: #fff; }
        .adm-btn-green { background: rgba(34,197,94,0.15); color: #86efac; border: 1px solid rgba(34,197,94,0.3); }
        .adm-btn-green:hover { background: #22c55e; color: #fff; }
        .adm-modal-backdrop { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,0.7); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; padding: 24px; }
        .adm-modal { background: #0f1525; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; width: 100%; max-width: 600px; max-height: 85vh; overflow-y: auto; }
        .adm-modal-head { padding: 24px; border-bottom: 1px solid rgba(255,255,255,0.07); display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; background: #0f1525; z-index: 5; }
        .adm-modal-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 18px; color: #fff; }
        .adm-modal-close { background: rgba(255,255,255,0.06); border: none; color: rgba(240,244,255,0.5); width: 32px; height: 32px; border-radius: 8px; cursor: pointer; font-size: 14px; }
        .adm-modal-body { padding: 24px; }
        .adm-modal-section { margin-bottom: 20px; }
        .adm-modal-section-title { font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: rgba(240,244,255,0.3); margin-bottom: 12px; }
        .adm-modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .adm-modal-item { background: rgba(255,255,255,0.03); border-radius: 10px; padding: 12px; }
        .adm-modal-item-label { font-size: 11px; color: rgba(240,244,255,0.3); margin-bottom: 4px; }
        .adm-modal-item-value { font-size: 13px; color: #f0f4ff; font-weight: 500; }
        .adm-assign-select { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 10px 14px; font-size: 13px; color: #fff; outline: none; margin-bottom: 10px; }
        .adm-status-btns { display: flex; gap: 8px; flex-wrap: wrap; }
        .adm-proof-img { width: 100%; max-height: 200px; object-fit: cover; border-radius: 10px; margin-top: 8px; }
        .adm-form-field { margin-bottom: 14px; }
        .adm-form-label { display: block; font-size: 12px; font-weight: 500; color: rgba(240,244,255,0.4); margin-bottom: 6px; }
        .adm-form-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); border-radius: 10px; padding: 11px 14px; font-size: 13px; color: #fff; outline: none; font-family: 'Inter', sans-serif; transition: border-color 0.2s; }
        .adm-form-input:focus { border-color: var(--brand); }
        .adm-form-error { font-size: 12px; color: #fca5a5; margin-bottom: 12px; padding: 10px; background: rgba(239,68,68,0.1); border-radius: 8px; }
        .adm-form-btn { width: 100%; padding: 13px; background: var(--brand); color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
        .adm-form-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .adm-empty { padding: 48px; text-align: center; color: rgba(240,244,255,0.25); font-size: 14px; }
        .adm-add-btn { padding: 10px 20px; background: var(--brand); color: #fff; border: none; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; margin-bottom: 20px; }
        .adm-search { width: 100%; max-width: 320px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); border-radius: 10px; padding: 10px 14px; font-size: 13px; color: #fff; outline: none; margin-bottom: 20px; font-family: 'Inter', sans-serif; }
        .adm-search:focus { border-color: var(--brand); }
        .adm-search::placeholder { color: rgba(240,244,255,0.2); }
        .adm-wa-btns { display: flex; flex-direction: column; gap: 8px; }
        @media (max-width: 768px) {
          .adm-root { flex-direction: column; }
          .adm-sidebar { width: 100%; height: auto; position: relative; flex-direction: row; flex-wrap: wrap; padding: 12px; gap: 4px; }
          .adm-sidebar-logo { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
          .adm-sidebar-bottom { margin-top: 0; padding: 0; border-top: none; }
          .adm-main { padding: 16px; }
          .adm-modal-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="adm-root">
        <aside className="adm-sidebar">
          <a href="/" className="adm-sidebar-logo">
            {brand?.logo
              ? <img src={brand.logo} alt="logo" style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
              : <div className="adm-sidebar-logo-icon">🚀</div>
            }
            <div className="adm-sidebar-logo-text">{brand?.businessName || 'Dashboard'}</div>
          </a>
          {[
            { id: 'overview', icon: '📊', label: 'Overview' },
            { id: 'orders', icon: '📦', label: 'Orders' },
            { id: 'riders', icon: '🏍️', label: 'Riders' },
            { id: 'customers', icon: '👥', label: 'Customers' },
            { id: 'history', icon: '🕐', label: 'History' },
            { id: 'reports', icon: '📈', label: 'Reports' },
            { id: 'settings', icon: '⚙️', label: 'Settings' },
            { id: 'account', icon: '👤', label: 'Account' },
          ].map(tab => (
            <div key={tab.id} className={`adm-nav-item${activeTab === tab.id ? ' active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              <span className="adm-nav-icon">{tab.icon}</span>
              {tab.label}
            </div>
          ))}
          <div className="adm-sidebar-bottom">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: 'rgba(240,244,255,0.3)' }}>Notifications</div>
              <NotificationBell tenantId={tenantId} brandColor={brandColor} />
            </div>
            <button className="adm-logout-btn" onClick={handleLogout}>Sign Out</button>
          </div>
        </aside>

        <main className="adm-main">

          <PlanBanner planInfo={planInfo} />

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <div className="adm-page-title">Overview</div>
              {loading ? <div className="adm-empty">Loading...</div> : (
                <>
                  <div className="adm-stats">
                    {[
                      { label: 'Total Orders', value: stats?.total || 0, icon: '📦', color: brandColor },
                      { label: 'Pending', value: stats?.pending || 0, icon: '⏳', color: '#f59e0b' },
                      { label: 'Completed', value: stats?.completed || 0, icon: '✅', color: '#22c55e' },
                      { label: 'Cancelled', value: stats?.cancelled || 0, icon: '❌', color: '#ef4444' },
                      { label: 'Revenue', value: `GHS ${stats?.revenue || 0}`, icon: '💰', color: '#a78bfa' },
                      { label: 'Cash Pending', value: orders.filter(o => o.status === 'delivered' && o.paymentMethod === 'cash' && !o.paymentCollected).length, icon: '💵', color: '#f59e0b' },
                      { label: 'Riders', value: riders.filter(r => r.status === 'active').length, icon: '🏍️', color: '#38bdf8' },
                      { label: 'Customers', value: customers.length, icon: '👥', color: '#ec4899' },
                    ].map(s => (
                      <div key={s.label} className="adm-stat" style={{ borderTop: `2px solid ${s.color}` }}>
                        <div className="adm-stat-icon">{s.icon}</div>
                        <div className="adm-stat-num" style={{ color: s.color }}>{s.value}</div>
                        <div className="adm-stat-label">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 16 }}>Recent Orders</div>
                  <div className="adm-table-wrap">
                    <table className="adm-table">
                      <thead><tr><th>Order ID</th><th>Customer</th><th>Route</th><th>Type</th><th>Status</th><th>Fee</th></tr></thead>
                      <tbody>
                        {orders.slice(0, 8).map(o => (
                          <tr key={o._id} style={{ cursor: 'pointer' }} onClick={() => setSelectedOrder(o)}>
                            <td><span style={{ color: brandColor, fontWeight: 700 }}>{o.orderID}</span></td>
                            <td><div className="adm-table-name">{o.customerName}</div><div className="adm-table-sub">{o.customerPhone}</div></td>
                            <td><div style={{ fontSize: 12 }}>{o.pickupLocation}</div><div className="adm-table-sub">→ {o.dropoffLocation}</div></td>
                            <td><span style={{ fontSize: 11, color: 'rgba(240,244,255,0.5)' }}>{DELIVERY_TYPE_LABELS[o.deliveryType]}</span></td>
                            <td><StatusBadge status={o.status} /></td>
                            <td style={{ color: brandColor, fontWeight: 600 }}>GHS {o.deliveryFee}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {orders.length === 0 && <div className="adm-empty">No orders yet.</div>}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ORDERS */}
          {activeTab === 'orders' && (
            <div>
              <div className="adm-page-title">All Orders</div>
              <div className="adm-filters">
                {[
                  { value: '', label: 'All' },
                  { value: 'received', label: 'Received' },
                  { value: 'assigned', label: 'Assigned' },
                  { value: 'accepted', label: 'Accepted' },
                  { value: 'picked-up', label: 'Picked Up' },
                  { value: 'in-transit', label: 'In Transit' },
                  { value: 'delivered', label: 'Delivered' },
                  { value: 'cancelled', label: 'Cancelled' },
                ].map(f => (
                  <button key={f.value} className={`adm-filter-btn${statusFilter === f.value ? ' active' : ''}`} onClick={() => handleStatusFilter(f.value)}>{f.label}</button>
                ))}
              </div>
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead><tr><th>Order ID</th><th>Customer</th><th>Recipient</th><th>Route</th><th>Type</th><th>Rider</th><th>Status</th><th>Payment</th><th>Fee</th><th></th></tr></thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o._id}>
                        <td><span style={{ color: brandColor, fontWeight: 700 }}>{o.orderID}</span></td>
                        <td><div className="adm-table-name">{o.customerName}</div><div className="adm-table-sub">{o.customerPhone}</div></td>
                        <td><div className="adm-table-name">{o.recipientName}</div><div className="adm-table-sub">{o.recipientPhone}</div></td>
                        <td><div style={{ fontSize: 12 }}>{o.pickupLocation}</div><div className="adm-table-sub">→ {o.dropoffLocation}</div></td>
                        <td><span style={{ fontSize: 11, color: 'rgba(240,244,255,0.5)' }}>{DELIVERY_TYPE_LABELS[o.deliveryType]}</span></td>
                        <td><span style={{ fontSize: 12, color: o.assignedRider ? '#86efac' : 'rgba(240,244,255,0.25)' }}>{o.assignedRider?.name || 'Unassigned'}</span></td>
                        <td><StatusBadge status={o.status} /></td>
                        <td>
                          {o.paymentMethod === 'mobile-money'
                            ? <span style={{ fontSize:11, color:'#93c5fd' }}>📱 MoMo</span>
                            : o.paymentCollected
                            ? <span style={{ fontSize:11, color:'#86efac' }}>✅ Collected</span>
                            : o.status === 'delivered'
                            ? <span style={{ fontSize:11, color:'#fca5a5' }}>⚠️ Pending</span>
                            : <span style={{ fontSize:11, color:'rgba(240,244,255,0.3)' }}>💵 Cash</span>
                          }
                        </td>
                        <td style={{ color: brandColor, fontWeight: 600 }}>GHS {o.deliveryFee}</td>
                        <td><button className="adm-btn-sm adm-btn-orange" onClick={() => setSelectedOrder(o)}>Manage</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {orders.length === 0 && <div className="adm-empty">No orders found.</div>}
              </div>
            </div>
          )}

          {/* RIDERS */}
          {activeTab === 'riders' && (
            <div>
              <div className="adm-page-title">Riders</div>
              <button className="adm-add-btn" onClick={() => setRiderModal(true)}>+ Add New Rider</button>
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Deliveries</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {riders.map(r => (
                      <tr key={r._id}>
                        <td><div className="adm-table-name">{r.name}</div></td>
                        <td><span style={{ fontSize: 12 }}>{r.email}</span></td>
                        <td><span style={{ fontSize: 12 }}>{r.phone}</span></td>
                        <td><span style={{ color: brandColor, fontWeight: 600 }}>{r.totalDeliveries}</span></td>
                        <td>
                          <span style={{ padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600, background: r.status === 'active' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: r.status === 'active' ? '#86efac' : '#fca5a5', border: `1px solid ${r.status === 'active' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                            {r.status === 'active' ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className={`adm-btn-sm ${r.status === 'active' ? 'adm-btn-red' : 'adm-btn-green'}`} onClick={() => updateRiderStatus(r._id, r.status === 'active' ? 'suspended' : 'active').then(loadAll)}>
                              {r.status === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                            <button className="adm-btn-sm adm-btn-red" onClick={() => { if (confirm('Delete this rider?')) deleteRider(r._id).then(loadAll) }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {riders.length === 0 && <div className="adm-empty">No riders yet.</div>}
              </div>
            </div>
          )}

          {activeTab === 'customers' && <CustomersTab />}

          {/* HISTORY */}
          {activeTab === 'history' && (
            <div>
              <div className="adm-page-title">Delivery History</div>
              <input className="adm-search" placeholder="Search by Order ID, customer or recipient..." value={historySearch} onChange={e => setHistorySearch(e.target.value)} />
              <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                {[
                  { label: 'Delivered', value: deliveredOrders.length, color: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', text: '#86efac' },
                  { label: 'Cancelled', value: cancelledOrders.length, color: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', text: '#fca5a5' },
                  { label: 'Total Revenue', value: `GHS ${deliveredOrders.reduce((s, o) => s + (o.deliveryFee || 0), 0)}`, color: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.2)', text: brandColor },
                ].map(s => (
                  <div key={s.label} style={{ background: s.color, border: `1px solid ${s.border}`, borderRadius: 12, padding: '12px 20px' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: s.text, fontFamily: "'Syne',sans-serif" }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: 'rgba(240,244,255,0.35)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead><tr><th>Order ID</th><th>Customer</th><th>Recipient</th><th>Route</th><th>Rider</th><th>Status</th><th>Fee</th><th>Date</th><th></th></tr></thead>
                  <tbody>
                    {historyOrders.map(o => (
                      <tr key={o._id}>
                        <td><span style={{ color: brandColor, fontWeight: 700 }}>{o.orderID}</span></td>
                        <td><div className="adm-table-name">{o.customerName}</div><div className="adm-table-sub">{o.customerPhone}</div></td>
                        <td><div className="adm-table-name">{o.recipientName}</div><div className="adm-table-sub">{o.recipientPhone}</div></td>
                        <td><div style={{ fontSize: 12 }}>{o.pickupLocation}</div><div className="adm-table-sub">→ {o.dropoffLocation}</div></td>
                        <td><span style={{ fontSize: 12, color: 'rgba(240,244,255,0.5)' }}>{o.assignedRider?.name || '—'}</span></td>
                        <td><StatusBadge status={o.status} /></td>
                        <td style={{ color: brandColor, fontWeight: 600 }}>GHS {o.deliveryFee}</td>
                        <td style={{ fontSize: 11, color: 'rgba(240,244,255,0.35)' }}>{new Date(o.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td><button className="adm-btn-sm adm-btn-orange" onClick={() => setSelectedOrder(o)}>View</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {historyOrders.length === 0 && <div className="adm-empty">No delivery history yet.</div>}
              </div>
            </div>
          )}

          {/* REPORTS */}
          {activeTab === 'reports' && (
            <div>
              <div className="adm-page-title">Reports</div>
              {stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
                  {[
                    { label: 'Total Orders', value: stats.total, icon: '📦', desc: 'All time bookings' },
                    { label: 'Completed Deliveries', value: stats.completed, icon: '✅', desc: 'Successfully delivered' },
                    { label: 'Pending Deliveries', value: stats.pending, icon: '⏳', desc: 'In progress' },
                    { label: 'Cancelled Orders', value: stats.cancelled, icon: '❌', desc: 'Cancelled' },
                    { label: 'Total Revenue', value: `GHS ${stats.revenue}`, icon: '💰', desc: 'From completed deliveries' },
                    { label: 'Completion Rate', value: stats.total ? `${Math.round((stats.completed / stats.total) * 100)}%` : '0%', icon: '📈', desc: 'Success rate' },
                    { label: 'Registered Customers', value: customers.length, icon: '👥', desc: 'Total accounts created' },
                    { label: 'Active Riders', value: riders.filter(r => r.status === 'active').length, icon: '🏍️', desc: 'Available for delivery' },
                  ].map(s => (
                    <div key={s.label} className="adm-stat" style={{ borderTop: `2px solid ${brandColor}` }}>
                      <div className="adm-stat-icon">{s.icon}</div>
                      <div className="adm-stat-num" style={{ color: brandColor, fontSize: 26 }}>{s.value}</div>
                      <div className="adm-stat-label">{s.label}</div>
                      <div style={{ fontSize: 11, color: 'rgba(240,244,255,0.2)', marginTop: 4 }}>{s.desc}</div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 16 }}>Rider Performance</div>
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead><tr><th>Rider</th><th>Phone</th><th>Total Deliveries</th><th>Status</th></tr></thead>
                  <tbody>
                    {[...riders].sort((a, b) => b.totalDeliveries - a.totalDeliveries).map(r => (
                      <tr key={r._id}>
                        <td><div className="adm-table-name">{r.name}</div><div className="adm-table-sub">{r.email}</div></td>
                        <td>{r.phone}</td>
                        <td><span style={{ color: brandColor, fontWeight: 700, fontSize: 16 }}>{r.totalDeliveries}</span></td>
                        <td><span style={{ fontSize: 11, color: r.status === 'active' ? '#86efac' : '#fca5a5' }}>{r.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {riders.length === 0 && <div className="adm-empty">No riders yet.</div>}
              </div>
            </div>
          )}

          {activeTab === 'settings' && <SettingsTab brand={brand} />}
          {activeTab === 'account' && <AccountTab />}
        </main>
      </div>

      {/* ORDER DETAIL MODAL */}
      {selectedOrder && (
        <div className="adm-modal-backdrop" onClick={e => e.target === e.currentTarget && setSelectedOrder(null)}>
          <div className="adm-modal">
            <div className="adm-modal-head">
              <div>
                <div style={{ fontSize: 11, color: 'rgba(240,244,255,0.35)', marginBottom: 4 }}>Order Details</div>
                <div className="adm-modal-title" style={{ color: brandColor }}>{selectedOrder.orderID}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <StatusBadge status={selectedOrder.status} />
                <button className="adm-modal-close" onClick={() => setSelectedOrder(null)}>✕</button>
              </div>
            </div>
            <div className="adm-modal-body">
              <div className="adm-modal-section">
                <div className="adm-modal-section-title">Customer & Recipient</div>
                <div className="adm-modal-grid">
                  <div className="adm-modal-item">
                    <div className="adm-modal-item-label">Customer</div>
                    <div className="adm-modal-item-value">{selectedOrder.customerName}</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}><a href={`tel:${selectedOrder.customerPhone}`} style={{ color: brandColor }}>{selectedOrder.customerPhone}</a></div>
                  </div>
                  <div className="adm-modal-item">
                    <div className="adm-modal-item-label">Recipient</div>
                    <div className="adm-modal-item-value">{selectedOrder.recipientName}</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}><a href={`tel:${selectedOrder.recipientPhone}`} style={{ color: brandColor }}>{selectedOrder.recipientPhone}</a></div>
                  </div>
                </div>
              </div>

              <div className="adm-modal-section">
                <div className="adm-modal-section-title">Notify Recipient via WhatsApp</div>
                <div className="adm-wa-btns">
                  <a href={`https://wa.me/${selectedOrder.recipientPhone?.replace(/\D/g, '')}?text=${encodeURIComponent(`${brand?.businessName || 'Delivery Service'}: A package has been scheduled for delivery to you. Order ID: ${selectedOrder.orderID}. Track here: ${SITE_URL}/track/${selectedOrder.orderID}`)}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: 10, color: '#4ade80', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                    📦 Notify: Package Booked for You
                  </a>
                  {['assigned', 'accepted', 'picked-up', 'in-transit'].includes(selectedOrder.status) && (
                    <a href={`https://wa.me/${selectedOrder.recipientPhone?.replace(/\D/g, '')}?text=${encodeURIComponent(`${brand?.businessName || 'Delivery Service'}: Your package (Order ID: ${selectedOrder.orderID}) is on the way! Track here: ${SITE_URL}/track/${selectedOrder.orderID}`)}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, color: '#93c5fd', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                      🏍️ Notify: Rider On The Way
                    </a>
                  )}
                  {selectedOrder.status === 'delivered' && (
                    <a href={`https://wa.me/${selectedOrder.recipientPhone?.replace(/\D/g, '')}?text=${encodeURIComponent(`${brand?.businessName || 'Delivery Service'}: Your package (Order ID: ${selectedOrder.orderID}) has been delivered! Thank you.`)}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, color: '#86efac', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                      ✅ Notify: Package Delivered
                    </a>
                  )}
                </div>
              </div>

              <div className="adm-modal-section">
                <div className="adm-modal-section-title">Delivery Info</div>
                <div className="adm-modal-grid">
                  <div className="adm-modal-item"><div className="adm-modal-item-label">Pickup</div><div className="adm-modal-item-value">{selectedOrder.pickupLocation}</div></div>
                  <div className="adm-modal-item"><div className="adm-modal-item-label">Drop-off</div><div className="adm-modal-item-value">{selectedOrder.dropoffLocation}</div></div>
                  <div className="adm-modal-item"><div className="adm-modal-item-label">Type</div><div className="adm-modal-item-value">{DELIVERY_TYPE_LABELS[selectedOrder.deliveryType]}</div></div>
                  <div className="adm-modal-item"><div className="adm-modal-item-label">Fee</div><div className="adm-modal-item-value" style={{ color: brandColor }}>GHS {selectedOrder.deliveryFee}</div></div>
                  <div className="adm-modal-item"><div className="adm-modal-item-label">Payment Method</div><div className="adm-modal-item-value" style={{ textTransform: 'capitalize' }}>{selectedOrder.paymentMethod?.replace('-', ' ')}</div></div>
                  <div className="adm-modal-item">
                    <div className="adm-modal-item-label">Payment Status</div>
                    <div className="adm-modal-item-value">
                      {selectedOrder.paymentMethod === 'mobile-money'
                        ? <span style={{ color:'#93c5fd' }}>📱 Mobile Money</span>
                        : selectedOrder.paymentCollected
                        ? <span style={{ color:'#86efac' }}>✅ Cash Collected</span>
                        : selectedOrder.status === 'delivered'
                        ? <span style={{ color:'#fca5a5' }}>⚠️ Cash Not Collected Yet</span>
                        : <span style={{ color:'rgba(240,244,255,0.35)' }}>💵 Cash on Delivery</span>
                      }
                    </div>
                  </div>
                  <div className="adm-modal-item"><div className="adm-modal-item-label">Booked</div><div className="adm-modal-item-value">{new Date(selectedOrder.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div></div>
                  {selectedOrder.distance > 0 && <div className="adm-modal-item"><div className="adm-modal-item-label">Distance</div><div className="adm-modal-item-value">{selectedOrder.distance} km</div></div>}
                  {selectedOrder.deliveryType === 'scheduled' && (
                    <div className="adm-modal-item" style={{ gridColumn: '1/-1' }}>
                      <div className="adm-modal-item-label">Scheduled For</div>
                      <div className="adm-modal-item-value" style={{ color: brandColor }}>{selectedOrder.scheduledDate} at {selectedOrder.scheduledTime}</div>
                    </div>
                  )}
                </div>
                {selectedOrder.packageDescription && <div className="adm-modal-item" style={{ marginTop: 10 }}><div className="adm-modal-item-label">Package</div><div className="adm-modal-item-value">{selectedOrder.packageDescription}</div></div>}
                {selectedOrder.additionalNotes && <div className="adm-modal-item" style={{ marginTop: 10 }}><div className="adm-modal-item-label">Notes</div><div className="adm-modal-item-value">{selectedOrder.additionalNotes}</div></div>}
                {selectedOrder.packageImage && <div style={{ marginTop: 10 }}><div className="adm-modal-item-label" style={{ marginBottom: 6 }}>Package Photo</div><img src={selectedOrder.packageImage} alt="Package" className="adm-proof-img" /></div>}
              </div>

              {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                <div className="adm-modal-section">
                  <div className="adm-modal-section-title">Assign Rider</div>
                  <select className="adm-assign-select" defaultValue={selectedOrder.assignedRider?._id || ''} onChange={e => e.target.value && handleAssignRider(selectedOrder._id, e.target.value)}>
                    <option value="">Select a rider...</option>
                    {riders.filter(r => r.status === 'active').map(r => (
                      <option key={r._id} value={r._id}>{r.name} — {r.phone}</option>
                    ))}
                  </select>
                  {selectedOrder.assignedRider && <div style={{ fontSize: 13, color: '#86efac' }}>✓ Assigned to <strong>{selectedOrder.assignedRider.name}</strong></div>}
                </div>
              )}

              {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                <div className="adm-modal-section">
                  <div className="adm-modal-section-title">Update Status</div>
                  <div className="adm-status-btns">
                    {['received', 'assigned', 'accepted', 'picked-up', 'in-transit', 'delivered', 'cancelled'].map(s => (
                      <button key={s} className={`adm-btn-sm ${selectedOrder.status === s ? 'adm-btn-orange' : ''}`}
                        style={selectedOrder.status !== s ? { background: 'rgba(255,255,255,0.05)', color: 'rgba(240,244,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' } : {}}
                        onClick={() => handleUpdateStatus(selectedOrder._id, s)}>
                        {STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedOrder.status === 'delivered' && (selectedOrder.proofPhoto || selectedOrder.proofRecipientName) && (
                <div className="adm-modal-section">
                  <div className="adm-modal-section-title">Proof of Delivery</div>
                  <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, padding: 16 }}>
                    {selectedOrder.proofRecipientName && <div style={{ fontSize: 13, color: '#86efac', marginBottom: selectedOrder.proofPhoto ? 10 : 0 }}>Received by: <strong>{selectedOrder.proofRecipientName}</strong></div>}
                    {selectedOrder.proofPhoto && <img src={selectedOrder.proofPhoto} alt="Proof" className="adm-proof-img" />}
                  </div>
                </div>
              )}

              <div style={{ fontSize: 11, color: 'rgba(240,244,255,0.2)', textAlign: 'right', marginTop: 8 }}>
                Booked {new Date(selectedOrder.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} at {new Date(selectedOrder.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD RIDER MODAL */}
      {riderModal && (
        <div className="adm-modal-backdrop" onClick={e => e.target === e.currentTarget && setRiderModal(false)}>
          <div className="adm-modal" style={{ maxWidth: 440 }}>
            <div className="adm-modal-head">
              <div className="adm-modal-title">Add New Rider</div>
              <button className="adm-modal-close" onClick={() => setRiderModal(false)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <form onSubmit={handleCreateRider}>
                <div className="adm-form-field"><label className="adm-form-label">Full Name</label><input className="adm-form-input" value={riderForm.name} onChange={e => setRiderForm({ ...riderForm, name: e.target.value })} required placeholder="Kofi Mensah" /></div>
                <div className="adm-form-field"><label className="adm-form-label">Email</label><input className="adm-form-input" type="email" value={riderForm.email} onChange={e => setRiderForm({ ...riderForm, email: e.target.value })} required placeholder="kofi@email.com" /></div>
                <div className="adm-form-field"><label className="adm-form-label">Phone</label><input className="adm-form-input" value={riderForm.phone} onChange={e => setRiderForm({ ...riderForm, phone: e.target.value })} required placeholder="0244000000" /></div>
                <div className="adm-form-field"><label className="adm-form-label">Password</label><input className="adm-form-input" type="password" value={riderForm.password} onChange={e => setRiderForm({ ...riderForm, password: e.target.value })} required placeholder="Minimum 6 characters" minLength={6} /></div>
                {riderError && <div className="adm-form-error">✕ {riderError}</div>}
                <button className="adm-form-btn" type="submit" disabled={riderLoading}>{riderLoading ? 'Adding...' : 'Add Rider'}</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


// Email: admin@swiftbygwyn.com
// Password: swift2024