import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useBusiness } from '../context/BusinessContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { parseApiError } from '../api/errors.js';

export default function Login() {
  const { login } = useAuth();
  const { features } = useBusiness();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [validated, setValidated] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', remember_me: false });
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    setValidated(true);
    setBusy(true);
    try {
      await login(form);
      navigate(location.state?.from || '/user/dashboard', { replace: true });
    } catch (err) {
      toast.error(parseApiError(err).message);
    } finally { setBusy(false); }
  };

  return (
    <section className="auth">
      <div className="container">
        <div className="auth-card">
          <div className="auth-visual">
            <span className="brand brand-auth">
              AppTheta Ecom<span>.</span>
            </span>
            <h2>Welcome back</h2>
            <p>Track orders, save your wishlist and check out faster every time.</p>
            <ul className="auth-perks">
              <li>
                <i className="bi bi-check2"></i> Free returns within 14 days
              </li>
              <li>
                <i className="bi bi-check2"></i> Early access to every drop
              </li>
              <li>
                <i className="bi bi-check2"></i> Members-only pricing
              </li>
            </ul>
          </div>

          <div className="auth-form">
            <h1 className="auth-title">Log in</h1>
            <p className="auth-sub">
              New here? <Link to="/register">Create an account</Link>
            </p>

            <form className={`needs-validation${validated ? ' was-validated' : ''}`} noValidate onSubmit={onSubmit}>
              <div className="mb-3">
                <label className="form-label" htmlFor="lEmail">
                  Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="lEmail"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
                <div className="invalid-feedback">Enter a valid email address.</div>
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="lPass">
                  Password
                </label>
                <div className="pass-wrap">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-control"
                    id="lPass"
                    placeholder="Your password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="pass-toggle js-pass-toggle"
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPass((v) => !v)}
                  >
                    <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
                <div className="invalid-feedback">Enter your password.</div>
              </div>

              <div className="auth-row">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="lRemember"
                    checked={form.remember_me}
                    onChange={(e) => setForm({ ...form, remember_me: e.target.checked })}
                  />
                  <label className="form-check-label" htmlFor="lRemember">
                    Keep me logged in
                  </label>
                </div>
                <Link to="/forgot-password" className="link-accent">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" className="btn btn-accent w-100" disabled={busy}>
                {busy ? 'Signing in…' : 'Log in'}
              </button>

              {(features.google_status || features.facebook_status) && (
                <>
                  <div className="auth-divider">
                    <span>or continue with</span>
                  </div>
                  <div className="social-auth">
                    {features.google_status && (
                      <button type="button" className="btn btn-social">
                        <i className="bi bi-google"></i> Google
                      </button>
                    )}
                    {features.facebook_status && (
                      <button type="button" className="btn btn-social">
                        <i className="bi bi-facebook"></i> Facebook
                      </button>
                    )}
                  </div>
                </>
              )}

              <p className="auth-legal">
                By logging in you agree to our <Link to="/terms">Terms</Link> and{' '}
                <Link to="/privacy">Privacy Policy</Link>.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
