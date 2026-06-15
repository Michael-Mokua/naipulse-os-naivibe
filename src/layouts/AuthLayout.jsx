import { Outlet } from 'react-router-dom';
import AuthParticles from '../components/auth/AuthParticles.jsx';
import AuthScanline from '../components/auth/AuthScanline.jsx';
import '../styles/auth.css';

export default function AuthLayout() {
  return (
    <div className="auth-shell">
      <AuthScanline />
      <AuthParticles />
      <Outlet />
    </div>
  );
}
