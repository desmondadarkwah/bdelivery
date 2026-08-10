import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSuperAdmin } from '../context/SuperAdminContext'
import {
  getPlatformStats, getSuperTenants,
  createTenant, updateTenantStatus,
  updateTenantById, deleteTenantById,
} from '../utils/api'

const PLAN_COLORS = {
  trial:   { bg:'rgba(99,102,241,0.15)',  color:'#a5b4fc', border:'rgba(99,102,241,0.3)' },
  starter: { bg:'rgba(34,197,94,0.15)',   color:'#86efac', border:'rgba(34,197,94,0.3)' },
  growth:  { bg:'rgba(249,115,22,0.15)',  color:'#fdba74', border:'rgba(249,115,22,0.3)' },
  pro:     { bg:'rgba(168,85,247,0.15)',  color:'#d8b4fe', border:'rgba(168,85,247,0.3)' },
}

const STATUS_COLORS = {
  active:    { bg:'rgba(34,197,94,0.15)',  color:'#86efac',  border:'rgba(34,197,94,0.3)' },
  trial:     { bg:'rgba(99,102,241,0.15)', color:'#a5b4fc',  border:'rgba(99,102,241,0.3)' },
  suspended: { bg:'rgba(239,68,68,0.15)',  color:'#fca5a5',  border:'rgba(239,68,68,0.3)' },
  cancelled: { bg:'rgba(107,114,128,0.15)',color:'#9ca3af',  border:'rgba(107,114,128,0.3)' },
}

function Badge({ label, colors }) {
  return (
    <span style={{ padding:'3px 10px', borderRadius:100, fontSize:11, fontWeight:600, background:colors.bg, color:colors.color, border:`1px solid ${colors.border}`, whiteSpace:'nowrap' }}>
      {label}
    </span>
  )
}

