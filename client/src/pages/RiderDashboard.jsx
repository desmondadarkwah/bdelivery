import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRiderAuth } from '../context/RiderAuthContext'
import { getRiderOrders, updateOrderStatus, uploadProof, getRiderMe, getAvailableOrders, selfAssignOrder } from '../utils/api'
import RiderMap from '../components/RiderMap'

const STATUS_LABELS = {
  received: 'Order Received', assigned: 'Assigned to You',
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

const DELIVERY_TYPE_LABELS = {
  standard: 'Standard', 'same-day': 'Same-Day',
  express: 'Express 🚀', scheduled: 'Scheduled 📅',
}

const NEXT_ACTION = {
  assigned:    { label:'✅ Accept Delivery',    next:'accepted',   btn:'rd-btn-orange' },
  accepted:    { label:'📦 Mark as Picked Up',  next:'picked-up',  btn:'rd-btn-orange' },
  'picked-up': { label:'🚀 Mark as In Transit', next:'in-transit', btn:'rd-btn-blue' },
}

export default function RiderDashboard() {
  const { rider, logout } = useRiderAuth()
  const navigate = useNavigate()
  const [orders, setOrders]               = useState([])
  const [availableOrders, setAvailableOrders] = useState([])
  const [riderInfo, setRiderInfo]         = useState(null)
  const [loading, setLoading]             = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [activeTab, setActiveTab]         = useState('available')
  const [proofPhoto, setProofPhoto]       = useState(null)
  const [proofName, setProofName]         = useState('')
  const [proofLoading, setProofLoading]   = useState(false)
  const [proofError, setProofError]       = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [acceptLoading, setAcceptLoading] = useState(null)

  useEffect(() => {
    loadAll()
    const interval = setInterval(() => { loadAll() }, 15000)
    return () => clearInterval(interval)
  }, [])

  const loadAll = async () => {
    try {
      const [o, r, a] = await Promise.all([getRiderOrders(), getRiderMe(), getAvailableOrders()])
      setOrders(o); setRiderInfo(r); setAvailableOrders(a)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleStatusUpdate = async (orderId, status) => {
    setActionLoading(true)
    try {
      await updateOrderStatus(orderId, status)
      await loadAll()
      setSelectedOrder(prev => prev ? { ...prev, status } : null)
    } catch(e) { alert(e.response?.data?.error || 'Failed to update status') }
    finally { setActionLoading(false) }
  }

  const handleAcceptOrder = async (orderId) => {
    setAcceptLoading(orderId)
    try {
      await selfAssignOrder(orderId)
      await loadAll()
      setSelectedOrder(null)
      setActiveTab('active')
    } catch(e) { alert(e.response?.data?.error || 'Failed to accept order. It may have been taken by another rider.') }
    finally { setAcceptLoading(null) }
  }

  const handleProofSubmit = async () => {
    if (!proofPhoto && !proofName.trim()) { setProofError('Please enter recipient name or upload a delivery photo.'); return }
    setProofLoading(true); setProofError('')
    try {
      const fd = new FormData()
      if (proofPhoto) fd.append('proofPhoto', proofPhoto)
      if (proofName) fd.append('proofRecipientName', proofName)
      await uploadProof(selectedOrder._id, fd)
      await loadAll()
      setSelectedOrder(null); setProofPhoto(null); setProofName('')
    } catch(e) { setProofError(e.response?.data?.error || 'Failed to submit proof. Try again.') }
    finally { setProofLoading(false) }
  }

  const handleLogout = () => { logout(); navigate('/rider/login') }

  const activeOrders    = orders.filter(o => !['delivered','cancelled'].includes(o.status))
  const completedOrders = orders.filter(o => o.status === 'delivered')
  const urgentOrders    = availableOrders.filter(o => o.deliveryType === 'express')

  const displayOrders = activeTab === 'available' ? availableOrders
    : activeTab === 'active' ? activeOrders
    : completedOrders

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .rd-root { min-height: 100vh; background: #0b0f1a; font-family: 'Inter', sans-serif; color: #f0f4ff; }
        .rd-topbar { background: rgba(11,15,26,0.95); border-bottom: 1px solid rgba(255,255,255,0.07); padding: 0 20px; height: 62px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 50; backdrop-filter: blur(12px); }
        .rd-topbar-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 17px; color: #fff; display: flex; align-items: center; gap: 8px; }
        .rd-topbar-logo-icon { width: 32px; height: 32px; background: #f97316; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
        .rd-topbar-right { display: flex; align-items: center; gap: 10px; }
        .rd-rider-badge { display: flex; align-items: center; gap: 6px; background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.2); border-radius: 100px; padding: 4px 12px; }
        .rd-rider-dot { width: 6px; height: 6px; background: #22c55e; border-radius: 50%; animation: rdPulse 2s infinite; }
        @keyframes rdPulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
        .rd-rider-name { font-size: 12px; font-weight: 500; color: rgba(240,244,255,0.7); }
        .rd-logout { padding: 7px 14px; background: transparent; color: rgba(240,244,255,0.3); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; font-size: 12px; cursor: pointer; transition: all 0.2s; }
        .rd-logout:hover { border-color: #f97316; color: #f97316; }
        .rd-main { max-width: 680px; margin: 0 auto; padding: 24px 16px 80px; }

        .rd-urgent { background: linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.06)); border: 1px solid rgba(239,68,68,0.25); border-radius: 14px; padding: 14px 18px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px; }
        .rd-urgent-icon { font-size: 22px; flex-shrink: 0; }
        .rd-urgent-text { font-size: 13px; font-weight: 600; color: #fca5a5; }
        .rd-urgent-sub { font-size: 11px; color: rgba(240,244,255,0.35); margin-top: 2px; }

        .rd-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
        .rd-stat { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 14px 12px; text-align: center; }
        .rd-stat-num { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; color: #f97316; line-height: 1; margin-bottom: 4px; }
        .rd-stat-label { font-size: 10px; color: rgba(240,244,255,0.3); letter-spacing: 0.04em; text-transform: uppercase; }

        .rd-tabs { display: flex; gap: 6px; margin-bottom: 18px; overflow-x: auto; scrollbar-width: none; }
        .rd-tabs::-webkit-scrollbar { display: none; }
        .rd-tab { padding: 8px 16px; border-radius: 100px; font-size: 12px; font-weight: 500; cursor: pointer; border: 1px solid rgba(255,255,255,0.08); background: transparent; color: rgba(240,244,255,0.4); transition: all 0.2s; white-space: nowrap; flex-shrink: 0; }
        .rd-tab.active { background: #f97316; color: #fff; border-color: #f97316; }
        .rd-tab.new-tab { border-color: rgba(34,197,94,0.3); color: rgba(134,239,172,0.7); }
        .rd-tab.new-tab.active { background: #22c55e; border-color: #22c55e; color: #fff; }

        /* AVAILABLE ORDER CARD */
        .rd-available-card { background: rgba(34,197,94,0.04); border: 1.5px solid rgba(34,197,94,0.2); border-radius: 16px; padding: 18px; margin-bottom: 10px; transition: all 0.2s; }
        .rd-available-card:hover { border-color: rgba(34,197,94,0.4); background: rgba(34,197,94,0.07); }
        .rd-available-card.express { border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.05); }
        .rd-available-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; gap: 10px; }
        .rd-available-id { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: #22c55e; }
        .rd-available-type { font-size: 10px; color: rgba(240,244,255,0.3); margin-top: 3px; }
        .rd-new-badge { background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.3); color: #86efac; padding: 3px 10px; border-radius: 100px; font-size: 10px; font-weight: 700; letter-spacing: 0.06em; white-space: nowrap; }
        .rd-express-badge { background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5; padding: 3px 10px; border-radius: 100px; font-size: 10px; font-weight: 700; letter-spacing: 0.06em; white-space: nowrap; }

        .rd-order-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 18px; margin-bottom: 10px; cursor: pointer; transition: all 0.2s; }
        .rd-order-card:hover { border-color: rgba(249,115,22,0.3); background: rgba(255,255,255,0.04); }
        .rd-order-card.urgent { border-color: rgba(239,68,68,0.3); }
        .rd-order-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; gap: 10px; }
        .rd-order-id { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: #f97316; line-height: 1; }
        .rd-order-type { font-size: 10px; color: rgba(240,244,255,0.3); margin-top: 3px; }
        .rd-status-badge { padding: 4px 12px; border-radius: 100px; font-size: 11px; font-weight: 600; white-space: nowrap; flex-shrink: 0; }

        .rd-route { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; padding: 12px; background: rgba(255,255,255,0.02); border-radius: 10px; }
        .rd-route-item { display: flex; align-items: flex-start; gap: 10px; }
        .rd-route-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
        .rd-route-dot.pickup { background: #f97316; }
        .rd-route-dot.dropoff { background: #22c55e; }
        .rd-route-label { font-size: 10px; color: rgba(240,244,255,0.3); margin-bottom: 1px; text-transform: uppercase; letter-spacing: 0.04em; }
        .rd-route-text { font-size: 13px; color: rgba(240,244,255,0.75); font-weight: 500; }

        .rd-order-footer { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
        .rd-order-meta { display: flex; gap: 12px; flex-wrap: wrap; }
        .rd-meta-item { font-size: 11px; color: rgba(240,244,255,0.35); }
        .rd-meta-item span { color: rgba(240,244,255,0.65); font-weight: 500; }
        .rd-quick-action { padding: 7px 14px; background: #f97316; color: #fff; border: none; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: opacity 0.2s; }
        .rd-quick-action:hover { opacity: 0.88; }
        .rd-accept-btn { padding: 10px 20px; background: #22c55e; color: #fff; border: none; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; width: 100%; margin-top: 12px; }
        .rd-accept-btn:hover:not(:disabled) { opacity: 0.88; }
        .rd-accept-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .rd-accept-btn.express-btn { background: linear-gradient(135deg, #ef4444, #dc2626); }

        .rd-empty { padding: 56px 0; text-align: center; color: rgba(240,244,255,0.25); }
        .rd-empty-icon { font-size: 40px; margin-bottom: 12px; }
        .rd-empty-text { font-size: 14px; line-height: 1.6; }

        /* MODAL */
        .rd-modal-backdrop { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); display: flex; align-items: flex-end; justify-content: center; }
        .rd-modal { background: #0f1525; border: 1px solid rgba(255,255,255,0.1); border-top: 2px solid #f97316; border-radius: 20px 20px 0 0; width: 100%; max-width: 620px; max-height: 92vh; overflow-y: auto; padding-bottom: 40px; }
        .rd-modal-head { padding: 18px 20px 14px; border-bottom: 1px solid rgba(255,255,255,0.07); display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; background: #0f1525; z-index: 5; }
        .rd-modal-id { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; color: #f97316; }
        .rd-modal-status { font-size: 11px; color: rgba(240,244,255,0.35); margin-top: 2px; }
        .rd-modal-close { background: rgba(255,255,255,0.06); border: none; color: rgba(240,244,255,0.5); width: 32px; height: 32px; border-radius: 8px; cursor: pointer; font-size: 14px; flex-shrink: 0; }
        .rd-modal-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
        .rd-section { }
        .rd-section-title { font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(240,244,255,0.25); margin-bottom: 10px; }
        .rd-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .rd-info-item { background: rgba(255,255,255,0.03); border-radius: 10px; padding: 12px; }
        .rd-info-label { font-size: 10px; color: rgba(240,244,255,0.3); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.04em; }
        .rd-info-value { font-size: 13px; color: #f0f4ff; font-weight: 500; }
        .rd-contact-card { background: rgba(249,115,22,0.05); border: 1px solid rgba(249,115,22,0.15); border-radius: 12px; padding: 14px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .rd-contact-label { font-size: 10px; color: rgba(240,244,255,0.3); margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.04em; }
        .rd-contact-name { font-size: 14px; font-weight: 600; color: #fff; }
        .rd-contact-phone { font-size: 12px; color: #f97316; margin-top: 2px; }
        .rd-call-btn { padding: 8px 16px; background: rgba(249,115,22,0.15); border: 1px solid rgba(249,115,22,0.3); border-radius: 8px; color: #f97316; font-size: 12px; font-weight: 600; text-decoration: none; white-space: nowrap; transition: all 0.2s; flex-shrink: 0; }
        .rd-call-btn:hover { background: #f97316; color: #fff; }
        .rd-maps-btn { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 13px; background: rgba(59,130,246,0.12); color: #93c5fd; border: 1px solid rgba(59,130,246,0.25); border-radius: 12px; text-decoration: none; font-size: 14px; font-weight: 600; transition: all 0.2s; }
        .rd-maps-btn:hover { background: #3b82f6; color: #fff; }
        .rd-action-section { background: rgba(249,115,22,0.05); border: 1px solid rgba(249,115,22,0.15); border-radius: 14px; padding: 18px; }
        .rd-action-title { font-size: 13px; font-weight: 600; color: rgba(240,244,255,0.5); margin-bottom: 12px; }
        .rd-btn { padding: 13px 20px; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; width: 100%; text-align: center; }
        .rd-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .rd-btn-orange { background: #f97316; color: #fff; }
        .rd-btn-orange:hover:not(:disabled) { opacity: 0.88; }
        .rd-btn-blue { background: rgba(59,130,246,0.2); color: #93c5fd; border: 1px solid rgba(59,130,246,0.3); }
        .rd-btn-blue:hover:not(:disabled) { background: #3b82f6; color: #fff; }
        .rd-btn-green { background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff; }
        .rd-btn-green:hover:not(:disabled) { opacity: 0.9; }
        .rd-proof-section { background: rgba(34,197,94,0.05); border: 1px solid rgba(34,197,94,0.2); border-radius: 14px; padding: 18px; }
        .rd-proof-title { font-size: 14px; font-weight: 600; color: #86efac; margin-bottom: 14px; }
        .rd-proof-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); border-radius: 10px; padding: 12px 14px; font-size: 13px; color: #fff; outline: none; font-family: 'Inter', sans-serif; margin-bottom: 10px; transition: border-color 0.2s; }
        .rd-proof-input:focus { border-color: #22c55e; }
        .rd-proof-input::placeholder { color: rgba(240,244,255,0.2); }
        .rd-file-zone { width: 100%; padding: 16px; background: rgba(255,255,255,0.03); border: 1.5px dashed rgba(255,255,255,0.12); border-radius: 10px; color: rgba(240,244,255,0.35); font-size: 13px; cursor: pointer; text-align: center; margin-bottom: 12px; transition: all 0.2s; }
        .rd-file-zone.has-file { border-color: rgba(34,197,94,0.3); color: #86efac; background: rgba(34,197,94,0.04); }
        .rd-proof-error { font-size: 12px; color: #fca5a5; padding: 10px 12px; background: rgba(239,68,68,0.1); border-radius: 8px; margin-bottom: 10px; }
        .rd-delivered-box { background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.2); border-radius: 14px; padding: 20px; text-align: center; }
        .rd-delivered-icon { font-size: 36px; margin-bottom: 8px; }
        .rd-delivered-text { font-size: 15px; font-weight: 600; color: #86efac; }
        .rd-delivered-sub { font-size: 12px; color: rgba(240,244,255,0.35); margin-top: 4px; }
        .mapboxgl-popup-content { background: #0f1525 !important; color: #f0f4ff !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 10px !important; padding: 10px 14px !important; }
      `}</style>

      <div className="rd-root">
        <nav className="rd-topbar">
          <div className="rd-topbar-logo">
            <div className="rd-topbar-logo-icon">🏍️</div>
            SwiftByGwyn
          </div>
          <div className="rd-topbar-right">
            <div className="rd-rider-badge">
              <div className="rd-rider-dot" />
              <span className="rd-rider-name">{riderInfo?.name || rider?.name || 'Rider'}</span>
            </div>
            <button className="rd-logout" onClick={handleLogout}>Sign Out</button>
          </div>
        </nav>

        <main className="rd-main">
          {/* Urgent Alert */}
          {urgentOrders.length > 0 && (
            <div className="rd-urgent">
              <div className="rd-urgent-icon">🚨</div>
              <div>
                <div className="rd-urgent-text">{urgentOrders.length} Express order{urgentOrders.length > 1 ? 's' : ''} available — needs immediate pickup!</div>
                <div className="rd-urgent-sub">Express orders are time-sensitive — tap Available Orders to accept</div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="rd-stats">
            <div className="rd-stat">
              <div className="rd-stat-num" style={{ color:'#22c55e' }}>{availableOrders.length}</div>
              <div className="rd-stat-label">Available</div>
            </div>
            <div className="rd-stat">
              <div className="rd-stat-num">{activeOrders.length}</div>
              <div className="rd-stat-label">Active</div>
            </div>
            <div className="rd-stat">
              <div className="rd-stat-num">{completedOrders.length}</div>
              <div className="rd-stat-label">Today</div>
            </div>
            <div className="rd-stat">
              <div className="rd-stat-num">{riderInfo?.totalDeliveries || 0}</div>
              <div className="rd-stat-label">All Time</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="rd-tabs">
            <button className={`rd-tab new-tab${activeTab === 'available' ? ' active' : ''}`} onClick={() => setActiveTab('available')}>
              🟢 Available {availableOrders.length > 0 && `(${availableOrders.length})`}
            </button>
            <button className={`rd-tab${activeTab === 'active' ? ' active' : ''}`} onClick={() => setActiveTab('active')}>
              Active {activeOrders.length > 0 && `(${activeOrders.length})`}
            </button>
            <button className={`rd-tab${activeTab === 'completed' ? ' active' : ''}`} onClick={() => setActiveTab('completed')}>
              Completed {completedOrders.length > 0 && `(${completedOrders.length})`}
            </button>
          </div>

          {/* Orders List */}
          {loading ? (
            <div className="rd-empty"><div className="rd-empty-icon">⏳</div><div className="rd-empty-text">Loading...</div></div>
          ) : activeTab === 'available' ? (
            availableOrders.length === 0 ? (
              <div className="rd-empty">
                <div className="rd-empty-icon">🏍️</div>
                <div className="rd-empty-text">No available orders right now.<br />New orders will appear here automatically.</div>
              </div>
            ) : (
              availableOrders.map(order => {
                const isExpress = order.deliveryType === 'express'
                return (
                  <div key={order._id} className={`rd-available-card${isExpress ? ' express' : ''}`}>
                    <div className="rd-available-head">
                      <div>
                        <div className="rd-available-id">{order.orderID}</div>
                        <div className="rd-available-type">{DELIVERY_TYPE_LABELS[order.deliveryType]}</div>
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
                        {isExpress
                          ? <span className="rd-express-badge">🚀 EXPRESS</span>
                          : <span className="rd-new-badge">🟢 NEW</span>
                        }
                        <span style={{ fontSize:11, color:'#f97316', fontWeight:700 }}>GHS {order.deliveryFee}</span>
                      </div>
                    </div>
                    <div className="rd-route">
                      <div className="rd-route-item">
                        <div className="rd-route-dot pickup" />
                        <div><div className="rd-route-label">Pickup</div><div className="rd-route-text">{order.pickupLocation}</div></div>
                      </div>
                      <div className="rd-route-item">
                        <div className="rd-route-dot dropoff" />
                        <div><div className="rd-route-label">Drop-off</div><div className="rd-route-text">{order.dropoffLocation}</div></div>
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8, flexWrap:'wrap', gap:8 }}>
                      <div className="rd-order-meta">
                        <div className="rd-meta-item">Package: <span>{order.packageDescription?.substring(0,30)}{order.packageDescription?.length > 30 ? '...' : ''}</span></div>
                        {order.distance > 0 && <div className="rd-meta-item">Distance: <span>{order.distance} km</span></div>}
                      </div>
                    </div>
                    <button
                      className={`rd-accept-btn${isExpress ? ' express-btn' : ''}`}
                      onClick={() => handleAcceptOrder(order._id)}
                      disabled={acceptLoading === order._id}
                    >
                      {acceptLoading === order._id ? 'Accepting...' : isExpress ? '🚀 Accept Express Delivery' : '✅ Accept This Delivery'}
                    </button>
                  </div>
                )
              })
            )
          ) : displayOrders.length === 0 ? (
            <div className="rd-empty">
              <div className="rd-empty-icon">{activeTab === 'active' ? '📦' : '🎉'}</div>
              <div className="rd-empty-text">{activeTab === 'active' ? 'No active deliveries.' : 'No completed deliveries yet.'}</div>
            </div>
          ) : (
            displayOrders.map(order => {
              const sc = STATUS_COLORS[order.status] || STATUS_COLORS.received
              const nextAction = NEXT_ACTION[order.status]
              const isUrgent = order.deliveryType === 'express'
              return (
                <div key={order._id} className={`rd-order-card${isUrgent ? ' urgent' : ''}`} onClick={() => setSelectedOrder(order)}>
                  <div className="rd-order-head">
                    <div>
                      <div className="rd-order-id">{order.orderID}</div>
                      <div className="rd-order-type">{DELIVERY_TYPE_LABELS[order.deliveryType]}</div>
                    </div>
                    <span className="rd-status-badge" style={{ background:sc.bg, color:sc.color }}>{STATUS_LABELS[order.status]}</span>
                  </div>
                  <div className="rd-route">
                    <div className="rd-route-item">
                      <div className="rd-route-dot pickup" />
                      <div><div className="rd-route-label">Pickup</div><div className="rd-route-text">{order.pickupLocation}</div></div>
                    </div>
                    <div className="rd-route-item">
                      <div className="rd-route-dot dropoff" />
                      <div><div className="rd-route-label">Drop-off</div><div className="rd-route-text">{order.dropoffLocation}</div></div>
                    </div>
                  </div>
                  <div className="rd-order-footer">
                    <div className="rd-order-meta">
                      <div className="rd-meta-item">Recipient: <span>{order.recipientName}</span></div>
                      <div className="rd-meta-item">Fee: <span style={{ color:'#f97316' }}>GHS {order.deliveryFee}</span></div>
                    </div>
                    {nextAction && (
                      <button className="rd-quick-action" onClick={e => { e.stopPropagation(); handleStatusUpdate(order._id, nextAction.next) }}>
                        {nextAction.label}
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </main>
      </div>

      {/* ORDER DETAIL MODAL */}
      {selectedOrder && (
        <div className="rd-modal-backdrop" onClick={e => e.target === e.currentTarget && setSelectedOrder(null)}>
          <div className="rd-modal">
            <div className="rd-modal-head">
              <div>
                <div className="rd-modal-id">{selectedOrder.orderID}</div>
                <div className="rd-modal-status">{DELIVERY_TYPE_LABELS[selectedOrder.deliveryType]} · {STATUS_LABELS[selectedOrder.status]}</div>
              </div>
              <button className="rd-modal-close" onClick={() => setSelectedOrder(null)}>✕</button>
            </div>

            <div className="rd-modal-body">
              {/* ROUTE + MAP */}
              <div className="rd-section">
                <div className="rd-section-title">Route & Navigation</div>
                <div className="rd-info-grid" style={{ marginBottom:12 }}>
                  <div className="rd-info-item">
                    <div className="rd-info-label">📍 Pickup</div>
                    <div className="rd-info-value">{selectedOrder.pickupLocation}</div>
                  </div>
                  <div className="rd-info-item">
                    <div className="rd-info-label">🎯 Drop-off</div>
                    <div className="rd-info-value">{selectedOrder.dropoffLocation}</div>
                  </div>
                </div>
                <RiderMap
                  pickup={selectedOrder.pickupLocation}
                  dropoff={selectedOrder.dropoffLocation}
                  pickupCoords={selectedOrder.pickupCoords}
                  dropoffCoords={selectedOrder.dropoffCoords}
                />
                <a href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(selectedOrder.pickupLocation + ' Ghana')}&destination=${encodeURIComponent(selectedOrder.dropoffLocation + ' Ghana')}`} target="_blank" rel="noreferrer" className="rd-maps-btn" style={{ marginTop:10 }}>
                  🗺️ Open Google Maps Navigation
                </a>
              </div>

              {/* CONTACTS */}
              <div className="rd-section">
                <div className="rd-section-title">Contacts</div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  <div className="rd-contact-card">
                    <div>
                      <div className="rd-contact-label">Sender</div>
                      <div className="rd-contact-name">{selectedOrder.customerName}</div>
                      <div className="rd-contact-phone">{selectedOrder.customerPhone}</div>
                    </div>
                    <a href={`tel:${selectedOrder.customerPhone}`} className="rd-call-btn">📞 Call</a>
                  </div>
                  <div className="rd-contact-card">
                    <div>
                      <div className="rd-contact-label">Recipient</div>
                      <div className="rd-contact-name">{selectedOrder.recipientName}</div>
                      <div className="rd-contact-phone">{selectedOrder.recipientPhone}</div>
                    </div>
                    <a href={`tel:${selectedOrder.recipientPhone}`} className="rd-call-btn">📞 Call</a>
                  </div>
                </div>
              </div>

              {/* PACKAGE */}
              <div className="rd-section">
                <div className="rd-section-title">Package Info</div>
                <div className="rd-info-item" style={{ marginBottom:8 }}>
                  <div className="rd-info-label">What's being delivered</div>
                  <div className="rd-info-value">{selectedOrder.packageDescription}</div>
                </div>
                {selectedOrder.additionalNotes && (
                  <div className="rd-info-item" style={{ marginBottom:8 }}>
                    <div className="rd-info-label">Special Instructions</div>
                    <div className="rd-info-value">{selectedOrder.additionalNotes}</div>
                  </div>
                )}
                <div className="rd-info-grid">
                  <div className="rd-info-item">
                    <div className="rd-info-label">Payment Method</div>
                    <div className="rd-info-value" style={{ textTransform:'capitalize' }}>{selectedOrder.paymentMethod?.replace('-',' ')}</div>
                  </div>
                  <div className="rd-info-item">
                    <div className="rd-info-label">Delivery Fee</div>
                    <div className="rd-info-value" style={{ color:'#f97316' }}>GHS {selectedOrder.deliveryFee}</div>
                  </div>
                </div>
                {selectedOrder.deliveryType === 'scheduled' && selectedOrder.scheduledDate && (
                  <div className="rd-info-item" style={{ marginTop:8 }}>
                    <div className="rd-info-label">📅 Scheduled For</div>
                    <div className="rd-info-value" style={{ color:'#f97316' }}>{selectedOrder.scheduledDate} at {selectedOrder.scheduledTime}</div>
                  </div>
                )}
                {selectedOrder.packageImage && (
                  <img src={selectedOrder.packageImage} alt="Package" style={{ width:'100%', maxHeight:180, objectFit:'cover', borderRadius:10, marginTop:8 }} />
                )}
              </div>

              {/* STATUS ACTIONS */}
              {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && NEXT_ACTION[selectedOrder.status] && (
                <div className="rd-action-section">
                  <div className="rd-action-title">Update Delivery Status</div>
                  <button className={`rd-btn ${NEXT_ACTION[selectedOrder.status].btn}`} onClick={() => handleStatusUpdate(selectedOrder._id, NEXT_ACTION[selectedOrder.status].next)} disabled={actionLoading}>
                    {actionLoading ? 'Updating...' : NEXT_ACTION[selectedOrder.status].label}
                  </button>
                </div>
              )}

              {/* PROOF OF DELIVERY */}
              {selectedOrder.status === 'in-transit' && (
                <div className="rd-proof-section">
                  <div className="rd-proof-title">📸 Confirm Delivery</div>
                  <input className="rd-proof-input" placeholder="Who received the package? (Full name)" value={proofName} onChange={e => setProofName(e.target.value)} />
                  <div className={`rd-file-zone${proofPhoto ? ' has-file' : ''}`} onClick={() => document.getElementById('proof-img').click()}>
                    {proofPhoto ? `✅ ${proofPhoto.name}` : '📷 Upload delivery photo (optional but recommended)'}
                    <input id="proof-img" type="file" accept="image/*" style={{ display:'none' }} onChange={e => setProofPhoto(e.target.files[0])} />
                  </div>
                  {proofError && <div className="rd-proof-error">⚠️ {proofError}</div>}
                  <button className="rd-btn rd-btn-green" onClick={handleProofSubmit} disabled={proofLoading}>
                    {proofLoading ? 'Confirming...' : '✅ Mark as Delivered'}
                  </button>
                </div>
              )}

              {/* DELIVERED */}
              {selectedOrder.status === 'delivered' && (
                <div className="rd-delivered-box">
                  <div className="rd-delivered-icon">🎉</div>
                  <div className="rd-delivered-text">Delivery Completed!</div>
                  {selectedOrder.proofRecipientName && <div className="rd-delivered-sub">Received by: {selectedOrder.proofRecipientName}</div>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}