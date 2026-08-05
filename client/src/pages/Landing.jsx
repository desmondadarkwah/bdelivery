import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchSettings } from '../utils/api'
import { useCustomerAuth } from '../context/CustomerAuthContext'

export default function Landing() {
  const [trackID, setTrackID]   = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { customer } = useCustomerAuth()
  const [settings, setSettings] = useState({ whatsapp:'233000000000', businessName:'SwiftByGwyn' })

  useEffect(() => {
    fetchSettings().then(setSettings).catch(console.error)
  }, [])

  const handleTrack = (e) => {
    e.preventDefault()
    if (trackID.trim()) navigate(`/track/${trackID.trim().toUpperCase()}`)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .land-root { font-family: 'Inter', sans-serif; background: #0b0f1a; color: #f0f4ff; min-height: 100vh; }

        .land-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(11,15,26,0.95); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(255,255,255,0.06); padding: 0 56px; height: 68px; display: flex; align-items: center; justify-content: space-between; }
        .land-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; color: #fff; letter-spacing: -0.02em; text-decoration: none; display: flex; align-items: center; gap: 10px; }
        .land-logo-icon { width: 36px; height: 36px; background: #f97316; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
        .land-nav-links { display: flex; align-items: center; gap: 32px; }
        .land-nav-links a { font-size: 13px; font-weight: 500; color: rgba(240,244,255,0.5); text-decoration: none; transition: color 0.2s; }
        .land-nav-links a:hover { color: #fff; }
        .land-nav-right { display: flex; align-items: center; gap: 10px; }
        .land-nav-btn { padding: 9px 22px; background: #f97316; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; transition: opacity 0.2s; white-space: nowrap; }
        .land-nav-btn:hover { opacity: 0.88; }
        .land-nav-ghost { padding: 9px 18px; background: transparent; color: rgba(240,244,255,0.6); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; text-decoration: none; transition: all 0.2s; white-space: nowrap; }
        .land-nav-ghost:hover { border-color: rgba(249,115,22,0.4); color: #f97316; }
        .land-nav-user { display: flex; align-items: center; gap: 6px; background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.2); border-radius: 100px; padding: 6px 14px; font-size: 12px; font-weight: 600; color: #f97316; text-decoration: none; white-space: nowrap; }

        .land-hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 4px; z-index: 110; }
        .land-hamburger span { display: block; width: 22px; height: 1.5px; background: #fff; }
        .land-mobile-menu { display: none; position: fixed; inset: 0; z-index: 100; background: #0b0f1a; flex-direction: column; align-items: center; justify-content: center; gap: 32px; }
        .land-mobile-menu.open { display: flex; }
        .land-mobile-menu a { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 28px; color: rgba(240,244,255,0.7); text-decoration: none; }
        .land-mobile-menu a:hover { color: #f97316; }
        .land-mobile-close { position: absolute; top: 24px; right: 24px; background: rgba(255,255,255,0.08); border: none; color: #fff; width: 38px; height: 38px; border-radius: 10px; cursor: pointer; font-size: 16px; }

        .land-hero { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 120px 56px 80px; text-align: center; position: relative; overflow: hidden; }
        .land-hero::before { content: ''; position: absolute; top: -200px; left: 50%; transform: translateX(-50%); width: 800px; height: 800px; border-radius: 50%; background: radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%); pointer-events: none; }
        .land-hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.25); border-radius: 100px; padding: 6px 16px; margin-bottom: 28px; font-size: 12px; font-weight: 500; color: #f97316; }
        .land-hero-badge-dot { width: 6px; height: 6px; background: #f97316; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        .land-hero-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(38px, 7vw, 76px); line-height: 1.05; letter-spacing: -0.03em; color: #fff; margin-bottom: 24px; }
        .land-hero-title span { color: #f97316; }
        .land-hero-sub { font-size: clamp(15px, 2vw, 17px); color: rgba(240,244,255,0.5); max-width: 500px; line-height: 1.75; margin-bottom: 40px; }
        .land-hero-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; justify-content: center; }
        .land-btn-primary { padding: 14px 32px; background: #f97316; color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
        .land-btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
        .land-btn-secondary { padding: 14px 32px; background: transparent; color: #f0f4ff; border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; text-decoration: none; }
        .land-btn-secondary:hover { border-color: rgba(255,255,255,0.3); }

        .land-track-bar { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09); border-radius: 18px; padding: 24px 28px; margin-top: 48px; max-width: 520px; width: 100%; text-align: left; }
        .land-track-label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(240,244,255,0.3); margin-bottom: 10px; }
        .land-track-form { display: flex; gap: 10px; }
        .land-track-input { flex: 1; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px 16px; font-size: 14px; font-weight: 500; color: #fff; outline: none; transition: border-color 0.2s; letter-spacing: 0.04em; font-family: 'Inter', sans-serif; }
        .land-track-input::placeholder { color: rgba(240,244,255,0.2); letter-spacing: 0; }
        .land-track-input:focus { border-color: #f97316; }
        .land-track-btn { padding: 12px 22px; background: #f97316; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; }

        .land-stats { display: flex; align-items: center; gap: 40px; margin-top: 52px; padding-top: 36px; border-top: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap; justify-content: center; }
        .land-stat-num { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 26px; color: #fff; }
        .land-stat-label { font-size: 11px; color: rgba(240,244,255,0.35); margin-top: 2px; }

        .land-section { padding: 96px 56px; }
        .land-section-inner { max-width: 1000px; margin: 0 auto; }
        .land-section-tag { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #f97316; margin-bottom: 14px; }
        .land-section-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(26px, 4vw, 42px); letter-spacing: -0.02em; color: #fff; margin-bottom: 48px; line-height: 1.1; }

        .land-steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 20px; }
        .land-step { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 26px; transition: border-color 0.2s; }
        .land-step:hover { border-color: rgba(249,115,22,0.25); }
        .land-step-num { width: 40px; height: 40px; background: rgba(249,115,22,0.12); border: 1px solid rgba(249,115,22,0.25); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 15px; color: #f97316; margin-bottom: 16px; }
        .land-step-title { font-size: 15px; font-weight: 600; color: #fff; margin-bottom: 8px; }
        .land-step-text { font-size: 13px; color: rgba(240,244,255,0.4); line-height: 1.7; }

        .land-pricing { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
        .land-price-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px; text-align: center; transition: all 0.2s; position: relative; overflow: hidden; }
        .land-price-card:hover { border-color: rgba(249,115,22,0.3); transform: translateY(-2px); }
        .land-price-card.featured { border-color: rgba(249,115,22,0.4); background: rgba(249,115,22,0.05); }
        .land-price-badge { position: absolute; top: 12px; right: 12px; background: #f97316; color: #fff; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 100px; }
        .land-price-icon { font-size: 32px; margin-bottom: 12px; }
        .land-price-name { font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 6px; }
        .land-price-desc { font-size: 12px; color: rgba(240,244,255,0.4); line-height: 1.6; margin-bottom: 14px; }
        .land-price-fee { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 24px; color: #f97316; margin-bottom: 4px; }
        .land-price-eta { font-size: 11px; color: rgba(240,244,255,0.3); }

        .land-coverage { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 40px; display: flex; align-items: center; gap: 40px; flex-wrap: wrap; }
        .land-coverage-map { font-size: 80px; flex-shrink: 0; }
        .land-coverage-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 24px; color: #fff; margin-bottom: 10px; }
        .land-coverage-text { font-size: 14px; color: rgba(240,244,255,0.45); line-height: 1.7; max-width: 460px; margin-bottom: 16px; }
        .land-coverage-tag { display: inline-flex; align-items: center; gap: 6px; background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.25); border-radius: 100px; padding: 5px 14px; font-size: 12px; font-weight: 500; color: #86efac; }

        .land-cta { background: linear-gradient(135deg, rgba(249,115,22,0.12), rgba(249,115,22,0.04)); border: 1px solid rgba(249,115,22,0.2); border-radius: 24px; padding: 56px 48px; text-align: center; }
        .land-cta-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(24px, 4vw, 38px); color: #fff; margin-bottom: 14px; letter-spacing: -0.02em; }
        .land-cta-sub { font-size: 15px; color: rgba(240,244,255,0.45); margin-bottom: 32px; line-height: 1.7; }
        .land-cta-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .land-cta-wa { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; background: #25D366; color: #fff; border-radius: 10px; font-size: 14px; font-weight: 600; text-decoration: none; transition: opacity 0.2s; }
        .land-cta-wa:hover { opacity: 0.88; }

        .land-footer { border-top: 1px solid rgba(255,255,255,0.06); padding: 36px 56px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; }
        .land-footer-logo { display: flex; align-items: center; gap: 8px; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 16px; color: rgba(240,244,255,0.5); text-decoration: none; }
        .land-footer-logo-icon { width: 28px; height: 28px; background: #f97316; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; }
        .land-footer-links { display: flex; gap: 24px; flex-wrap: wrap; }
        .land-footer-links a { font-size: 13px; color: rgba(240,244,255,0.3); text-decoration: none; transition: color 0.2s; }
        .land-footer-links a:hover { color: #f97316; }
        .land-footer-copy { font-size: 12px; color: rgba(240,244,255,0.2); }

        .land-wa { position: fixed; bottom: 24px; right: 24px; z-index: 99; width: 54px; height: 54px; background: #25D366; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(37,211,102,0.4); text-decoration: none; transition: transform 0.2s; }
        .land-wa:hover { transform: scale(1.1); }
        .land-wa-pulse { position: absolute; inset: -4px; border-radius: 50%; border: 2px solid rgba(37,211,102,0.4); animation: waPulse 2s infinite; }
        @keyframes waPulse { 0% { transform:scale(1); opacity:1; } 100% { transform:scale(1.4); opacity:0; } }

        @media (max-width: 768px) {
          .land-nav { padding: 0 20px; }
          .land-nav-links, .land-nav-ghost { display: none; }
          .land-hamburger { display: flex; }
          .land-hero { padding: 100px 20px 60px; }
          .land-section { padding: 64px 20px; }
          .land-footer { padding: 24px 20px; flex-direction: column; align-items: flex-start; }
          .land-track-form { flex-direction: column; }
          .land-coverage { flex-direction: column; gap: 20px; padding: 28px; }
          .land-coverage-map { font-size: 56px; }
          .land-cta { padding: 36px 24px; }
          .land-stats { gap: 20px; }
        }
      `}</style>

      <div className="land-root">

        {/* MOBILE MENU */}
        <div className={`land-mobile-menu${menuOpen ? ' open' : ''}`}>
          <button className="land-mobile-close" onClick={() => setMenuOpen(false)}>✕</button>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How It Works</a>
          <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
          <a href="#coverage" onClick={() => setMenuOpen(false)}>Coverage</a>
          <a href="/track" onClick={() => setMenuOpen(false)}>Track Order</a>
          {customer
            ? <a href="/account" onClick={() => setMenuOpen(false)} style={{ color:'#f97316' }}>My Account →</a>
            : <a href="/login" onClick={() => setMenuOpen(false)}>Sign In</a>
          }
          <a href="/book" onClick={() => setMenuOpen(false)} style={{ color:'#f97316' }}>Book Delivery →</a>
        </div>

        {/* NAV */}
        <nav className="land-nav">
          <a href="/" className="land-logo">
            <div className="land-logo-icon">🚀</div>
            SwiftByGwyn
          </a>
          <div className="land-nav-links">
            <a href="#how-it-works">How It Works</a>
            <a href="#pricing">Pricing</a>
            <a href="#coverage">Coverage</a>
            <a href="/track">Track Order</a>
          </div>
          <div className="land-nav-right">
            <a href="/track" className="land-nav-ghost">🔍 Track</a>
            {customer ? (
              <a href="/account" className="land-nav-user">
                👤 {customer.name?.split(' ')[0]}
              </a>
            ) : (
              <a href="/login" className="land-nav-ghost">Sign In</a>
            )}
            <a href="/book" className="land-nav-btn">📦 Book Delivery</a>
            <button className="land-hamburger" onClick={() => setMenuOpen(true)}>
              <span /><span /><span />
            </button>
          </div>
        </nav>

        {/* HERO */}
        <section className="land-hero">
          <div className="land-hero-badge">
            <div className="land-hero-badge-dot" />
            Greater Accra's Trusted Delivery Service
          </div>
          <h1 className="land-hero-title">
            Fast Delivery,<br /><span>Zero Stress</span>
          </h1>
          <p className="land-hero-sub">
            Book a delivery in minutes. Get a unique tracking ID instantly.
            SwiftByGwyn moves your packages across Greater Accra — fast, safe, and reliably.
          </p>
          <div className="land-hero-actions">
            <a href="/book" className="land-btn-primary">📦 Book a Delivery</a>
            <a href="#how-it-works" className="land-btn-secondary">How It Works</a>
          </div>

          <div className="land-track-bar" id="track">
            <div className="land-track-label">Already have an order? Track it here</div>
            <form className="land-track-form" onSubmit={handleTrack}>
              <input className="land-track-input" placeholder="Enter your Order ID e.g. SWG-X7K2M9" value={trackID} onChange={e => setTrackID(e.target.value)} />
              <button className="land-track-btn" type="submit">Track →</button>
            </form>
          </div>

          <div className="land-stats">
            {[
              { num:'500+',   label:'Deliveries Completed' },
              { num:'< 2hrs', label:'Avg. Delivery Time' },
              { num:'100%',   label:'Safe Delivery Rate' },
              { num:'24/7',   label:'Support Available' },
            ].map(s => (
              <div key={s.label} style={{ textAlign:'center' }}>
                <div className="land-stat-num">{s.num}</div>
                <div className="land-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="land-section" id="how-it-works" style={{ background:'rgba(255,255,255,0.02)' }}>
          <div className="land-section-inner">
            <div className="land-section-tag">Simple Process</div>
            <h2 className="land-section-title">How It Works</h2>
            <div className="land-steps">
              {[
                { num:'01', title:'Book Online', text:'Fill in pickup, drop-off, and package details. Choose your delivery type in under 3 minutes.' },
                { num:'02', title:'Get Your Order ID', text:'Receive a unique Order ID instantly. Share it with your recipient so they can track too.' },
                { num:'03', title:'Rider Assigned', text:'Our riders see your order and the first available one accepts it immediately.' },
                { num:'04', title:'Track in Real Time', text:'Monitor your delivery status live. Get updated at every stage from pickup to delivery.' },
              ].map(s => (
                <div key={s.num} className="land-step">
                  <div className="land-step-num">{s.num}</div>
                  <div className="land-step-title">{s.title}</div>
                  <div className="land-step-text">{s.text}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="land-section" id="pricing">
          <div className="land-section-inner">
            <div className="land-section-tag">Transparent Pricing</div>
            <h2 className="land-section-title">Simple, Flat-Rate Delivery Fees</h2>
            <div className="land-pricing">
              {[
                { icon:'🚶', name:'Standard',       desc:'Reliable delivery within the day. Perfect for non-urgent packages.',           fee:'GHS 30', eta:'2–4 hours',      featured:false },
                { icon:'⚡', name:'Same-Day',        desc:'Book before noon and your package arrives same day.',                          fee:'GHS 50', eta:'1–3 hours',      featured:false },
                { icon:'🚀', name:'Express / Urgent',desc:'Priority delivery for time-sensitive packages. Our fastest service.',          fee:'GHS 80', eta:'30–60 mins',     featured:true  },
                { icon:'📅', name:'Scheduled',       desc:'Pick your preferred date and time. We plan around your schedule.',             fee:'GHS 40', eta:'Your chosen time',featured:false },
              ].map(t => (
                <div key={t.name} className={`land-price-card${t.featured ? ' featured' : ''}`}>
                  {t.featured && <div className="land-price-badge">FASTEST</div>}
                  <div className="land-price-icon">{t.icon}</div>
                  <div className="land-price-name">{t.name}</div>
                  <div className="land-price-desc">{t.desc}</div>
                  <div className="land-price-fee">{t.fee}</div>
                  <div className="land-price-eta">⏱ {t.eta}</div>
                </div>
              ))}
            </div>
            <div style={{ textAlign:'center', marginTop:28, fontSize:13, color:'rgba(240,244,255,0.3)' }}>
              All fees are base rates within Greater Accra. Final price includes distance-based calculation.
            </div>
          </div>
        </section>

        {/* COVERAGE */}
        <section className="land-section" id="coverage" style={{ background:'rgba(255,255,255,0.02)' }}>
          <div className="land-section-inner">
            <div className="land-section-tag">Coverage Area</div>
            <h2 className="land-section-title">Where We Deliver</h2>
            <div className="land-coverage">
              <div className="land-coverage-map">🗺️</div>
              <div>
                <div className="land-coverage-title">Greater Accra Region</div>
                <p className="land-coverage-text">
                  We currently operate across the entire Greater Accra region including Accra, Tema, Madina, East Legon, Labone, Osu, Dzorwulu, Spintex, Teshie, Labadi, Adenta, Kasoa and surrounding areas.
                </p>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  <div className="land-coverage-tag">✅ Currently Active</div>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(249,115,22,0.08)', border:'1px solid rgba(249,115,22,0.2)', borderRadius:100, padding:'5px 14px', fontSize:12, color:'rgba(249,115,22,0.7)' }}>
                    🚀 Expanding Soon
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="land-section">
          <div className="land-section-inner">
            <div className="land-cta">
              <div className="land-cta-title">Ready to Send a Package?</div>
              <p className="land-cta-sub">
                {customer
                  ? `Welcome back, ${customer.name?.split(' ')[0]}! Book a delivery or check your order history.`
                  : 'Book online in minutes or reach us directly on WhatsApp. We\'ll take it from there.'
                }
              </p>
              <div className="land-cta-actions">
                <a href="/book" className="land-btn-primary" style={{ fontSize:15, padding:'15px 36px' }}>📦 Book a Delivery</a>
                {customer ? (
                  <a href="/account" className="land-btn-secondary" style={{ fontSize:15, padding:'15px 36px' }}>📋 My Orders</a>
                ) : (
                  <a href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent('Hi SwiftByGwyn! I\'d like to book a delivery.')}`} target="_blank" rel="noreferrer" className="land-cta-wa">
                    <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Chat on WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="land-footer">
          <a href="/" className="land-footer-logo">
            <div className="land-footer-logo-icon">🚀</div>
            SwiftByGwyn
          </a>
          <div className="land-footer-links">
            <a href="/book">Book Delivery</a>
            <a href="/track">Track Order</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#pricing">Pricing</a>
            <a href="/login">Sign In</a>
            <a href="/register">Register</a>
            <a href="/rider/login">Rider Login</a>
            <a href="/admin/login">Admin</a>
          </div>
          <div className="land-footer-copy">© {new Date().getFullYear()} SwiftByGwyn Delivery Service. All rights reserved.</div>
        </footer>

        {/* WHATSAPP FLOAT */}
        <a href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent('Hi SwiftByGwyn! I\'d like to book a delivery.')}`} target="_blank" rel="noreferrer" className="land-wa">
          <div className="land-wa-pulse" />
          <svg width="26" height="26" fill="white" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
      </div>
    </>
  )
}