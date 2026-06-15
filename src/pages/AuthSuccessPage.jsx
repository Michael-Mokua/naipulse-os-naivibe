import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AUTH_IMAGES } from '../auth/authConstants.js';

export default function AuthSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const name = location.state?.name || 'Mwananchi';

  useEffect(() => {
    const timer = setTimeout(() => navigate('/'), 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="auth-success">
      <img src={AUTH_IMAGES.skyline} alt="" className="auth-success-bg" onError={(e) => e.currentTarget.remove()} />
      <div className="auth-success-content">
        <div className="auth-success-kicker">// NAIPULSE OS · CITY ACCESS GRANTED</div>
        <div className="auth-success-badge">✓</div>
        <h2 className="auth-success-title">YOU&apos;RE IN THE CITY.</h2>
        <p className="auth-success-sub">Welcome to NaiPulse OS, {name}.</p>
        <div className="auth-load-track">
          <div className="auth-load-bar" />
        </div>
        <p className="auth-load-note">LOADING YOUR CITY...</p>
        <Link to="/" className="auth-back-btn">← BACK</Link>
      </div>
    </div>
  );
}
