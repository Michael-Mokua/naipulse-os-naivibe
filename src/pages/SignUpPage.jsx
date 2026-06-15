import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthSplitLayout from '../components/auth/AuthSplitLayout.jsx';
import AuthField from '../components/auth/AuthField.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { supabase } from '../supabase/client.js';
import { AUTH_IMAGES, STRENGTH_LEVELS, getPasswordStrength } from '../auth/authConstants.js';

const ACCENT = '#00FF88';

export default function SignUpPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const strength = getPasswordStrength(password);
  const strengthLevel = strength >= 0 ? STRENGTH_LEVELS[strength] : null;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    if (!name.trim() || !email.trim() || !confirmEmail.trim() || !password || !confirmPassword) {
      setError('Fill in all fields to board the nganya.');
      setIsLoading(false);
      return;
    }

    if (email !== confirmEmail) {
      setError('Email addresses hazifanani — try again.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords hazifanani — try again.');
      setIsLoading(false);
      return;
    }

    if (strength < 2) {
      setError('Password iko weak — make it poa kabisa.');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: name.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/success`,
        },
      });

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        // Email confirmation required
        const firstName = name.trim().split(' ')[0];
        navigate('/verify-email', { state: { email: email, name: firstName } });
      } else if (data.session) {
        // Auto-confirmed (email verification disabled in Supabase)
        const firstName = name.trim().split(' ')[0];
        navigate('/auth/success', { state: { name: firstName } });
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
      setIsLoading(false);
    }
  }

  return (
    <AuthSplitLayout
      imageSrc={AUTH_IMAGES.signup}
      imageAlt="Nganya matatu"
      imageFallback="linear-gradient(135deg,#1a0a00,#FF4400,#2a0a00)"
      logoAccent={ACCENT}
      topSticker={
        <div className="auth-sticker" style={{ background: '#FFD600', color: '#080808', animationDelay: '0.5s' }}>
          ROUTE 001 · NEW PASSENGER
        </div>
      }
      quoteSticker={
        <div className="auth-sticker" style={{ background: ACCENT, color: '#080808', marginBottom: 14 }}>
          NEXT STOP: THE CITY
        </div>
      }
      quoteTitle={
        <>
          &ldquo;Every legend
          <br />
          started somewhere.
          <br />
          This is your stop.&rdquo;
        </>
      }
      quoteSub="— NAIROBI, ALWAYS · EST. FOREVER"
    >
      <form className="auth-form-shell" onSubmit={handleSubmit}>
        <div className="auth-form-block">
          <div className="auth-kicker" style={{ color: ACCENT }}>// NEW PASSENGER</div>
          <h1 className="auth-title glitch">
            JOIN THE CITY
            <span className="auth-cursor" style={{ background: ACCENT }} />
          </h1>
          <p className="auth-subtitle">Nairobi Intelligence Platform · Est. 2025</p>
        </div>

        <div className="auth-form-block delay-1">
          <AuthField id="su-name" label="FULL NAME" accent={ACCENT} value={name} onChange={(e) => setName(e.target.value)} />
          <AuthField id="su-email" label="EMAIL ADDRESS" type="email" accent={ACCENT} value={email} onChange={(e) => setEmail(e.target.value)} />
          <AuthField id="su-email2" label="CONFIRM EMAIL" type="email" accent={ACCENT} value={confirmEmail} onChange={(e) => setConfirmEmail(e.target.value)} />
          <AuthField id="su-pw" label="PASSWORD" type="password" accent={ACCENT} value={password} onChange={(e) => setPassword(e.target.value)} />

          {strengthLevel && (
            <div style={{ marginTop: -10, marginBottom: 14 }}>
              <div className="auth-strength-track">
                <div
                  className="auth-strength-fill"
                  style={{ width: strengthLevel.width, background: strengthLevel.color }}
                />
              </div>
              <div className="auth-strength-label" style={{ color: strengthLevel.color }}>
                {strengthLevel.label}
              </div>
            </div>
          )}

          <AuthField
            id="su-pw2"
            label="CONFIRM PASSWORD"
            type="password"
            accent={ACCENT}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <div className="auth-form-block delay-2">
          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-cta-btn" style={{ background: ACCENT, color: '#080808' }} disabled={isLoading}>
            {isLoading ? 'BOARDING...' : 'BOARD THE NGANYA →'}
          </button>

          <div className="auth-divider"><span>OR ENTER VIA</span></div>

          <button type="button" className="auth-oauth-btn">
            <span style={{ fontWeight: 900, fontSize: 16 }}>G</span> Continue with Google
          </button>
          <button type="button" className="auth-oauth-btn spotify">♪ Continue with Spotify</button>

          <div className="auth-switch-link">
            Already in the city? <Link to="/login" style={{ color: ACCENT }}>Log In →</Link>
          </div>
        </div>
      </form>
    </AuthSplitLayout>
  );
}
