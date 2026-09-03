import { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth as authApi } from '../api/endpoints.js';
import { parseApiError } from '../api/errors.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await authApi.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(parseApiError(err).message);
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
            <h2>Forgot your password?</h2>
            <p>No worries - we&rsquo;ll send you a reset link.</p>
          </div>

          <div className="auth-form">
            <h1 className="auth-title">Reset password</h1>
            <p className="auth-sub">
              Enter your account email and we&rsquo;ll send a reset link.
            </p>

            {sent ? (
              <div className="alert alert-success" role="alert">
                If an account exists for {email}, a reset link is on its way.
              </div>
            ) : (
              <form onSubmit={onSubmit}>
                <div className="mb-3">
                  <label className="form-label" htmlFor="fpEmail">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="fpEmail"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  {error && <p className="text-danger small mt-2">{error}</p>}
                </div>
                <button type="submit" className="btn btn-accent w-100" disabled={busy}>
                  {busy ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
            )}

            <p className="auth-sub mt-4">
              <Link to="/login">Back to login</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
