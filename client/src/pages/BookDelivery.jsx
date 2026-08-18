import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOrder } from '../utils/api'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import { useTenant } from '../context/TenantContext'
import LocationPicker from '../components/LocationPicker'

const DELIVERY_TYPES = [
  { value: 'standard',  label: 'Standard Delivery', icon: '🚶', desc: 'Within the day',    eta: '2-4 hours' },
  { value: 'same-day',  label: 'Same-Day',           icon: '⚡', desc: 'Book before noon',  eta: '1-3 hours' },
  { value: 'express',   label: 'Express / Urgent',   icon: '🚀', desc: 'Fastest option',    eta: '30-60 mins' },
  { value: 'scheduled', label: 'Scheduled',           icon: '📅', desc: 'Pick date & time', eta: 'Your chosen time' },
]

const RATE_PER_KM = 2

function AuthModal({ onClose, brandColor, bizName }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:300, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(8px)', display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
      <div style={{ background:'#0f1525', border:'1px solid rgba(255,255,255,0.1)', borderTop:`2px solid ${brandColor}`, borderRadius:'20px 20px 0 0', width:'100%', maxWidth:480, padding:'32px 28px 48px', animation:'slideUp 0.3s ease' }}>
        <style>{`@keyframes slideUp { from { transform: translateY(100%); opacity:0; } to { transform: translateY(0); opacity:1; } }`}</style>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🔐</div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:'#fff', marginBottom:8 }}>Sign In to Book</div>
          <div style={{ fontSize:14, color:'rgba(240,244,255,0.45)', lineHeight:1.7 }}>
            You need an account to book a delivery with {bizName}. It's free and takes less than a minute.
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <a href="/login?from=/book" style={{ display:'block', padding:'14px', background: brandColor, color:'#fff', borderRadius:12, fontSize:14, fontWeight:700, textDecoration:'none', textAlign:'center' }}>
            Sign In to My Account
          </a>
          <a href="/register?from=/book" style={{ display:'block', padding:'14px', background:'rgba(255,255,255,0.06)', color:'#fff', borderRadius:12, fontSize:14, fontWeight:600, textDecoration:'none', textAlign:'center', border:'1px solid rgba(255,255,255,0.1)' }}>
            Create Free Account
          </a>
          <button onClick={onClose} style={{ padding:'12px', background:'transparent', color:'rgba(240,244,255,0.3)', border:'none', borderRadius:12, fontSize:13, cursor:'pointer' }}>
            Continue as Guest →
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BookDelivery() {
  const navigate = useNavigate()
  const { customer, loading: authLoading } = useCustomerAuth()
  const { tenant } = useTenant()

  const bizName    = tenant?.businessName || 'Bdelivery'
  const brandColor = tenant?.brandColor   || '#f97316'
  const logo       = tenant?.logo         || null

  const [step, setStep]                   = useState(1)
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')
  const [success, setSuccess]             = useState(null)
  const [packageImage, setPackageImage]   = useState(null)
  const [pickupCoords, setPickupCoords]   = useState(null)
  const [dropoffCoords, setDropoffCoords] = useState(null)
  const [distance, setDistance]           = useState(0)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [guestMode, setGuestMode]         = useState(false)

  const [form, setForm] = useState({
    customerName: '', customerPhone: '',
    recipientName: '', recipientPhone: '',
    pickupLocation: '', dropoffLocation: '',
    deliveryType: 'standard',
    scheduledDate: '', scheduledTime: '',
    packageDescription: '', additionalNotes: '',
    paymentMethod: 'cash',
  })

  // Show auth modal only after auth context has loaded
  useEffect(() => {
    if (authLoading) return
    if (customer) {
      setShowAuthModal(false)
      return
    }
    if (!guestMode) {
      setShowAuthModal(true)
    }
  }, [customer, guestMode, authLoading])

  // Auto-fill form when customer logs in
  useEffect(() => {
    if (customer) {
      setShowAuthModal(false)
      setForm(prev => ({
        ...prev,
        customerName:  customer.name  || prev.customerName,
        customerPhone: customer.phone || prev.customerPhone,
      }))
    }
  }, [customer])

  const BASE_FEES = {
    standard:   tenant?.standardFee  || 30,
    'same-day': tenant?.sameDayFee   || 50,
    express:    tenant?.expressFee   || 80,
    scheduled:  tenant?.scheduledFee || 40,
  }

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }))
  const selectedType = DELIVERY_TYPES.find(t => t.value === form.deliveryType)
  const deliveryFee  = distance > 0
    ? Math.round(BASE_FEES[form.deliveryType] + (distance * RATE_PER_KM))
    : BASE_FEES[form.deliveryType]

  const validatePhone = (phone) => /^[0-9+\s\-]{10,15}$/.test(phone.trim())

  const nextStep = () => {
    setError('')

    if (step === 1 && !customer && !guestMode) {
      setShowAuthModal(true)
      return
    }

    if (step === 1) {
      if (!form.customerName.trim()) { setError('Please enter your full name.'); return }
      if (!validatePhone(form.customerPhone)) { setError('Please enter a valid phone number (at least 10 digits).'); return }
      if (!form.recipientName.trim()) { setError('Please enter the recipient\'s name.'); return }
      if (!validatePhone(form.recipientPhone)) { setError('Please enter a valid recipient phone number.'); return }
    }
    if (step === 2) {
      if (!form.pickupLocation.trim()) { setError('Please pin your pickup location.'); return }
      if (!form.dropoffLocation.trim()) { setError('Please pin your drop-off location.'); return }
      if (form.pickupLocation.trim().toLowerCase() === form.dropoffLocation.trim().toLowerCase()) { setError('Pickup and drop-off locations cannot be the same.'); return }
      if (!form.packageDescription.trim()) { setError('Please describe what is being delivered.'); return }
      if (form.deliveryType === 'scheduled') {
        if (!form.scheduledDate) { setError('Please select a delivery date.'); return }
        if (!form.scheduledTime) { setError('Please select a delivery time.'); return }
        const selectedDate = new Date(form.scheduledDate)
        const today = new Date(); today.setHours(0,0,0,0)
        if (selectedDate < today) { setError('Scheduled date cannot be in the past.'); return }
      }
    }
    setStep(prev => prev + 1)
  }

  const handleSubmit = async () => {
    if (!customer && !guestMode) {
      setShowAuthModal(true)
      return
    }
    setLoading(true); setError('')
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      fd.append('deliveryFee', deliveryFee)
      fd.append('distance', distance)
      if (customer) fd.append('customerId', customer._id || customer.id)
      if (pickupCoords) {
        fd.append('pickupCoords[lat]', pickupCoords.lat)
        fd.append('pickupCoords[lng]', pickupCoords.lng)
      }
      if (dropoffCoords) {
        fd.append('dropoffCoords[lat]', dropoffCoords.lat)
        fd.append('dropoffCoords[lng]', dropoffCoords.lng)
      }
      if (packageImage) fd.append('packageImage', packageImage)
      const order = await createOrder(fd)
      setSuccess(order)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.')
    } finally { setLoading(false) }
  }

  if (success) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #0b0f1a; }
          :root { --brand: ${brandColor}; }
          .suc-root { min-height: 100vh; background: #0b0f1a; display: flex; align-items: center; justify-content: center; padding: 40px 20px; font-family: 'Inter', sans-serif; }
          .suc-card { width: 100%; max-width: 460px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 44px 32px; text-align: center; }
          .suc-check { width: 72px; height: 72px; background: rgba(34,197,94,0.15); border: 2px solid rgba(34,197,94,0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 20px; }
          .suc-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 26px; color: #fff; margin-bottom: 10px; }
          .suc-sub { font-size: 14px; color: rgba(240,244,255,0.45); line-height: 1.7; margin-bottom: 28px; }
          .suc-id-box { background: rgba(249,115,22,0.08); border: 1px solid rgba(249,115,22,0.25); border-radius: 16px; padding: 22px; margin-bottom: 16px; }
          .suc-id-label { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(240,244,255,0.3); margin-bottom: 10px; }
          .suc-id { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 32px; color: var(--brand); letter-spacing: 0.06em; }
          .suc-id-tip { font-size: 12px; color: rgba(240,244,255,0.3); margin-top: 8px; }
          .suc-details { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 16px; margin-bottom: 20px; text-align: left; display: flex; flex-direction: column; gap: 10px; }
          .suc-detail-row { display: flex; justify-content: space-between; font-size: 13px; gap: 12px; }
          .suc-detail-label { color: rgba(240,244,255,0.35); flex-shrink: 0; }
          .suc-detail-value { color: #f0f4ff; font-weight: 500; text-align: right; }
          .suc-actions { display: flex; flex-direction: column; gap: 10px; }
          .suc-btn { display: block; padding: 14px; background: var(--brand); color: #fff; border: none; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; text-align: center; transition: opacity 0.2s; }
          .suc-btn:hover { opacity: 0.88; }
          .suc-btn-ghost { display: block; padding: 14px; background: transparent; color: rgba(240,244,255,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; font-size: 14px; cursor: pointer; text-decoration: none; text-align: center; }
        `}</style>
        <div className="suc-root">
          <div className="suc-card">
            <div className="suc-check">🎉</div>
            <div className="suc-title">Booking Confirmed!</div>
            <p className="suc-sub">Your delivery has been booked successfully. Save your Order ID to track your package at any time.</p>
            <div className="suc-id-box">
              <div className="suc-id-label">Your Order ID</div>
              <div className="suc-id">{success.orderID}</div>
              <div className="suc-id-tip">📸 Screenshot this for your records</div>
            </div>
            <div className="suc-details">
              <div className="suc-detail-row"><span className="suc-detail-label">From</span><span className="suc-detail-value">{form.pickupLocation}</span></div>
              <div className="suc-detail-row"><span className="suc-detail-label">To</span><span className="suc-detail-value">{form.dropoffLocation}</span></div>
              <div className="suc-detail-row"><span className="suc-detail-label">Recipient</span><span className="suc-detail-value">{form.recipientName} · {form.recipientPhone}</span></div>
              <div className="suc-detail-row"><span className="suc-detail-label">Type</span><span className="suc-detail-value">{selectedType?.label}</span></div>
              {distance > 0 && <div className="suc-detail-row"><span className="suc-detail-label">Distance</span><span className="suc-detail-value">{distance} km</span></div>}
              <div className="suc-detail-row"><span className="suc-detail-label">Fee</span><span className="suc-detail-value" style={{ color: brandColor }}>GHS {deliveryFee}</span></div>
              <div className="suc-detail-row"><span className="suc-detail-label">Payment</span><span className="suc-detail-value" style={{ textTransform:'capitalize' }}>{form.paymentMethod.replace('-',' ')}</span></div>
              {form.deliveryType === 'scheduled' && (
                <div className="suc-detail-row"><span className="suc-detail-label">Scheduled</span><span className="suc-detail-value">{form.scheduledDate} at {form.scheduledTime}</span></div>
              )}
            </div>
            <div className="suc-actions">
              <a href={`/track/${success.orderID}`} className="suc-btn">🔍 Track My Order</a>
              {customer && <a href="/account" className="suc-btn-ghost">📋 View in My Account</a>}
              <a href="/book" className="suc-btn-ghost">+ Book Another Delivery</a>
              <a href="/" className="suc-btn-ghost">← Back to Home</a>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --brand: ${brandColor}; }
        .bk-root { min-height: 100vh; background: #0b0f1a; font-family: 'Inter', sans-serif; color: #f0f4ff; }
        .bk-nav { background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.06); padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 50; backdrop-filter: blur(12px); }
        .bk-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: #fff; text-decoration: none; display: flex; align-items: center; gap: 8px; }
        .bk-logo-icon { width: 32px; height: 32px; background: var(--brand); border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 14px; }
        .bk-nav-right { display: flex; align-items: center; gap: 10px; }
        .bk-back { font-size: 13px; color: rgba(240,244,255,0.4); text-decoration: none; }
        .bk-back:hover { color: var(--brand); }
        .bk-user-badge { display: flex; align-items: center; gap: 6px; background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.2); border-radius: 100px; padding: 4px 12px; font-size: 12px; color: var(--brand); font-weight: 500; }
        .bk-body { max-width: 580px; margin: 0 auto; padding: 32px 20px 80px; }
        .bk-steps { display: flex; align-items: center; margin-bottom: 32px; }
        .bk-step { display: flex; align-items: center; gap: 8px; }
        .bk-step-circle { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; transition: all 0.3s; }
        .bk-step-circle.active { background: var(--brand); color: #fff; box-shadow: 0 0 0 4px rgba(249,115,22,0.2); }
        .bk-step-circle.done { background: rgba(34,197,94,0.2); color: #86efac; border: 1px solid rgba(34,197,94,0.4); }
        .bk-step-circle.inactive { background: rgba(255,255,255,0.06); color: rgba(240,244,255,0.25); }
        .bk-step-label { font-size: 12px; font-weight: 500; color: rgba(240,244,255,0.35); white-space: nowrap; }
        .bk-step-label.active { color: #fff; font-weight: 600; }
        .bk-step-label.done { color: rgba(134,239,172,0.7); }
        .bk-step-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); margin: 0 10px; min-width: 20px; }
        .bk-step-line.done { background: rgba(34,197,94,0.3); }
        .bk-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 28px; margin-bottom: 16px; }
        .bk-section-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 18px; color: #fff; margin-bottom: 20px; }
        .bk-section-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 20px 0; }
        .bk-subsection { font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: rgba(240,244,255,0.3); margin-bottom: 14px; }
        .bk-field { margin-bottom: 16px; }
        .bk-label { display: block; font-size: 12px; font-weight: 500; color: rgba(240,244,255,0.45); margin-bottom: 7px; }
        .bk-label span { color: var(--brand); }
        .bk-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); border-radius: 10px; padding: 12px 14px; font-size: 14px; color: #fff; outline: none; transition: border-color 0.2s; font-family: 'Inter', sans-serif; }
        .bk-input:focus { border-color: var(--brand); background: rgba(255,255,255,0.07); }
        .bk-input::placeholder { color: rgba(240,244,255,0.18); }
        .bk-input:disabled { opacity: 0.6; cursor: not-allowed; }
        .bk-textarea { resize: vertical; min-height: 85px; }
        .bk-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .bk-type-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .bk-type-card { background: rgba(255,255,255,0.03); border: 1.5px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px; cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden; }
        .bk-type-card:hover { border-color: rgba(249,115,22,0.3); }
        .bk-type-card.selected { border-color: var(--brand); background: rgba(249,115,22,0.08); }
        .bk-type-card.selected::before { content: '✓'; position: absolute; top: 10px; right: 12px; font-size: 12px; color: var(--brand); font-weight: 700; }
        .bk-type-icon { font-size: 24px; margin-bottom: 8px; }
        .bk-type-name { font-size: 13px; font-weight: 600; color: #fff; margin-bottom: 2px; }
        .bk-type-desc { font-size: 11px; color: rgba(240,244,255,0.35); margin-bottom: 6px; }
        .bk-type-fee { font-size: 14px; font-weight: 700; color: var(--brand); }
        .bk-type-eta { font-size: 10px; color: rgba(240,244,255,0.3); margin-top: 2px; }
        .bk-type-note { font-size: 10px; color: rgba(249,115,22,0.5); margin-top: 2px; }
        .bk-file-zone { width: 100%; background: rgba(255,255,255,0.03); border: 1.5px dashed rgba(255,255,255,0.12); border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; color: rgba(240,244,255,0.3); font-size: 13px; transition: all 0.2s; }
        .bk-file-zone:hover { border-color: rgba(249,115,22,0.3); }
        .bk-file-zone.has-file { border-color: rgba(34,197,94,0.3); color: #86efac; background: rgba(34,197,94,0.04); }
        .bk-payment-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .bk-payment-card { background: rgba(255,255,255,0.03); border: 1.5px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 18px 14px; cursor: pointer; transition: all 0.2s; text-align: center; position: relative; }
        .bk-payment-card:hover { border-color: rgba(249,115,22,0.3); }
        .bk-payment-card.selected { border-color: var(--brand); background: rgba(249,115,22,0.08); }
        .bk-payment-card.selected::before { content: '✓'; position: absolute; top: 10px; right: 12px; font-size: 12px; color: var(--brand); font-weight: 700; }
        .bk-payment-icon { font-size: 28px; margin-bottom: 8px; }
        .bk-payment-label { font-size: 13px; font-weight: 600; color: #fff; margin-bottom: 3px; }
        .bk-payment-sub { font-size: 11px; color: rgba(240,244,255,0.3); }
        .bk-fee-box { background: linear-gradient(135deg, rgba(249,115,22,0.1), rgba(249,115,22,0.05)); border: 1px solid rgba(249,115,22,0.25); border-radius: 14px; padding: 18px 20px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .bk-fee-amount { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 26px; color: var(--brand); }
        .bk-fee-label { font-size: 12px; color: rgba(240,244,255,0.4); margin-bottom: 3px; }
        .bk-fee-type { font-size: 12px; color: rgba(240,244,255,0.4); margin-bottom: 3px; text-align: right; }
        .bk-fee-eta { font-size: 12px; color: rgba(249,115,22,0.7); font-weight: 500; text-align: right; }
        .bk-summary { display: flex; flex-direction: column; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; overflow: hidden; margin-bottom: 20px; }
        .bk-summary-row { display: flex; gap: 16px; padding: 11px 16px; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .bk-summary-row:last-child { border-bottom: none; }
        .bk-summary-label { width: 90px; font-size: 12px; color: rgba(240,244,255,0.3); flex-shrink: 0; padding-top: 1px; }
        .bk-summary-value { font-size: 13px; color: #f0f4ff; font-weight: 500; }
        .bk-error { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 10px; padding: 12px 16px; font-size: 13px; color: #fca5a5; margin-bottom: 14px; }
        .bk-actions { display: flex; gap: 10px; }
        .bk-btn-primary { flex: 1; padding: 15px; background: var(--brand); color: #fff; border: none; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .bk-btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .bk-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .bk-btn-ghost { padding: 15px 22px; background: transparent; color: rgba(240,244,255,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; font-size: 14px; cursor: pointer; }
        .bk-btn-ghost:hover { border-color: rgba(255,255,255,0.2); }
        .bk-trust { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
        .bk-trust-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: rgba(240,244,255,0.3); }
        .bk-login-banner { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: rgba(249,115,22,0.06); border: 1px solid rgba(249,115,22,0.2); border-radius: 12px; margin-bottom: 20px; }
        .bk-login-banner-text { font-size: 13px; color: rgba(240,244,255,0.5); flex: 1; }
        .bk-login-banner-link { font-size: 13px; font-weight: 600; color: var(--brand); text-decoration: none; white-space: nowrap; }
        @media (max-width: 520px) {
          .bk-body { padding: 20px 16px 80px; }
          .bk-card { padding: 20px; }
          .bk-row { grid-template-columns: 1fr; }
          .bk-step-label { display: none; }
          .bk-step-label.active { display: block; }
        }
      `}</style>

      <div className="bk-root">
        {showAuthModal && !authLoading && (
          <AuthModal
            brandColor={brandColor}
            bizName={bizName}
            onClose={() => { setShowAuthModal(false); setGuestMode(true) }}
          />
        )}

        <nav className="bk-nav">
          <a href="/" className="bk-logo">
            {logo
              ? <img src={logo} alt="logo" style={{ width:32, height:32, borderRadius:7, objectFit:'cover', flexShrink:0 }} />
              : <div className="bk-logo-icon">🚀</div>
            }
            {bizName}
          </a>
          <div className="bk-nav-right">
            {customer
              ? <div className="bk-user-badge">👤 {customer.name?.split(' ')[0]}</div>
              : guestMode && <div className="bk-user-badge" style={{ color:'rgba(240,244,255,0.4)', borderColor:'rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)' }}>👤 Guest</div>
            }
            <a href="/" className="bk-back">← Back</a>
          </div>
        </nav>

        <div className="bk-body">
          {!customer && guestMode && (
            <div className="bk-login-banner">
              <span style={{ fontSize:20 }}>💡</span>
              <div className="bk-login-banner-text">Booking as guest. Sign in to track all your orders in one place.</div>
              <a href="/login?from=/book" className="bk-login-banner-link">Sign In →</a>
            </div>
          )}

          <div className="bk-steps">
            {['Contact Details', 'Package Info', 'Confirm & Pay'].map((label, i) => (
              <div key={label} className="bk-step" style={{ flex: i < 2 ? 1 : 'none' }}>
                {i > 0 && <div className={`bk-step-line${step > i ? ' done' : ''}`} />}
                <div className={`bk-step-circle ${step === i+1 ? 'active' : step > i+1 ? 'done' : 'inactive'}`}>
                  {step > i+1 ? '✓' : i+1}
                </div>
                <div className={`bk-step-label ${step === i+1 ? 'active' : step > i+1 ? 'done' : ''}`}>{label}</div>
              </div>
            ))}
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <div className="bk-card">
              <div className="bk-section-title">👤 Sender Details</div>
              <div className="bk-row">
                <div className="bk-field">
                  <label className="bk-label">Full Name <span>*</span></label>
                  <input className="bk-input" placeholder="e.g. John Mensah" value={form.customerName} onChange={e => set('customerName', e.target.value)} />
                </div>
                <div className="bk-field">
                  <label className="bk-label">Phone Number <span>*</span></label>
                  <input className="bk-input" type="tel" placeholder="e.g. 0244000000" value={form.customerPhone} onChange={e => set('customerPhone', e.target.value)} />
                </div>
              </div>
              <div className="bk-section-divider" />
              <div className="bk-section-title" style={{ fontSize:16, marginBottom:16 }}>📦 Recipient Details</div>
              <div className="bk-row">
                <div className="bk-field">
                  <label className="bk-label">Recipient Name <span>*</span></label>
                  <input className="bk-input" placeholder="e.g. Ama Asante" value={form.recipientName} onChange={e => set('recipientName', e.target.value)} />
                </div>
                <div className="bk-field">
                  <label className="bk-label">Recipient Phone <span>*</span></label>
                  <input className="bk-input" type="tel" placeholder="e.g. 0554000000" value={form.recipientPhone} onChange={e => set('recipientPhone', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="bk-card">
              <div className="bk-section-title">📍 Locations</div>
              <LocationPicker
                onPickupChange={(name, coords) => { set('pickupLocation', name); setPickupCoords(coords) }}
                onDropoffChange={(name, coords) => { set('dropoffLocation', name); setDropoffCoords(coords) }}
                onDistanceChange={(km) => setDistance(km)}
              />
              <div style={{ height:16 }} />
              <div className="bk-section-divider" />
              <div className="bk-section-title" style={{ fontSize:16, marginBottom:16 }}>🚚 Delivery Type</div>
              <div className="bk-type-grid" style={{ marginBottom:18 }}>
                {DELIVERY_TYPES.map(t => (
                  <div key={t.value} className={`bk-type-card${form.deliveryType === t.value ? ' selected' : ''}`} onClick={() => set('deliveryType', t.value)}>
                    <div className="bk-type-icon">{t.icon}</div>
                    <div className="bk-type-name">{t.label}</div>
                    <div className="bk-type-desc">{t.desc}</div>
                    <div className="bk-type-fee">
                      GHS {distance > 0
                        ? Math.round(BASE_FEES[t.value] + (distance * RATE_PER_KM))
                        : BASE_FEES[t.value]}
                    </div>
                    <div className="bk-type-eta">⏱ {t.eta}</div>
                    {distance > 0 && <div className="bk-type-note">Base + {distance}km × GHS{RATE_PER_KM}</div>}
                  </div>
                ))}
              </div>

              {form.deliveryType === 'scheduled' && (
                <div className="bk-row" style={{ marginBottom:16 }}>
                  <div className="bk-field">
                    <label className="bk-label">Delivery Date <span>*</span></label>
                    <input type="date" className="bk-input" value={form.scheduledDate} onChange={e => set('scheduledDate', e.target.value)} min={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div className="bk-field">
                    <label className="bk-label">Delivery Time <span>*</span></label>
                    <input type="time" className="bk-input" value={form.scheduledTime} onChange={e => set('scheduledTime', e.target.value)} />
                  </div>
                </div>
              )}

              <div className="bk-section-divider" />
              <div className="bk-section-title" style={{ fontSize:16, marginBottom:16 }}>📋 Package Details</div>
              <div className="bk-field">
                <label className="bk-label">What are you sending? <span>*</span></label>
                <textarea className="bk-input bk-textarea" placeholder="e.g. Documents, clothing, food items, electronics..." value={form.packageDescription} onChange={e => set('packageDescription', e.target.value)} />
              </div>
              <div className="bk-field">
                <label className="bk-label">Package Photo <span style={{ color:'rgba(240,244,255,0.3)' }}>(Optional)</span></label>
                <div className={`bk-file-zone${packageImage ? ' has-file' : ''}`} onClick={() => document.getElementById('pkg-img').click()}>
                  {packageImage ? `✅ ${packageImage.name}` : '📷 Tap to upload a photo of your package'}
                  <input id="pkg-img" type="file" accept="image/*" style={{ display:'none' }} onChange={e => setPackageImage(e.target.files[0])} />
                </div>
              </div>
              <div className="bk-field">
                <label className="bk-label">Special Instructions <span style={{ color:'rgba(240,244,255,0.3)' }}>(Optional)</span></label>
                <textarea className="bk-input bk-textarea" style={{ minHeight:70 }} placeholder="e.g. Call recipient before arrival, handle with care..." value={form.additionalNotes} onChange={e => set('additionalNotes', e.target.value)} />
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="bk-card">
              <div className="bk-section-title">✅ Review & Confirm</div>
              <div className="bk-fee-box">
                <div>
                  <div className="bk-fee-label">Delivery Fee {distance > 0 && `· ${distance} km`}</div>
                  <div className="bk-fee-amount">GHS {deliveryFee}</div>
                  {distance > 0 && <div style={{ fontSize:11, color:'rgba(240,244,255,0.3)', marginTop:2 }}>Base GHS {BASE_FEES[form.deliveryType]} + {distance}km × GHS{RATE_PER_KM}/km</div>}
                </div>
                <div>
                  <div className="bk-fee-type">{selectedType?.label}</div>
                  <div className="bk-fee-eta">⏱ {selectedType?.eta}</div>
                </div>
              </div>

              <div className="bk-subsection">Order Summary</div>
              <div className="bk-summary">
                <div className="bk-summary-row"><span className="bk-summary-label">Sender</span><span className="bk-summary-value">{form.customerName} · {form.customerPhone}</span></div>
                <div className="bk-summary-row"><span className="bk-summary-label">Recipient</span><span className="bk-summary-value">{form.recipientName} · {form.recipientPhone}</span></div>
                <div className="bk-summary-row"><span className="bk-summary-label">Pickup</span><span className="bk-summary-value">{form.pickupLocation}</span></div>
                <div className="bk-summary-row"><span className="bk-summary-label">Drop-off</span><span className="bk-summary-value">{form.dropoffLocation}</span></div>
                {distance > 0 && <div className="bk-summary-row"><span className="bk-summary-label">Distance</span><span className="bk-summary-value" style={{ color: brandColor }}>{distance} km</span></div>}
                <div className="bk-summary-row"><span className="bk-summary-label">Package</span><span className="bk-summary-value">{form.packageDescription}</span></div>
                {form.deliveryType === 'scheduled' && (
                  <div className="bk-summary-row"><span className="bk-summary-label">Scheduled</span><span className="bk-summary-value">{form.scheduledDate} at {form.scheduledTime}</span></div>
                )}
                {form.additionalNotes && (
                  <div className="bk-summary-row"><span className="bk-summary-label">Notes</span><span className="bk-summary-value">{form.additionalNotes}</span></div>
                )}
              </div>

              <div className="bk-subsection">Payment Method</div>
              <div className="bk-payment-row" style={{ marginBottom:20 }}>
                <div className={`bk-payment-card${form.paymentMethod === 'cash' ? ' selected' : ''}`} onClick={() => set('paymentMethod', 'cash')}>
                  <div className="bk-payment-icon">💵</div>
                  <div className="bk-payment-label">Cash on Delivery</div>
                  <div className="bk-payment-sub">Pay when received</div>
                </div>
                <div className={`bk-payment-card${form.paymentMethod === 'mobile-money' ? ' selected' : ''}`} onClick={() => set('paymentMethod', 'mobile-money')}>
                  <div className="bk-payment-icon">📱</div>
                  <div className="bk-payment-label">Mobile Money</div>
                  <div className="bk-payment-sub">MoMo · Telecel · AirtelTigo</div>
                </div>
              </div>
              <div className="bk-trust">
                <div className="bk-trust-item">🔒 Secure booking</div>
                <div className="bk-trust-item">📦 Package insured</div>
                <div className="bk-trust-item">📍 Real-time tracking</div>
              </div>
            </div>
          )}

          {error && <div className="bk-error">⚠️ {error}</div>}

          <div className="bk-actions">
            {step > 1 && (
              <button className="bk-btn-ghost" onClick={() => { setStep(prev => prev - 1); setError('') }}>← Back</button>
            )}
            {step < 3
              ? <button className="bk-btn-primary" onClick={nextStep}>Continue →</button>
              : <button className="bk-btn-primary" onClick={handleSubmit} disabled={loading}>
                  {loading ? '⏳ Booking...' : '✓ Confirm Booking'}
                </button>
            }
          </div>
        </div>
      </div>
    </>
  )
}