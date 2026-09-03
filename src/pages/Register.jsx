import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useBusiness } from '../context/BusinessContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { parseApiError } from '../api/errors.js';

export default function Register() {
  const { register } = useAuth();
  const { features } = useBusiness();
  const toast = useToast();
  const navigate = useNavigate();
  const [validated, setValidated] = useState(false);
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '', password: '', password_confirmation: '',
  });
  const passRef = useRef(null);
  const pass2Ref = useRef(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const pass = passRef.current;
    const pass2 = pass2Ref.current;
    if (pass && pass2) {
      pass2.setCustomValidity(pass.value === pass2.value ? '' : 'no-match');
    }
    if (!e.currentTarget.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    setValidated(true);
    setBusy(true);
    try {
      await register(form);
      navigate('/user/dashboard', { replace: true });
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
            <h2>Join AppTheta Ecom</h2>
            <p>One account for orders, returns, wishlists and member pricing.</p>
            <ul className="auth-perks">
              <li>
                <i className="bi bi-check2"></i> 10% off your first order
              </li>
              <li>
                <i className="bi bi-check2"></i> Saved addresses at checkout
              </li>
              <li>
                <i className="bi bi-check2"></i> Order tracking in one place
              </li>
            </ul>
          </div>

          <div className="auth-form">
            <h1 className="auth-title">Create account</h1>
            <p className="auth-sub">
              Already registered? <Link to="/login">Log in</Link>
            </p>

            <form className={`needs-validation${validated ? ' was-validated' : ''}`} noValidate onSubmit={onSubmit}>
              <div className="row g-3">
                <div className="col-sm-6">
                  <label className="form-label" htmlFor="rFirst">
                    First name
                  </label>
                  <input type="text" className="form-control" id="rFirst" placeholder="First name" value={form.first_name} onChange={set('first_name')} required />
                  <div className="invalid-feedback">Enter your first name.</div>
                </div>
                <div className="col-sm-6">
                  <label className="form-label" htmlFor="rLast">
                    Last name
                  </label>
                  <input type="text" className="form-control" id="rLast" placeholder="Last name" value={form.last_name} onChange={set('last_name')} required />
                  <div className="invalid-feedback">Enter your last name.</div>
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="rEmail">
                    Email
                  </label>
                  <input type="email" className="form-control" id="rEmail" placeholder="you@example.com" value={form.email} onChange={set('email')} />
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="rPhone">
                    Phone
                  </label>
                  <input type="tel" className="form-control" id="rPhone" placeholder="+880 1XXX XXXXXX" value={form.phone} onChange={set('phone')} required />
                  <div className="invalid-feedback">Enter your phone number.</div>
                </div>
                <div className="col-sm-6">
                  <label className="form-label" htmlFor="rPass">
                    Password
                  </label>
                  <div className="pass-wrap">
                    <input
                      ref={passRef}
                      type={showPass1 ? 'text' : 'password'}
                      className="form-control"
                      id="rPass"
                      placeholder="At least 4 characters"
                      minLength={4}
                      value={form.password}
                      onChange={set('password')}
                      required
                    />
                    <button
                      type="button"
                      className="pass-toggle js-pass-toggle"
                      aria-label={showPass1 ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPass1((v) => !v)}
                    >
                      <i className={`bi ${showPass1 ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                  <div className="invalid-feedback">Use at least 4 characters.</div>
                </div>
                <div className="col-sm-6">
                  <label className="form-label" htmlFor="rPass2">
                    Confirm password
                  </label>
                  <div className="pass-wrap">
                    <input
                      ref={pass2Ref}
                      type={showPass2 ? 'text' : 'password'}
                      className="form-control"
                      id="rPass2"
                      placeholder="Repeat password"
                      value={form.password_confirmation}
                      onChange={set('password_confirmation')}
                      required
                    />
                    <button
                      type="button"
                      className="pass-toggle js-pass-toggle"
                      aria-label={showPass2 ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPass2((v) => !v)}
                    >
                      <i className={`bi ${showPass2 ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                  <div className="invalid-feedback">Repeat the same password.</div>
                </div>
                <div className="col-12">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="rTerms" required />
                    <label className="form-check-label" htmlFor="rTerms">
                      I agree to the <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.
                    </label>
                    <div className="invalid-feedback">Accept the terms to continue.</div>
                  </div>
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-accent w-100" disabled={busy}>
                    {busy ? 'Creating account…' : 'Create account'}
                  </button>
                </div>
              </div>

              {(features.google_status || features.facebook_status) && (
                <>
                  <div className="auth-divider">
                    <span>or sign up with</span>
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
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
