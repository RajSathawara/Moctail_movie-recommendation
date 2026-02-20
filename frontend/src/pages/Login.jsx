import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { login } from '../services/api';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const showToast = (msg, type = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return showToast('Please fill in all fields.');
    setLoading(true);
    try {
      const res = await login(email, password);
      
      localStorage.setItem("token", res.data.token);
      localStorage.setItem('moctail_user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      showToast(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <Navbar />
      <div className="auth-center">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Ready for your next cinematic adventure?</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrap">
                <span className="input-icon">✉️</span>
                <input
                  id="login-email"
                  className="form-input"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <div className="auth-label-row">
                <label className="form-label">Password</label>
                <button type="button" className="forgot-link">Forgot Password?</button>
              </div>
              <div className="input-wrap">
                <span className="input-icon">🔒</span>
                <input
                  id="login-password"
                  className="form-input"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button type="button" className="input-suffix" onClick={() => setShowPw(!showPw)}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <label className="remember-row">
              <input
                type="checkbox"
                className="remember-checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Remember me for 30 days</span>
            </label>

            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary auth-submit-btn"
              disabled={loading}
            >
              {loading ? <span className="btn-spinner" /> : <>Sign In →</>}
            </button>
          </form>

          <div className="divider">OR CONTINUE WITH</div>

          <div className="social-row">
            <button className="social-btn">
              <span className="social-logo">G</span> Google
            </button>
            <button className="social-btn">
              <span className="social-logo">🍎</span> Apple
            </button>
          </div>

          <p className="auth-footer-text">
            New to Moctail?{' '}
            <Link to="/register" className="auth-link">Join now</Link>
          </p>
        </div>
      </div>

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
        </div>
      )}
    </div>
  );
}