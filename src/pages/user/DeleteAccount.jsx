import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashLayout from '../../components/user/DashLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { account } from '../../api/endpoints.js';
import { parseApiError } from '../../api/errors.js';

/** Closes the customer's account for good - the password and an "I understand" tick are both required. */
export default function DeleteAccount() {
  const { logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [validated, setValidated] = useState(false);
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    setBusy(true);
    setErrors({});
    try {
      await account.deleteAccount({ password, agree });
      toast.success('Your account was deleted.');
      // leave the account pages first, then drop the (already revoked) session
      navigate('/', { replace: true });
      logout();
    } catch (err) {
      const parsed = parseApiError(err);
      setErrors(parsed.fields);
      if (!Object.keys(parsed.fields).length) toast.error(parsed.message);
      setBusy(false);
    }
  };

  return (
    <DashLayout title="Delete My Account">
      <div className="panel dash-danger-panel">
        <span className="dash-danger-icon">
          <i className="bi bi-exclamation-triangle"></i>
        </span>
        <h5>This action is permanent</h5>
        <p>
          Deleting your account signs you out on every device, and your orders, wishlist, reviews and chat will no
          longer show here. Orders you placed stay with the shop for its records, and you can sign up again later with
          the same email or phone. If you just want a break, you can{' '}
          <Link to="/user/dashboard" className="link-accent">
            go back to your dashboard
          </Link>{' '}
          instead.
        </p>

        <form className={`dash-danger-form needs-validation js-delete-account-form${validated ? ' was-validated' : ''}`} noValidate onSubmit={onSubmit}>
          <label className="form-label" htmlFor="delPassword">
            Confirm your password
          </label>
          <input
            type="password"
            className={`form-control${errors.password ? ' is-invalid' : ''}`}
            id="delPassword"
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="invalid-feedback">{errors.password || 'Enter your password to confirm.'}</div>
          <small className="text-muted d-block mt-2">
            Signed in with Google or Facebook? Set a password first with{' '}
            <Link to="/forgot-password" className="link-accent">Forgot password</Link>.
          </small>

          <div className="form-check my-3">
            <input className={`form-check-input${errors.agree ? ' is-invalid' : ''}`} type="checkbox" id="delConfirm"
                   checked={agree} onChange={(e) => setAgree(e.target.checked)} required />
            <label className="form-check-label" htmlFor="delConfirm">
              I understand this action is permanent and cannot be undone.
            </label>
            <div className="invalid-feedback">{errors.agree || 'You must confirm before deleting your account.'}</div>
          </div>

          <div className="dash-danger-actions">
            <Link to="/user/dashboard" className="btn btn-outline-dark">
              Cancel
            </Link>
            <button type="submit" className="btn btn-danger" disabled={busy}>
              <i className="bi bi-trash3"></i> {busy ? 'Deleting…' : 'Delete My Account'}
            </button>
          </div>
        </form>
      </div>
    </DashLayout>
  );
}
