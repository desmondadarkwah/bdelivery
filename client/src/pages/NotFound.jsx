import { useTenant } from '../context/TenantContext'

export default function NotFound() {
  const { tenant } = useTenant()
  const brandColor = tenant?.brandColor || '#f97316'
  const bizName    = tenant?.businessName || 'Bdelivery'
  const logo       = tenant?.logo || null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --brand: ${brandColor}; }
        .nf-root { min-height: 100vh; background: #0b0f1a; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 24px; font-family: 'Inter', sans-serif; text-align: center; }
        .nf-logo { display: flex; align-items: center; gap: 10px; justify-content: center; margin-bottom: 48px; text-decoration: none; }
        .nf-logo-icon { width: 36px; height: 36px; background: var(--brand); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
        .nf-logo-text { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; color: #fff; }
        .nf-code { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 96px; color: var(--brand); line-height: 1; margin-bottom: 16px; opacity: 0.15; }
        .nf-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: #fff; margin-bottom: 12px; }
        .nf-sub { font-size: 14px; color: rgba(240,244,255,0.4); max-width: 380px; line-height: 1.7; margin-bottom: 36px; }
        .nf-actions { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
        .nf-btn { padding: 13px 28px; background: var(--brand); color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; transition: opacity 0.2s; }
        .nf-btn:hover { opacity: 0.88; }
        .nf-btn-ghost { padding: 13px 28px; background: transparent; color: rgba(240,244,255,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; font-size: 14px; cursor: pointer; text-decoration: none; transition: all 0.2s; }
        .nf-btn-ghost:hover { border-color: var(--brand); color: var(--brand); }
      `}</style>

      <div className="nf-root">
        <a href="/" className="nf-logo">
          {logo
            ? <img src={logo} alt="logo" style={{ width:36, height:36, borderRadius:8, objectFit:'cover' }} />
            : <div className="nf-logo-icon">🚀</div>
          }
          <div className="nf-logo-text">{bizName}</div>
        </a>
        <div className="nf-code">404</div>
        <div className="nf-title">Page Not Found</div>
        <p className="nf-sub">The page you're looking for doesn't exist or has been moved.</p>
        <div className="nf-actions">
          <a href="/" className="nf-btn">Back to Home</a>
          <a href="/track" className="nf-btn-ghost">Track an Order</a>
        </div>
      </div>
    </>
  )
}