export default function SuperAdminDashboard() {
  const { superAdmin, logout } = useSuperAdmin()
  const navigate = useNavigate()
  const [activeTab, setActiveTab]   = useState('overview')
  const [stats, setStats]           = useState(null)
  const [tenants, setTenants]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [modal, setModal]           = useState(false)
  const [editTenant, setEditTenant] = useState(null)
  const [search, setSearch]         = useState('')
  const [form, setForm] = useState({
    businessName:'', subdomain:'', brandColor:'#f97316',
    whatsapp:'', email:'', phone:'', address:'', coverageArea:'',
    standardFee:30, sameDayFee:50, expressFee:80, scheduledFee:40,
    plan:'trial', adminEmail:'', adminPassword:'',
  })
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError]     = useState('')

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [s, t] = await Promise.all([getPlatformStats(), getSuperTenants()])
      setStats(s); setTenants(t)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  const openCreate = () => {
    setEditTenant(null)
    setForm({ businessName:'', subdomain:'', brandColor:'#f97316', whatsapp:'', email:'', phone:'', address:'', coverageArea:'', standardFee:30, sameDayFee:50, expressFee:80, scheduledFee:40, plan:'trial', adminEmail:'', adminPassword:'' })
    setFormError('')
    setModal(true)
  }

  const openEdit = (tenant) => {
    setEditTenant(tenant)
    setForm({
      businessName: tenant.businessName, subdomain: tenant.subdomain,
      brandColor: tenant.brandColor, whatsapp: tenant.whatsapp || '',
      email: tenant.email || '', phone: tenant.phone || '',
      address: tenant.address || '', coverageArea: tenant.coverageArea || '',
      standardFee: tenant.standardFee, sameDayFee: tenant.sameDayFee,
      expressFee: tenant.expressFee, scheduledFee: tenant.scheduledFee,
      plan: tenant.plan, adminEmail: tenant.adminEmail, adminPassword: '',
    })
    setFormError('')
    setModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true); setFormError('')
    try {
      if (editTenant) {
        const payload = { ...form }
        if (!payload.adminPassword) delete payload.adminPassword
        await updateTenantById(editTenant._id, payload)
      } else {
        await createTenant(form)
      }
      setModal(false); loadAll()
    } catch(e) { setFormError(e.response?.data?.error || 'Failed. Try again.') }
    finally { setFormLoading(false) }
  }

  const handleStatus = async (id, status) => {
    try { await updateTenantStatus(id, status); loadAll() }
    catch(e) { alert(e.response?.data?.error || 'Failed') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this tenant? All their data will be lost.')) return
    try { await deleteTenantById(id); loadAll() }
    catch(e) { alert(e.response?.data?.error || 'Failed') }
  }

  const handleLogout = () => { logout(); navigate('/super/login') }

  const filteredTenants = tenants.filter(t => {
    if (!search) return true
    const s = search.toLowerCase()
    return t.businessName?.toLowerCase().includes(s) ||
           t.subdomain?.toLowerCase().includes(s) ||
           t.adminEmail?.toLowerCase().includes(s)
  })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .sa-root { min-height: 100vh; background: #060810; font-family: 'Inter', sans-serif; color: #f0f4ff; display: flex; }
        .sa-sidebar { width: 220px; flex-shrink: 0; background: rgba(99,102,241,0.05); border-right: 1px solid rgba(99,102,241,0.1); display: flex; flex-direction: column; padding: 24px 0; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
        .sa-sidebar-logo { display: flex; align-items: center; gap: 10px; padding: 0 20px 24px; border-bottom: 1px solid rgba(99,102,241,0.1); margin-bottom: 16px; }
        .sa-sidebar-logo-icon { width: 34px; height: 34px; background: linear-gradient(135deg,#6366f1,#8b5cf6); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }
        .sa-sidebar-logo-text { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 15px; color: #fff; }
        .sa-sidebar-logo-sub { font-size: 9px; color: rgba(165,180,252,0.5); letter-spacing: 0.1em; text-transform: uppercase; }
        .sa-nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 20px; font-size: 13px; font-weight: 500; color: rgba(240,244,255,0.45); cursor: pointer; transition: all 0.2s; border-left: 2px solid transparent; }
        .sa-nav-item:hover { color: #fff; background: rgba(99,102,241,0.08); }
        .sa-nav-item.active { color: #a5b4fc; background: rgba(99,102,241,0.12); border-left-color: #6366f1; }
        .sa-sidebar-bottom { margin-top: auto; padding: 16px 20px; border-top: 1px solid rgba(99,102,241,0.1); }
        .sa-logout-btn { width: 100%; padding: 10px; background: transparent; color: rgba(240,244,255,0.35); border: 1px solid rgba(99,102,241,0.2); border-radius: 8px; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .sa-logout-btn:hover { border-color: #6366f1; color: #a5b4fc; }
        .sa-main { flex: 1; padding: 32px; overflow-x: hidden; }
        .sa-page-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 24px; color: #fff; margin-bottom: 24px; }
        .sa-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 28px; }
        .sa-stat { background: rgba(99,102,241,0.06); border: 1px solid rgba(99,102,241,0.15); border-radius: 16px; padding: 20px; position: relative; overflow: hidden; }
        .sa-stat-num { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 32px; color: #a5b4fc; margin-bottom: 4px; }
        .sa-stat-label { font-size: 12px; color: rgba(240,244,255,0.35); }
        .sa-stat-icon { position: absolute; top: 16px; right: 16px; font-size: 22px; opacity: 0.15; }
        .sa-table-wrap { background: rgba(99,102,241,0.04); border: 1px solid rgba(99,102,241,0.12); border-radius: 16px; overflow: hidden; }
        .sa-table { width: 100%; border-collapse: collapse; }
        .sa-table th { padding: 14px 16px; text-align: left; font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: rgba(165,180,252,0.4); border-bottom: 1px solid rgba(99,102,241,0.1); background: rgba(99,102,241,0.04); }
        .sa-table td { padding: 14px 16px; font-size: 13px; color: rgba(240,244,255,0.7); border-bottom: 1px solid rgba(99,102,241,0.06); vertical-align: middle; }
        .sa-table tr:last-child td { border-bottom: none; }
        .sa-table tr:hover td { background: rgba(99,102,241,0.05); }
        .sa-table-name { font-weight: 600; color: #fff; margin-bottom: 2px; }
        .sa-table-sub { font-size: 11px; color: rgba(240,244,255,0.35); }
        .sa-btn-sm { padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 500; cursor: pointer; transition: all 0.2s; border: none; }
        .sa-btn-indigo { background: rgba(99,102,241,0.15); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.3); }
        .sa-btn-indigo:hover { background: #6366f1; color: #fff; }
        .sa-btn-green { background: rgba(34,197,94,0.15); color: #86efac; border: 1px solid rgba(34,197,94,0.3); }
        .sa-btn-green:hover { background: #22c55e; color: #fff; }
        .sa-btn-red { background: rgba(239,68,68,0.15); color: #fca5a5; border: 1px solid rgba(239,68,68,0.3); }
        .sa-btn-red:hover { background: #ef4444; color: #fff; }
        .sa-btn-yellow { background: rgba(245,158,11,0.15); color: #fcd34d; border: 1px solid rgba(245,158,11,0.3); }
        .sa-btn-yellow:hover { background: #f59e0b; color: #fff; }
        .sa-add-btn { padding: 10px 20px; background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; border: none; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; margin-bottom: 20px; transition: opacity 0.2s; }
        .sa-add-btn:hover { opacity: 0.88; }
        .sa-search { width: 100%; max-width: 320px; background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.2); border-radius: 10px; padding: 10px 14px; font-size: 13px; color: #fff; outline: none; margin-bottom: 20px; font-family: 'Inter', sans-serif; }
        .sa-search:focus { border-color: #6366f1; }
        .sa-search::placeholder { color: rgba(240,244,255,0.2); }
        .sa-empty { padding: 48px; text-align: center; color: rgba(240,244,255,0.25); font-size: 14px; }
        .sa-color-dot { width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.2); flex-shrink: 0; display: inline-block; }
        .sa-subdomain { font-size: 11px; color: #a5b4fc; font-family: monospace; }

        /* MODAL */
        .sa-modal-backdrop { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 24px; }
        .sa-modal { background: #0d0f1e; border: 1px solid rgba(99,102,241,0.2); border-radius: 20px; width: 100%; max-width: 620px; max-height: 88vh; overflow-y: auto; }
        .sa-modal-head { padding: 24px; border-bottom: 1px solid rgba(99,102,241,0.1); display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; background: #0d0f1e; z-index: 5; }
        .sa-modal-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 18px; color: #fff; }
        .sa-modal-close { background: rgba(99,102,241,0.1); border: none; color: rgba(240,244,255,0.5); width: 32px; height: 32px; border-radius: 8px; cursor: pointer; font-size: 14px; }
        .sa-modal-body { padding: 24px; }
        .sa-modal-section { margin-bottom: 20px; }
        .sa-modal-section-title { font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: rgba(165,180,252,0.4); margin-bottom: 14px; }
        .sa-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .sa-form-field { margin-bottom: 14px; }
        .sa-form-label { display: block; font-size: 12px; font-weight: 500; color: rgba(240,244,255,0.4); margin-bottom: 6px; }
        .sa-form-input { width: 100%; background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.2); border-radius: 10px; padding: 11px 14px; font-size: 13px; color: #fff; outline: none; font-family: 'Inter', sans-serif; transition: border-color 0.2s; }
        .sa-form-input:focus { border-color: #6366f1; }
        .sa-form-input::placeholder { color: rgba(240,244,255,0.2); }
        .sa-form-select { width: 100%; background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.2); border-radius: 10px; padding: 11px 14px; font-size: 13px; color: #fff; outline: none; font-family: 'Inter', sans-serif; }
        .sa-form-error { font-size: 12px; color: #fca5a5; padding: 10px; background: rgba(239,68,68,0.1); border-radius: 8px; margin-bottom: 12px; }
        .sa-form-btn { width: 100%; padding: 13px; background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
        .sa-form-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .sa-preview { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: rgba(99,102,241,0.06); border: 1px solid rgba(99,102,241,0.15); border-radius: 12px; margin-bottom: 16px; }
        .sa-preview-color { width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0; }
        .sa-preview-url { font-size: 12px; color: rgba(165,180,252,0.7); font-family: monospace; }

        @media (max-width: 768px) {
          .sa-root { flex-direction: column; }
          .sa-sidebar { width: 100%; height: auto; position: relative; }
          .sa-main { padding: 16px; }
          .sa-form-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="sa-root">
        {/* SIDEBAR */}
        <aside className="sa-sidebar">
          <div className="sa-sidebar-logo">
            <div className="sa-sidebar-logo-icon">⚡</div>
            <div>
              <div className="sa-sidebar-logo-text">Bdelivery</div>
              <div className="sa-sidebar-logo-sub">Super Admin</div>
            </div>
          </div>
          {[
            { id:'overview', icon:'📊', label:'Overview' },
            { id:'tenants',  icon:'🏢', label:'Tenants' },
          ].map(tab => (
            <div key={tab.id} className={`sa-nav-item${activeTab === tab.id ? ' active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              <span>{tab.icon}</span>{tab.label}
            </div>
          ))}
          <div className="sa-sidebar-bottom">
            <div style={{ fontSize:11, color:'rgba(165,180,252,0.4)', marginBottom:8 }}>{superAdmin?.email}</div>
            <button className="sa-logout-btn" onClick={handleLogout}>Sign Out</button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="sa-main">

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <div className="sa-page-title">Platform Overview</div>
              {loading ? <div className="sa-empty">Loading...</div> : (
                <>
                  <div className="sa-stats">
                    {[
                      { label:'Total Tenants',    value: stats?.totalTenants || 0,     icon:'🏢' },
                      { label:'Active',           value: stats?.activeTenants || 0,    icon:'✅' },
                      { label:'On Trial',         value: stats?.trialTenants || 0,     icon:'⏳' },
                      { label:'Suspended',        value: stats?.suspendedTenants || 0, icon:'🚫' },
                      { label:'Total Orders',     value: stats?.totalOrders || 0,      icon:'📦' },
                      { label:'Platform Revenue', value: `GHS ${stats?.platformRevenue || 0}`, icon:'💰' },
                    ].map(s => (
                      <div key={s.label} className="sa-stat" style={{ borderTop:'2px solid #6366f1' }}>
                        <div className="sa-stat-icon">{s.icon}</div>
                        <div className="sa-stat-num">{s.value}</div>
                        <div className="sa-stat-label">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, color:'#fff', marginBottom:16 }}>All Tenants</div>
                  <div className="sa-table-wrap">
                    <table className="sa-table">
                      <thead><tr><th>Business</th><th>Subdomain</th><th>Plan</th><th>Status</th><th>Created</th></tr></thead>
                      <tbody>
                        {tenants.map(t => (
                          <tr key={t._id}>
                            <td>
                              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                <div className="sa-color-dot" style={{ background: t.brandColor }} />
                                <div className="sa-table-name">{t.businessName}</div>
                              </div>
                            </td>
                            <td><span className="sa-subdomain">{t.subdomain}.bdelivery.com</span></td>
                            <td><Badge label={t.plan} colors={PLAN_COLORS[t.plan] || PLAN_COLORS.trial} /></td>
                            <td><Badge label={t.status} colors={STATUS_COLORS[t.status] || STATUS_COLORS.trial} /></td>
                            <td style={{ fontSize:11, color:'rgba(240,244,255,0.35)' }}>{new Date(t.createdAt).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {tenants.length === 0 && <div className="sa-empty">No tenants yet.</div>}
                  </div>
                </>
              )}
            </div>
          )}

          {/* TENANTS */}
          {activeTab === 'tenants' && (
            <div>
              <div className="sa-page-title">Manage Tenants</div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:12 }}>
                <input className="sa-search" placeholder="Search tenants..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom:0 }} />
                <button className="sa-add-btn" onClick={openCreate}>+ Onboard New Client</button>
              </div>
              <div className="sa-table-wrap">
                <table className="sa-table">
                  <thead>
                    <tr><th>Business</th><th>Subdomain</th><th>Admin Email</th><th>Plan</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredTenants.map(t => (
                      <tr key={t._id}>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div className="sa-color-dot" style={{ background: t.brandColor }} />
                            <div>
                              <div className="sa-table-name">{t.businessName}</div>
                              <div className="sa-table-sub">{t.phone || t.email || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="sa-subdomain">{t.subdomain}.bdelivery.com</span></td>
                        <td><span style={{ fontSize:12 }}>{t.adminEmail}</span></td>
                        <td><Badge label={t.plan} colors={PLAN_COLORS[t.plan] || PLAN_COLORS.trial} /></td>
                        <td><Badge label={t.status} colors={STATUS_COLORS[t.status] || STATUS_COLORS.trial} /></td>
                        <td>
                          <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                            <button className="sa-btn-sm sa-btn-indigo" onClick={() => openEdit(t)}>Edit</button>
                            {t.status === 'active' || t.status === 'trial'
                              ? <button className="sa-btn-sm sa-btn-yellow" onClick={() => handleStatus(t._id, 'suspended')}>Suspend</button>
                              : <button className="sa-btn-sm sa-btn-green" onClick={() => handleStatus(t._id, 'active')}>Activate</button>
                            }
                            <button className="sa-btn-sm sa-btn-red" onClick={() => handleDelete(t._id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredTenants.length === 0 && <div className="sa-empty">No tenants found.</div>}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* TENANT MODAL */}
      {modal && (
        <div className="sa-modal-backdrop" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="sa-modal">
            <div className="sa-modal-head">
              <div className="sa-modal-title">{editTenant ? `Edit — ${editTenant.businessName}` : 'Onboard New Client'}</div>
              <button className="sa-modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="sa-modal-body">
              <form onSubmit={handleSubmit}>

                {/* Preview */}
                <div className="sa-preview">
                  <div className="sa-preview-color" style={{ background: form.brandColor || '#f97316' }} />
                  <div className="sa-preview-url">{form.subdomain || 'subdomain'}.bdelivery.com</div>
                </div>

                {/* Business Info */}
                <div className="sa-modal-section">
                  <div className="sa-modal-section-title">Business Info</div>
                  <div className="sa-form-grid">
                    <div className="sa-form-field">
                      <label className="sa-form-label">Business Name *</label>
                      <input className="sa-form-input" value={form.businessName} onChange={e => setForm({...form,businessName:e.target.value})} required placeholder="SwiftByGwyn" />
                    </div>
                    <div className="sa-form-field">
                      <label className="sa-form-label">Subdomain *</label>
                      <input className="sa-form-input" value={form.subdomain} onChange={e => setForm({...form,subdomain:e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'')})} required placeholder="swiftbygwyn" disabled={!!editTenant} />
                    </div>
                    <div className="sa-form-field">
                      <label className="sa-form-label">Brand Color</label>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        <input type="color" value={form.brandColor} onChange={e => setForm({...form,brandColor:e.target.value})} style={{ width:44, height:40, border:'none', background:'none', cursor:'pointer', borderRadius:8 }} />
                        <input className="sa-form-input" value={form.brandColor} onChange={e => setForm({...form,brandColor:e.target.value})} placeholder="#f97316" style={{ flex:1 }} />
                      </div>
                    </div>
                    <div className="sa-form-field">
                      <label className="sa-form-label">Plan</label>
                      <select className="sa-form-select" value={form.plan} onChange={e => setForm({...form,plan:e.target.value})}>
                        <option value="trial">Trial</option>
                        <option value="starter">Starter</option>
                        <option value="growth">Growth</option>
                        <option value="pro">Pro</option>
                      </select>
                    </div>
                    <div className="sa-form-field">
                      <label className="sa-form-label">WhatsApp</label>
                      <input className="sa-form-input" value={form.whatsapp} onChange={e => setForm({...form,whatsapp:e.target.value})} placeholder="233244000000" />
                    </div>
                    <div className="sa-form-field">
                      <label className="sa-form-label">Email</label>
                      <input className="sa-form-input" type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} placeholder="info@swiftbygwyn.com" />
                    </div>
                    <div className="sa-form-field">
                      <label className="sa-form-label">Phone</label>
                      <input className="sa-form-input" value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} placeholder="0244000000" />
                    </div>
                    <div className="sa-form-field">
                      <label className="sa-form-label">Coverage Area</label>
                      <input className="sa-form-input" value={form.coverageArea} onChange={e => setForm({...form,coverageArea:e.target.value})} placeholder="Greater Accra Region" />
                    </div>
                  </div>
                </div>

                {/* Delivery Fees */}
                <div className="sa-modal-section">
                  <div className="sa-modal-section-title">Delivery Fees (GHS)</div>
                  <div className="sa-form-grid">
                    {[
                      { label:'Standard', key:'standardFee' },
                      { label:'Same-Day', key:'sameDayFee' },
                      { label:'Express',  key:'expressFee' },
                      { label:'Scheduled',key:'scheduledFee' },
                    ].map(f => (
                      <div key={f.key} className="sa-form-field">
                        <label className="sa-form-label">{f.label}</label>
                        <input type="number" className="sa-form-input" value={form[f.key]} onChange={e => setForm({...form,[f.key]:Number(e.target.value)})} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Admin Credentials */}
                <div className="sa-modal-section">
                  <div className="sa-modal-section-title">Admin Login Credentials</div>
                  <div className="sa-form-grid">
                    <div className="sa-form-field">
                      <label className="sa-form-label">Admin Email *</label>
                      <input type="email" className="sa-form-input" value={form.adminEmail} onChange={e => setForm({...form,adminEmail:e.target.value})} required placeholder="admin@swiftbygwyn.com" />
                    </div>
                    <div className="sa-form-field">
                      <label className="sa-form-label">{editTenant ? 'New Password (leave blank to keep)' : 'Admin Password *'}</label>
                      <input type="password" className="sa-form-input" value={form.adminPassword} onChange={e => setForm({...form,adminPassword:e.target.value})} required={!editTenant} placeholder="Minimum 6 characters" minLength={editTenant ? 0 : 6} />
                    </div>
                  </div>
                </div>

                {formError && <div className="sa-form-error">✕ {formError}</div>}
                <button className="sa-form-btn" type="submit" disabled={formLoading}>
                  {formLoading ? 'Saving...' : editTenant ? 'Save Changes' : 'Create Tenant & Go Live'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}