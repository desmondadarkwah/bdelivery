import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTenant } from '../context/TenantContext'
import { trackOrder } from '../utils/api'

const STATUS_STEPS = [
  { key: 'received',    label: 'Order Received',  icon: '📋', desc: 'Your order has been placed successfully.' },
  { key: 'assigned',    label: 'Rider Assigned',  icon: '🏍️', desc: 'A rider has been assigned to your delivery.' },
  { key: 'accepted',    label: 'Accepted',         icon: '✅', desc: 'Your rider has accepted the delivery.' },
  { key: 'picked-up',   label: 'Picked Up',        icon: '📦', desc: 'Your package has been picked up.' },
  { key: 'in-transit',  label: 'In Transit',       icon: '🚀', desc: 'Your package is on the way.' },
  { key: 'delivered',   label: 'Delivered',        icon: '🎉', desc: 'Your package has been delivered!' },
]

export default function TrackOrder() {
  const { orderID: paramID } = useParams()
  const navigate = useNavigate()
  const { tenant } = useTenant()

  const bizName    = tenant?.businessName || 'Bdelivery'
  const brandColor = tenant?.brandColor   || '#f97316'
  const logo       = tenant?.logo         || null

  const [orderID, setOrderID]   = useState(paramID || '')
  const [order, setOrder]       = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (paramID) { setOrderID(paramID); handleSearch(paramID) }
  }, [paramID])

  const handleSearch = async (id) => {
    const searchId = id || orderID
    if (!searchId.trim()) { setError('Please enter your Order ID.'); return }
    setLoading(true); setError(''); setSearched(true)
    try {
      const data = await trackOrder(searchId.trim().toUpperCase())
      setOrder(data)
    } catch(e) {
      setOrder(null)
      setError(e.response?.data?.error || 'Order not found. Please check your Order ID.')
    } finally { setLoading(false) }
  }

  const currentStepIndex = order
    ? STATUS_STEPS.findIndex(s => s.key === order.status)
    : -1

  const isCancelled = order?.status === 'cancelled'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --brand: ${brandColor}; }
        .tr-root { min-height: 100vh; background: #0b0f1a; font-family: 'Inter', sans-serif; color: #f0f4ff; }
        .tr-nav { background: rgba(11,15,26,0.95); border-bottom: 1px solid rgba(255,255,255,0.06); padding: 0 24px; height: 62px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 50; backdrop-filter: blur(12px); }
        .tr-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: #fff; text-decoration: none; display: flex; align-items: center; gap: 8px; }
        .tr-logo-icon { width: 32px; height: 32px; background: var(--brand); border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 14px; }
        .tr-back { font-size: 13px; color: rgba(240,244,255,0.4); text-decoration: none; }
        .tr-back:hover { color: var(--brand); }
        .tr-body { max-width: 580px; margin: 0 auto; padding: 40px 20px 80px; }
        .tr-header { text-align: center; margin-bottom: 36px; }
        .tr-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: #fff; margin-bottom: 8px; }
        .tr-sub { font-size: 14px; color: rgba(240,244,255,0.4); }
        .tr-search { display: flex; gap: 10px; margin-bottom: 32px; }
        .tr-input { flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); border-radius: 10px; padding: 13px 16px; font-size: 14px; color: #fff; outline: none; font-family: 'Inter', sans-serif; transition: border-color 0.2s; letter-spacing: 0.04em; }
        .tr-input:focus { border-color: var(--brand); }
        .tr-input::placeholder { color: rgba(240,244,255,0.2); letter-spacing: 0; }
        .tr-btn { padding: 13px 24px; background: var(--brand); color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: opacity 0.2s; }
        .tr-btn:hover:not(:disabled) { opacity: 0.88; }
        .tr-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .tr-error { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 12px; padding: 14px 18px; font-size: 14px; color: #fca5a5; text-align: center; margin-bottom: 24px; }

        .tr-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 28px; margin-bottom: 16px; }
        .tr-order-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; gap: 12px; flex-wrap: wrap; }
        .tr-order-id { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 24px; color: var(--brand); }
        .tr-order-date { font-size: 11px; color: rgba(240,244,255,0.35); margin-top: 4px; }
        .tr-status-badge { padding: 6px 16px; border-radius: 100px; font-size: 12px; font-weight: 700; white-space: nowrap; }

        .tr-route { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; padding: 16px; background: rgba(255,255,255,0.02); border-radius: 12px; }
        .tr-route-item { display: flex; align-items: flex-start; gap: 12px; }
        .tr-route-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
        .tr-route-label { font-size: 10px; color: rgba(240,244,255,0.3); margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.04em; }
        .tr-route-text { font-size: 14px; color: #f0f4ff; font-weight: 500; }

        .tr-details { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
        .tr-detail-item { background: rgba(255,255,255,0.03); border-radius: 10px; padding: 12px; }
        .tr-detail-label { font-size: 10px; color: rgba(240,244,255,0.3); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.04em; }
        .tr-detail-value { font-size: 13px; color: #f0f4ff; font-weight: 500; }

        .tr-timeline { display: flex; flex-direction: column; gap: 0; }
        .tr-step { display: flex; gap: 16px; position: relative; }
        .tr-step-left { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
        .tr-step-dot { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; z-index: 1; transition: all 0.3s; }
        .tr-step-dot.done { background: var(--brand); border: 2px solid var(--brand); }
        .tr-step-dot.current { background: rgba(249,115,22,0.2); border: 2px solid var(--brand); animation: trPulse 2s infinite; }
        .tr-step-dot.pending { background: rgba(255,255,255,0.04); border: 2px solid rgba(255,255,255,0.1); }
        .tr-step-dot.cancelled { background: rgba(239,68,68,0.15); border: 2px solid rgba(239,68,68,0.3); }
        @keyframes trPulse { 0%,100%{box-shadow:0 0 0 0 rgba(249,115,22,0.4);} 50%{box-shadow:0 0 0 8px rgba(249,115,22,0);} }
        .tr-step-line { width: 2px; flex: 1; min-height: 24px; margin: 4px 0; transition: background 0.3s; }
        .tr-step-line.done { background: var(--brand); }
        .tr-step-line.pending { background: rgba(255,255,255,0.07); }
        .tr-step-content { padding: 6px 0 24px; flex: 1; }
        .tr-step-label { font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 3px; }
        .tr-step-label.pending { color: rgba(240,244,255,0.3); font-weight: 400; }
        .tr-step-desc { font-size: 12px; color: rgba(240,244,255,0.4); }

        .tr-rider { background: rgba(34,197,94,0.06); border: 1px solid rgba(34,197,94,0.2); border-radius: 14px; padding: 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 4px; }
        .tr-rider-name { font-weight: 600; color: #fff; margin-bottom: 3px; }
        .tr-rider-label { font-size: 10px; color: rgba(240,244,255,0.3); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px; }
        .tr-rider-phone { font-size: 12px; color: #86efac; }
        .tr-call-btn { padding: 8px 16px; background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.3); border-radius: 8px; color: #86efac; font-size: 12px; font-weight: 600; text-decoration: none; white-space: nowrap; transition: all 0.2s; }
        .tr-call-btn:hover { background: #22c55e; color: #fff; }

        .tr-cancelled { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 14px; padding: 20px; text-align: center; }
        .tr-cancelled-icon { font-size: 32px; margin-bottom: 8px; }
        .tr-cancelled-text { font-size: 15px; font-weight: 600; color: #fca5a5; }
        .tr-cancelled-sub { font-size: 12px; color: rgba(240,244,255,0.35); margin-top: 4px; }

        .tr-delivered { background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.2); border-radius: 14px; padding: 20px; text-align: center; margin-bottom: 16px; }
        .tr-delivered-icon { font-size: 40px; margin-bottom: 8px; }
        .tr-delivered-text { font-size: 16px; font-weight: 700; color: #86efac; }
        .tr-delivered-sub { font-size: 12px; color: rgba(240,244,255,0.35); margin-top: 4px; }

        @media (max-width: 520px) {
          .tr-body { padding: 24px 16px 60px; }
          .tr-search { flex-direction: column; }
          .tr-details { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="tr-root">
        <nav className="tr-nav">
          <a href="/" className="tr-logo">
            {logo
              ? <img src={logo} alt="logo" style={{ width:32, height:32, borderRadius:7, objectFit:'cover' }} />
              : <div className="tr-logo-icon">🚀</div>
            }
            {bizName}
          </a>
          <a href="/" className="tr-back">← Back to Home</a>
        </nav>

        <div className="tr-body">
          <div className="tr-header">
            <div className="tr-title">Track Your Order</div>
            <div className="tr-sub">Enter your Order ID to get real-time delivery updates</div>
          </div>

          <div className="tr-search">
            <input
              className="tr-input"
              placeholder="e.g. SWG-X7K2M9"
              value={orderID}
              onChange={e => setOrderID(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <button className="tr-btn" onClick={() => handleSearch()} disabled={loading}>
              {loading ? '⏳' : '🔍 Track'}
            </button>
          </div>

          {error && <div className="tr-error">✕ {error}</div>}

          {order && (
            <>
              {/* Order Header */}
              <div className="tr-card">
                <div className="tr-order-head">
                  <div>
                    <div className="tr-order-id">{order.orderID}</div>
                    <div className="tr-order-date">Placed {new Date(order.createdAt).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})} at {new Date(order.createdAt).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</div>
                  </div>
                  {isCancelled
                    ? <span className="tr-status-badge" style={{ background:'rgba(239,68,68,0.15)', color:'#fca5a5' }}>❌ Cancelled</span>
                    : order.status === 'delivered'
                    ? <span className="tr-status-badge" style={{ background:'rgba(34,197,94,0.15)', color:'#86efac' }}>✅ Delivered</span>
                    : <span className="tr-status-badge" style={{ background:'rgba(249,115,22,0.15)', color: brandColor }}>🔄 In Progress</span>
                  }
                </div>

                <div className="tr-route">
                  <div className="tr-route-item">
                    <div className="tr-route-dot" style={{ background: brandColor }} />
                    <div><div className="tr-route-label">Pickup</div><div className="tr-route-text">{order.pickupLocation}</div></div>
                  </div>
                  <div className="tr-route-item">
                    <div className="tr-route-dot" style={{ background:'#22c55e' }} />
                    <div><div className="tr-route-label">Drop-off</div><div className="tr-route-text">{order.dropoffLocation}</div></div>
                  </div>
                </div>

                <div className="tr-details">
                  <div className="tr-detail-item"><div className="tr-detail-label">Recipient</div><div className="tr-detail-value">{order.recipientName}</div></div>
                  <div className="tr-detail-item"><div className="tr-detail-label">Delivery Type</div><div className="tr-detail-value" style={{ textTransform:'capitalize' }}>{order.deliveryType?.replace('-',' ')}</div></div>
                  <div className="tr-detail-item"><div className="tr-detail-label">Delivery Fee</div><div className="tr-detail-value" style={{ color: brandColor }}>GHS {order.deliveryFee}</div></div>
                  <div className="tr-detail-item"><div className="tr-detail-label">Payment</div><div className="tr-detail-value" style={{ textTransform:'capitalize' }}>{order.paymentMethod?.replace('-',' ')}</div></div>
                  {order.distance > 0 && <div className="tr-detail-item"><div className="tr-detail-label">Distance</div><div className="tr-detail-value">{order.distance} km</div></div>}
                  {order.deliveryType === 'scheduled' && order.scheduledDate && (
                    <div className="tr-detail-item" style={{ gridColumn:'1/-1' }}>
                      <div className="tr-detail-label">Scheduled For</div>
                      <div className="tr-detail-value" style={{ color: brandColor }}>{order.scheduledDate} at {order.scheduledTime}</div>
                    </div>
                  )}
                </div>

                {order.assignedRider && (
                  <div className="tr-rider">
                    <div>
                      <div className="tr-rider-label">Your Rider</div>
                      <div className="tr-rider-name">{order.assignedRider.name}</div>
                      <div className="tr-rider-phone">{order.assignedRider.phone}</div>
                    </div>
                    <a href={`tel:${order.assignedRider.phone}`} className="tr-call-btn">📞 Call Rider</a>
                  </div>
                )}
              </div>

              {/* Delivered */}
              {order.status === 'delivered' && (
                <div className="tr-delivered">
                  <div className="tr-delivered-icon">🎉</div>
                  <div className="tr-delivered-text">Package Delivered!</div>
                  {order.proofRecipientName && <div className="tr-delivered-sub">Received by: {order.proofRecipientName}</div>}
                </div>
              )}

              {/* Cancelled */}
              {isCancelled && (
                <div className="tr-cancelled">
                  <div className="tr-cancelled-icon">❌</div>
                  <div className="tr-cancelled-text">Order Cancelled</div>
                  <div className="tr-cancelled-sub">Please contact {bizName} for assistance.</div>
                </div>
              )}

              {/* Timeline */}
              {!isCancelled && (
                <div className="tr-card">
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:'#fff', marginBottom:20 }}>Delivery Timeline</div>
                  <div className="tr-timeline">
                    {STATUS_STEPS.map((step, i) => {
                      const isDone    = currentStepIndex > i
                      const isCurrent = currentStepIndex === i
                      const isPending = currentStepIndex < i
                      const isLast    = i === STATUS_STEPS.length - 1

                      return (
                        <div key={step.key} className="tr-step">
                          <div className="tr-step-left">
                            <div className={`tr-step-dot ${isDone ? 'done' : isCurrent ? 'current' : 'pending'}`}>
                              {isDone ? '✓' : step.icon}
                            </div>
                            {!isLast && <div className={`tr-step-line ${isDone ? 'done' : 'pending'}`} />}
                          </div>
                          <div className="tr-step-content">
                            <div className={`tr-step-label${isPending ? ' pending' : ''}`}>{step.label}</div>
                            {(isDone || isCurrent) && <div className="tr-step-desc">{step.desc}</div>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div style={{ textAlign:'center', marginTop:16 }}>
                <a href="/book" style={{ color: brandColor, fontSize:13, textDecoration:'none', fontWeight:500 }}>+ Book Another Delivery</a>
              </div>
            </>
          )}

          {!order && searched && !loading && !error && (
            <div style={{ textAlign:'center', padding:'40px 0', color:'rgba(240,244,255,0.25)', fontSize:14 }}>
              No order found. Please check your Order ID.
            </div>
          )}
        </div>
      </div>
    </>
  )
}