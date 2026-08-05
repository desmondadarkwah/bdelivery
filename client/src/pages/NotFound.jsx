import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .nf-root { min-height: 100vh; background: #0b0f1a; font-family: 'Inter', sans-serif; color: #f0f4ff; display: flex; align-items: center; justify-content: center; padding: 40px 24px; }
        .nf-inner { text-align: center; max-width: 480px; }
        .nf-num { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(80px, 20vw, 140px); color: rgba(249,115,22,0.15); letter-spacing: -0.04em; line-height: 1; margin-bottom: 8px; }
        .nf-icon { font-size: 48px; margin-bottom: 20px; }
        .nf-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 26px; color: #fff; margin-bottom: 12px; }
        .nf-sub { font-size: 14px; color: rgba(240,244,255,0.4); line-height: 1.7; margin-bottom: 36px; }
        .nf-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
        .nf-btn { padding: 13px 28px; background: #f97316; color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; transition: opacity 0.2s; }
        .nf-btn:hover { opacity: 0.88; }
        .nf-btn-ghost { padding: 13px 28px; background: transparent; color: rgba(240,244,255,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; font-size: 14px; cursor: pointer; text-decoration: none; transition: all 0.2s; }
        .nf-btn-ghost:hover { border-color: rgba(249,115,22,0.3); color: #f97316; }
      `}</style>

      <div className="nf-root">
        <div className="nf-inner">
          <div className="nf-num">404</div>
          <div className="nf-icon">🔍</div>
          <div className="nf-title">Page Not Found</div>
          <p className="nf-sub">The page you're looking for doesn't exist or has been moved. Check the URL or go back home.</p>
          <div className="nf-actions">
            <a href="/" className="nf-btn">← Back to Home</a>
            <a href="/book" className="nf-btn-ghost">📦 Book a Delivery</a>
          </div>
        </div>
      </div>
    </>
  )
}