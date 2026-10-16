import { useState } from 'react'

export default function BdeliveryLanding() {
  const [email, setEmail]     = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060810; }
        .bd-root { min-height: 100vh; background: #060810; font-family: 'Inter', sans-serif; color: #f0f4ff; }

        /* NAV */
        .bd-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(6,8,16,0.95); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(255,255,255,0.06); padding: 0 56px; height: 68px; display: flex; align-items: center; justify-content: space-between; }
        .bd-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .bd-logo-icon { width: 36px; height: 36px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
        .bd-logo-text { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; color: #fff; }
        .bd-nav-right { display: flex; align-items: center; gap: 12px; }
        .bd-nav-link { font-size: 13px; color: rgba(240,244,255,0.5); text-decoration: none; transition: color 0.2s; }
        .bd-nav-link:hover { color: #fff; }
        .bd-nav-btn { padding: 9px 22px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; }

        /* HERO */
        .bd-hero { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 120px 24px 80px; text-align: center; position: relative; overflow: hidden; }
        .bd-hero::before { content: ''; position: absolute; top: -200px; left: 50%; transform: translateX(-50%); width: 900px; height: 900px; border-radius: 50%; background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%); pointer-events: none; }
        .bd-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.25); border-radius: 100px; padding: 6px 16px; margin-bottom: 28px; font-size: 12px; color: #a5b4fc; font-weight: 500; }
        .bd-badge-dot { width: 6px; height: 6px; background: #6366f1; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
        .bd-hero-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(38px, 6vw, 72px); line-height: 1.05; letter-spacing: -0.03em; color: #fff; margin-bottom: 24px; max-width: 800px; }
        .bd-hero-title span { background: linear-gradient(135deg, #6366f1, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .bd-hero-sub { font-size: clamp(15px, 2vw, 18px); color: rgba(240,244,255,0.5); max-width: 560px; line-height: 1.75; margin-bottom: 40px; }
        .bd-hero-actions { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; margin-bottom: 60px; }
        .bd-btn-primary { padding: 15px 36px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; text-decoration: none; transition: opacity 0.2s; }
        .bd-btn-primary:hover { opacity: 0.88; }
        .bd-btn-ghost { padding: 15px 32px; background: transparent; color: rgba(240,244,255,0.6); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; font-size: 15px; cursor: pointer; text-decoration: none; transition: all 0.2s; }
        .bd-btn-ghost:hover { border-color: #6366f1; color: #a5b4fc; }

        /* STATS */
        .bd-stats { display: flex; gap: 48px; justify-content: center; flex-wrap: wrap; padding: 32px 0; border-top: 1px solid rgba(255,255,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.06); }
        .bd-stat-num { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: #fff; }
        .bd-stat-label { font-size: 12px; color: rgba(240,244,255,0.35); margin-top: 4px; }

        /* HOW IT WORKS */
        .bd-section { padding: 96px 56px; }
        .bd-section-inner { max-width: 1100px; margin: 0 auto; }
        .bd-section-tag { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #6366f1; margin-bottom: 14px; }
        .bd-section-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(26px, 4vw, 42px); letter-spacing: -0.02em; color: #fff; margin-bottom: 48px; line-height: 1.1; }

        .bd-steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; }
        .bd-step { background: rgba(99,102,241,0.04); border: 1px solid rgba(99,102,241,0.12); border-radius: 16px; padding: 28px; transition: border-color 0.2s; }
        .bd-step:hover { border-color: rgba(99,102,241,0.3); }
        .bd-step-num { width: 40px; height: 40px; background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.25); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 15px; color: #a5b4fc; margin-bottom: 16px; }
        .bd-step-title { font-size: 15px; font-weight: 600; color: #fff; margin-bottom: 8px; }
        .bd-step-text { font-size: 13px; color: rgba(240,244,255,0.4); line-height: 1.7; }

        /* FEATURES */
        .bd-features { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; }
        .bd-feature { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 28px; }
        .bd-feature-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
        .bd-feature-title { font-size: 15px; font-weight: 600; color: #fff; margin-bottom: 8px; }
        .bd-feature-text { font-size: 13px; color: rgba(240,244,255,0.4); line-height: 1.7; }

        /* PRICING */
        .bd-pricing { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
        .bd-price-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 32px; transition: all 0.2s; position: relative; }
        .bd-price-card:hover { border-color: rgba(99,102,241,0.3); }
        .bd-price-card.featured { border-color: rgba(99,102,241,0.4); background: rgba(99,102,241,0.05); }
        .bd-price-popular { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; font-size: 11px; font-weight: 700; padding: 4px 14px; border-radius: 100px; white-space: nowrap; }
        .bd-price-plan { font-size: 13px; font-weight: 600; color: rgba(240,244,255,0.5); margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.06em; }
        .bd-price-amount { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 36px; color: #fff; margin-bottom: 4px; }
        .bd-price-period { font-size: 13px; color: rgba(240,244,255,0.3); margin-bottom: 20px; }
        .bd-price-features { list-style: none; display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px; }
        .bd-price-feature { display: flex; align-items: center; gap: 10px; font-size: 13px; color: rgba(240,244,255,0.6); }
        .bd-price-feature-dot { width: 6px; height: 6px; border-radius: 50%; background: #6366f1; flex-shrink: 0; }
        .bd-price-btn { width: 100%; padding: 13px; background: rgba(99,102,241,0.15); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.3); border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; text-align: center; text-decoration: none; display: block; }
        .bd-price-btn:hover { background: #6366f1; color: #fff; border-color: #6366f1; }
        .bd-price-btn.featured { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; border: none; }

        /* CTA */
        .bd-cta { background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.06)); border: 1px solid rgba(99,102,241,0.2); border-radius: 24px; padding: 64px 48px; text-align: center; }
        .bd-cta-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(24px, 4vw, 40px); color: #fff; margin-bottom: 14px; }
        .bd-cta-sub { font-size: 16px; color: rgba(240,244,255,0.45); margin-bottom: 36px; line-height: 1.7; max-width: 500px; margin-left: auto; margin-right: auto; }
        .bd-cta-form { display: flex; gap: 10px; max-width: 440px; margin: 0 auto; }
        .bd-cta-input { flex: 1; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 14px 16px; font-size: 14px; color: #fff; outline: none; font-family: 'Inter', sans-serif; }
        .bd-cta-input::placeholder { color: rgba(240,244,255,0.25); }
        .bd-cta-input:focus { border-color: #6366f1; }
        .bd-cta-submit { padding: 14px 24px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; white-space: nowrap; }

        /* FOOTER */
        .bd-footer { border-top: 1px solid rgba(255,255,255,0.06); padding: 36px 56px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; }
        .bd-footer-copy { font-size: 12px; color: rgba(240,244,255,0.2); }
        .bd-footer-links { display: flex; gap: 24px; }
        .bd-footer-links a { font-size: 13px; color: rgba(240,244,255,0.3); text-decoration: none; }
        .bd-footer-links a:hover { color: #a5b4fc; }

        @media (max-width: 768px) {
          .bd-nav { padding: 0 20px; }
          .bd-nav-link { display: none; }
          .bd-hero { padding: 100px 20px 60px; }
          .bd-section { padding: 64px 20px; }
          .bd-footer { padding: 24px 20px; flex-direction: column; }
          .bd-cta { padding: 40px 24px; }
          .bd-cta-form { flex-direction: column; }
          .bd-stats { gap: 24px; }
        }
      `}</style>

      <div className="bd-root">
        {/* NAV */}
        <nav className="bd-nav">
          <div className="bd-logo">
            <div className="bd-logo-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/><rect x="9" y="11" width="14" height="10" rx="2"/><circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              </svg>
            </div>
            <div className="bd-logo-text">Bdelivery</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:32 }}>
            <a href="#how-it-works" className="bd-nav-link">How It Works</a>
            <a href="#features" className="bd-nav-link">Features</a>
            <a href="#pricing" className="bd-nav-link">Pricing</a>
          </div>
          <div className="bd-nav-right">
            <a href="/super/login" className="bd-nav-link">Admin Login</a>
            <a href="#get-started" className="bd-nav-btn">Get Started</a>
          </div>
        </nav>

        {/* HERO */}
        <section className="bd-hero">
          <div className="bd-badge">
            <div className="bd-badge-dot" />
            The Delivery Platform for African Businesses
          </div>
          <h1 className="bd-hero-title">
            Launch Your Own<br /><span>Delivery Business</span><br />in Minutes
          </h1>
          <p className="bd-hero-sub">
            Bdelivery gives you everything you need to run a professional delivery service — your own branded platform, rider app, customer tracking and admin dashboard.
          </p>
          <div className="bd-hero-actions">
            <a href="#get-started" className="bd-btn-primary">Start Free Trial</a>
            <a href="#how-it-works" className="bd-btn-ghost">See How It Works</a>
          </div>
          <div className="bd-stats">
            {[
              { num:'14 Days',  label:'Free Trial' },
              { num:'< 5 mins', label:'Setup Time' },
              { num:'100%',     label:'Your Branding' },
              { num:'24/7',     label:'Real-time Tracking' },
            ].map(s => (
              <div key={s.label} style={{ textAlign:'center' }}>
                <div className="bd-stat-num">{s.num}</div>
                <div className="bd-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="bd-section" id="how-it-works" style={{ background:'rgba(255,255,255,0.01)' }}>
          <div className="bd-section-inner">
            <div className="bd-section-tag">Simple Setup</div>
            <h2 className="bd-section-title">You're live in 4 steps</h2>
            <div className="bd-steps">
              {[
                { num:'01', title:'Contact Us',          text:'Reach out via WhatsApp or email. We set up your account within the hour.' },
                { num:'02', title:'Customise Your Brand', text:'Add your logo, brand colors, business name and delivery fees. Looks 100% like your own app.' },
                { num:'03', title:'Add Your Riders',      text:'Create rider accounts. They download nothing — they just login on their phone browser.' },
                { num:'04', title:'Start Taking Orders',  text:'Share your link with customers. They book, riders deliver, you manage everything from your dashboard.' },
              ].map(s => (
                <div key={s.num} className="bd-step">
                  <div className="bd-step-num">{s.num}</div>
                  <div className="bd-step-title">{s.title}</div>
                  <div className="bd-step-text">{s.text}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="bd-section" id="features">
          <div className="bd-section-inner">
            <div className="bd-section-tag">Everything Included</div>
            <h2 className="bd-section-title">A complete delivery platform</h2>
            <div className="bd-features">
              {[
                {
                  color:'rgba(99,102,241,0.15)', border:'rgba(99,102,241,0.3)',
                  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
                  title:'Your Own Branded Platform',
                  text:'Your logo, your colors, your domain. Customers see your brand — not Bdelivery. Fully white-labeled.',
                },
                {
                  color:'rgba(34,197,94,0.15)', border:'rgba(34,197,94,0.3)',
                  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#86efac" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
                  title:'Real-time Order Tracking',
                  text:'Customers track their delivery live. Riders update status at every step from pickup to delivery.',
                },
                {
                  color:'rgba(249,115,22,0.15)', border:'rgba(249,115,22,0.3)',
                  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fdba74" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
                  title:'Rider Management',
                  text:'Add riders, track their deliveries, manage earnings and cash remittance all from one dashboard.',
                },
                {
                  color:'rgba(59,130,246,0.15)', border:'rgba(59,130,246,0.3)',
                  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
                  title:'Payment Tracking',
                  text:'Track cash and Mobile Money payments. See exactly what each rider has collected and remitted.',
                },
                {
                  color:'rgba(168,85,247,0.15)', border:'rgba(168,85,247,0.3)',
                  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d8b4fe" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
                  title:'Live Notifications',
                  text:'Riders get instant notifications when new orders arrive. Admin sees everything update in real time.',
                },
                {
                  color:'rgba(245,158,11,0.15)', border:'rgba(245,158,11,0.3)',
                  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fcd34d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
                  title:'Reports & Analytics',
                  text:'See your revenue, completion rates, rider performance and payment reconciliation at a glance.',
                },
              ].map(f => (
                <div key={f.title} className="bd-feature">
                  <div className="bd-feature-icon" style={{ background: f.color, border:`1px solid ${f.border}` }}>
                    {f.icon}
                  </div>
                  <div className="bd-feature-title">{f.title}</div>
                  <div className="bd-feature-text">{f.text}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="bd-section" id="pricing" style={{ background:'rgba(255,255,255,0.01)' }}>
          <div className="bd-section-inner">
            <div className="bd-section-tag">Simple Pricing</div>
            <h2 className="bd-section-title">Start free. Scale as you grow.</h2>
            <div className="bd-pricing">
              {[
                {
                  plan:'Trial', amount:'Free', period:'14 days',
                  features:['Up to 50 orders','Up to 3 riders','Full platform access','No credit card needed'],
                  featured: false,
                },
                {
                  plan:'Starter', amount:'GHS 200', period:'per month',
                  features:['Up to 200 orders/month','Up to 5 riders','Custom branding','WhatsApp notifications'],
                  featured: true, popular: true,
                },
                {
                  plan:'Growth', amount:'GHS 500', period:'per month',
                  features:['Up to 1,000 orders/month','Up to 15 riders','Priority support','Advanced reports'],
                  featured: false,
                },
                {
                  plan:'Pro', amount:'GHS 1,000', period:'per month',
                  features:['Unlimited orders','Unlimited riders','Custom domain','Dedicated support'],
                  featured: false,
                },
              ].map(p => (
                <div key={p.plan} className={`bd-price-card${p.featured ? ' featured' : ''}`}>
                  {p.popular && <div className="bd-price-popular">Most Popular</div>}
                  <div className="bd-price-plan">{p.plan}</div>
                  <div className="bd-price-amount">{p.amount}</div>
                  <div className="bd-price-period">{p.period}</div>
                  <ul className="bd-price-features">
                    {p.features.map(f => (
                      <li key={f} className="bd-price-feature">
                        <div className="bd-price-feature-dot" style={{ background: p.featured ? '#6366f1' : 'rgba(255,255,255,0.2)' }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a href="#get-started" className={`bd-price-btn${p.featured ? ' featured' : ''}`}>
                    {p.plan === 'Trial' ? 'Start Free Trial' : 'Get Started'}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bd-section" id="get-started">
          <div className="bd-section-inner">
            <div className="bd-cta">
              <div className="bd-cta-title">Ready to Launch Your Delivery Business?</div>
              <p className="bd-cta-sub">Leave your email and we'll set up your free 14-day trial within the hour. No credit card required.</p>
              {submitted ? (
                <div style={{ padding:'16px 24px', background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.25)', borderRadius:12, color:'#86efac', fontSize:14, maxWidth:440, margin:'0 auto' }}>
                  We received your request! We'll contact you within the hour to set up your account.
                </div>
              ) : (
                <form className="bd-cta-form" onSubmit={handleSubmit}>
                  <input className="bd-cta-input" type="email" required placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                  <button className="bd-cta-submit" type="submit">Get Started Free</button>
                </form>
              )}
              <div style={{ marginTop:20, fontSize:12, color:'rgba(240,244,255,0.25)' }}>
                Or contact us directly on WhatsApp
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bd-footer">
          <div className="bd-logo">
            <div className="bd-logo-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/><rect x="9" y="11" width="14" height="10" rx="2"/><circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              </svg>
            </div>
            <div className="bd-logo-text" style={{ fontSize:16 }}>Bdelivery</div>
          </div>
          <div className="bd-footer-links">
            <a href="#how-it-works">How It Works</a>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="/super/login">Admin</a>
          </div>
          <div className="bd-footer-copy">© {new Date().getFullYear()} Bdelivery. All rights reserved.</div>
        </footer>
      </div>
    </>
  )
}