import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { auth as authApi } from '../api/endpoints.js';
import { parseApiError } from '../api/errors.js';
import { useBusiness } from '../context/BusinessContext.jsx';

/** Forgot password, and - when the mailed link brings a `token` (plus `email`) - the new-password form. */
export default function ForgotPassword() {
  const { info } = useBusiness();
  const [params] = useSearchParams();
  const token = params.get('token');
  const [email, setEmail] = useState(params.get('email') || '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState({});
  const [sent, setSent] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(''); setFields({});
    try {
      if (token) {
        await authApi.resetPassword({ token, email, password, password_confirmation: confirm });
      } else {
        await authApi.forgotPassword({ email });
      }
      setSent(true);
    } catch (err) {
      const parsed = parseApiError(err);
      setError(parsed.message);
      setFields(parsed.fields);
    } finally { setBusy(false); }
  };

  return (
    <section className="auth">
      <div className="container">
        <div className="auth-card">
          <div className="auth-visual">
            <span className="brand brand-auth">
              {info?.name || 'AppTheta Ecom'}<span>.</span>
            </span>
            <h2>{token ? 'Almost there' : 'Forgot your password?'}</h2>
            <p>{token ? 'Pick a new password and you are back in.' : 'No worries - we’ll send you a reset link.'}</p>
          </div>

          <div className="auth-form">
            <h1 className="auth-title">{token ? 'Set a new password' : 'Reset password'}</h1>
            <p className="auth-sub">
              {token
                ? 'Choose a new password for your account. The link works once, for one hour.'
                : 'Enter your account email and we’ll send a reset link.'}
            </p>

            {sent ? (
              <div className="alert alert-success" role="alert">
                {token
                  ? <>Your password has been changed. <Link to="/login">Log in</Link> with the new one.</>
                  : <>If an account exists for {email}, a reset link is on its way.</>}
              </div>
            ) : (
              <form onSubmit={onSubmit}>
                {token ? (
                  <>
                    <div className="mb-3">
                      <label className="form-label" htmlFor="fpPassword">New password</label>
                      <input type="password" className={`form-control${fields.password ? ' is-invalid' : ''}`} id="fpPassword" required minLength={4} maxLength={25}
                        autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
                      {fields.password && <div className="invalid-feedback">{fields.password}</div>}
                    </div>
                    <div className="mb-3">
                      <label className="form-label" htmlFor="fpConfirm">Confirm new password</label>
                      <input type="password" className="form-control" id="fpConfirm" required autoComplete="new-password"
                        value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                    </div>
                  </>
                ) : (
                  <div className="mb-3">
                    <label className="form-label" htmlFor="fpEmail">Email</label>
                    <input type="email" className="form-control" id="fpEmail" placeholder="you@example.com"
                      value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                )}
                {error && <p className="text-danger small">{error}</p>}
                <button type="submit" className="btn btn-accent w-100" disabled={busy}>
                  {busy ? 'Please wait…' : token ? 'Save new password' : 'Send reset link'}
                </button>
                {token && error && (
                  <p className="auth-sub mt-3 mb-0"><Link to="/forgot-password">Ask for a new link</Link></p>
                )}
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
