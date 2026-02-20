import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { register } from '../services/api';
import './Auth.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const showToast = (msg, type = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return showToast('Please fill in all fields.');
    if (password.length < 6) return showToast('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await register(name, email, password);
      showToast('Account created! Please sign in.', 'success');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      showToast(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page--register">
      <div className="auth-bg auth-bg--register" />
      <Navbar />
      <div className="auth-center">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Join the Cinema Experience</h1>
            <p className="auth-subtitle">Create your account to get personalized recommendations tailored to your unique taste.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-wrap">
                <span className="input-icon">👤</span>
                <input
                  id="register-name"
                  className="form-input"
                  type="text"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrap">
                <span className="input-icon">✉️</span>
                <input
                  id="register-email"
                  className="form-input"
                  type="email"
                  placeholder="jane@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrap">
                <span className="input-icon">🔒</span>
                <input
                  id="register-password"
                  className="form-input"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button type="button" className="input-suffix" onClick={() => setShowPw(!showPw)}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              id="register-submit"
              type="submit"
              className="btn btn-primary auth-submit-btn"
              disabled={loading}
            >
              {loading ? <span className="btn-spinner" /> : <>Create Account →</>}
            </button>
          </form>

          <div className="divider">OR SIGN UP WITH</div>

          <div className="social-row">
            <button className="social-btn">
              <span className="social-logo">G</span> Google
            </button>
            <button className="social-btn">
              <span className="social-logo">🍎</span> Apple
            </button>
          </div>

          <p className="auth-footer-text">
            Already a member?{' '}
            <Link to="/login" className="auth-link">Sign In</Link>
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