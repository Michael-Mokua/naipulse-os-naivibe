import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthSplitLayout from '../components/auth/AuthSplitLayout.jsx';
import AuthField from '../components/auth/AuthField.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { supabase } from '../supabase/client.js';
import { AUTH_IMAGES } from '../auth/authConstants.js';

const ACCENT = '#00D4FF';

export default function EmailVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const email = location.state?.email || '';
  const name = location.state?.name || 'Mwananchi';
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    if (!verificationCode.trim()) {
      setError('Enter the verification code sent to your email.');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: verificationCode,
        type: 'signup',
      });

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      // Email verified successfully
      navigate('/auth/success', { state: { name: name } });
    } catch (err) {
      setError('Verification failed. Please try again.');
      setIsLoading(false);
    }
  }

  async function handleResendCode() {
    setIsResending(true);
    setError('');

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        setError(error.message);
        setIsResending(false);
        return;
      }

      setIsResending(false);
      alert('Verification code resent to ' + email);
    } catch (err) {
      setError('Failed to resend code. Please try again.');
      setIsResending(false);
    }
  }

  return (
    <AuthSplitLayout
      imageSrc={AUTH_IMAGES.skyline}
      imageAlt="Nairobi skyline"
      imageFallback="linear-gradient(180deg,#0a1a2a,#004466,#0a0a1a)"
      overlayStyle={{ background: 'linear-gradient(135deg,rgba(0,0,0,0.3),rgba(8,8,8,0.8))' }}
      logoAccent={ACCENT}
      topSticker={
        <div className="auth-sticker" style={{ background: ACCENT, color: '#080808', animationDelay: '0.3s' }}>
          VERIFY EMAIL
        </div>
      }
      quoteSticker={
        <div className="auth-sticker" style={{ background: '#FFD600', color: '#080808', marginBottom: 14 }}>
          CHECK YOUR INBOX
        </div>
      }
      quoteTitle={
        <>
          &ldquo;Confirm your
          <br />
          email to enter
          <br />
          the city.&rdquo;
        </>
      }
      quoteSub="— NAIPULSE OS · SECURITY FIRST"
    >
      <form className="auth-form-shell" onSubmit={handleSubmit}>
        <div className="auth-form-block">
          <div className="auth-kicker" style={{ color: ACCENT }}>// EMAIL VERIFICATION</div>
          <h1 className="auth-title glitch">
            VERIFY
            <br />
            YOUR EMAIL
          </h1>
          <p className="auth-subtitle">
            We sent a 6-digit code to <strong>{email}</strong>
            <span className="auth-cursor" style={{ background: ACCENT }} />
          </p>
        </div>

        <div className="auth-form-block delay-1">
          <AuthField
            id="ev-code"
            label="VERIFICATION CODE"
            type="text"
            placeholder="Enter 6-digit code"
            accent={ACCENT}
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
          />
          <div className="auth-verification-note">
            Didn't receive the code?{' '}
            <button
              type="button"
              className="auth-resend-link"
              onClick={handleResendCode}
              disabled={isResending}
              style={{ color: ACCENT, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {isResending ? 'Resending...' : 'Resend Code'}
            </button>
          </div>
        </div>

        <div className="auth-form-block delay-2">
          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-cta-btn" style={{ background: ACCENT, color: '#080808' }} disabled={isLoading}>
            {isLoading ? 'VERIFYING...' : 'VERIFY & ENTER →'}
          </button>

          <div className="auth-divider"><span>OR</span></div>

          <div className="auth-switch-link">
            Wrong email? <Link to="/login" style={{ color: ACCENT }}>Go Back →</Link>
          </div>
        </div>
      </form>
    </AuthSplitLayout>
  );
}
