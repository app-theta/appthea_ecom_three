import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashLayout from '../../components/user/DashLayout.jsx';

export default function DeleteAccount() {
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();

  const onSubmit = (e) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    navigate('/');
  };

  return (
    <DashLayout title="Delete My Account">
      <div className="panel dash-danger-panel">
        <span className="dash-danger-icon">
          <i className="bi bi-exclamation-triangle"></i>
        </span>
        <h5>This action is permanent</h5>
        <p>
          Deleting your account will permanently remove your order history, wishlist, saved addresses, wallet
          balance and club points. This cannot be undone. If you just want a break, you can{' '}
          <Link to="/user/dashboard" className="link-accent">
            go back to your dashboard
          </Link>{' '}
          instead.
        </p>

        <form className={`dash-danger-form needs-validation js-delete-account-form${validated ? ' was-validated' : ''}`} noValidate onSubmit={onSubmit}>
          <label className="form-label" htmlFor="delPassword">
            Confirm your password
          </label>
          <input type="password" className="form-control" id="delPassword" placeholder="••••••••" required />
          <div className="invalid-feedback">Enter your password to confirm.</div>

          <div className="form-check my-3">
            <input className="form-check-input" type="checkbox" id="delConfirm" required />
            <label className="form-check-label" htmlFor="delConfirm">
              I understand this action is permanent and cannot be undone.
            </label>
            <div className="invalid-feedback">You must confirm before deleting your account.</div>
          </div>

          <div className="dash-danger-actions">
            <Link to="/user/dashboard" className="btn btn-outline-dark">
              Cancel
            </Link>
            <button type="submit" className="btn btn-danger">
              <i className="bi bi-trash3"></i> Delete My Account
            </button>
          </div>
        </form>
      </div>
    </DashLayout>
  );
}
