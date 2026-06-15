import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthSplitLayout from '../components/auth/AuthSplitLayout.jsx';
import AuthField from '../components/auth/AuthField.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { supabase } from '../supabase/client.js';
import { AUTH_IMAGES } from '../auth/authConstants.js';

const ACCENT = '#7B2FFF';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email.trim() || !password) {
      setError('Enter your email and password to re-enter the city.');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      // User logged in successfully
      const firstName = data.user?.user_metadata?.full_name?.split(' ')[0] || 'Mwananchi';
      navigate('/auth/success', { state: { name: firstName } });
    } catch (err) {
      setError('Login failed. Please try again.');
      setIsLoading(false);
    }
  }

  return (
    <AuthSplitLayout
      imageSrc={AUTH_IMAGES.login}
      imageAlt="Nairobi nightlife"
      imageFallback="linear-gradient(180deg,#1a0010,#440020,#0a0008)"
      overlayStyle={{ background: 'linear-gradient(135deg,rgba(0,0,0,0.2),rgba(8,8,8,0.75))' }}
      logoAccent={ACCENT}
      topSticker={
        <div className="auth-sticker" style={{ background: '#FF2D78', color: '#fff', animationDelay: '0.3s' }}>
          JUNE 25 · 2024
        </div>
      }
      quoteSticker={
        <div className="auth-sticker" style={{ background: '#FF2D78', color: '#fff', marginBottom: 14 }}>
          REMEMBER THIS DAY
        </div>
      }
      quoteTitle={
        <>
          &ldquo;They knelt so
          <br />
          the city
          <br />
          could stand.&rdquo;
        </>
      }
      quoteSub="— JUNE 25, 2024 · NAIROBI, KENYA"
    >
      <form className="auth-form-shell" onSubmit={handleSubmit}>
        <div className="auth-form-block">
          <div className="auth-kicker" style={{ color: ACCENT }}>// RETURNING PASSENGER</div>
          <h1 className="auth-title rgb">
            WELCOME
            <br />
            BACK
          </h1>
          <p className="auth-subtitle">
            The city remembers you.
            <span className="auth-cursor" style={{ background: ACCENT }} />
          </p>
        </div>

        <div className="auth-form-block delay-1">
          <AuthField id="li-email" label="EMAIL ADDRESS" type="email" accent={ACCENT} value={email} onChange={(e) => setEmail(e.target.value)} />
          <AuthField id="li-pw" label="PASSWORD" type="password" accent={ACCENT} value={password} onChange={(e) => setPassword(e.target.value)} />
          <div className="auth-forgot" style={{ color: ACCENT }}>Locked out? Tutakusaidia.</div>
        </div>

        <div className="auth-form-block delay-2">
          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-cta-btn" style={{ background: ACCENT, color: '#fff' }} disabled={isLoading}>
            {isLoading ? 'ENTERING...' : 'RE-ENTER THE CITY →'}
          </button>

          <div className="auth-divider"><span>OR</span></div>

          <button type="button" className="auth-oauth-btn">
            <span style={{ fontWeight: 900, fontSize: 16 }}>G</span> Continue with Google
          </button>
          <button type="button" className="auth-oauth-btn spotify">♪ Continue with Spotify</button>

          <div className="auth-switch-link">
            New here? <Link to="/signup" style={{ color: ACCENT }}>Join the Movement →</Link>
          </div>
        </div>
      </form>
    </AuthSplitLayout>
  );
}
