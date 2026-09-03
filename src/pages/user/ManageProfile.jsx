import { useEffect, useState } from 'react';
import DashLayout from '../../components/user/DashLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { auth as authApi } from '../../api/endpoints.js';
import { parseApiError } from '../../api/errors.js';

export default function ManageProfile() {
  const { customer, refresh } = useAuth();
  const toast = useToast();
  const [validated, setValidated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', address: '', city: '', country: 'Bangladesh' });
  const [pw, setPw] = useState({ old_password: '', password: '', password_confirmation: '' });

  useEffect(() => {
    if (!customer) return;
    setForm((f) => ({
      ...f,
      first_name: customer.first_name || '',
      last_name: customer.last_name || '',
      address: customer.address || '',
      city: customer.city || '',
      country: customer.country || 'Bangladesh',
    }));
  }, [customer]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setPwField = (k) => (e) => setPw({ ...pw, [k]: e.target.value });

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
      await authApi.updateProfile(form);
      if (pw.old_password || pw.password) {
        await authApi.changePassword(pw);
        setPw({ old_password: '', password: '', password_confirmation: '' });
      }
      await refresh();
      toast.success('Profile updated');
    } catch (err) {
      toast.error(parseApiError(err).message);
    } finally { setBusy(false); }
  };

  const name = [customer?.first_name, customer?.last_name].filter(Boolean).join(' ') || customer?.username || 'Account';

  return (
    <DashLayout title="Manage Profile">
      <div className="panel">
        <div className="dash-profile-head">
          <span className="dash-avatar dash-avatar-lg">
            {customer?.avatar ? (
              <img src={customer.avatar} alt="" loading="lazy" />
            ) : (
              <span className="dash-avatar-fallback">{name.charAt(0).toUpperCase()}</span>
            )}
          </span>
          <div>
            <p className="text-muted mb-0">{customer?.email || customer?.phone}</p>
          </div>
        </div>

        <hr className="my-4" />

        <form className={`row g-3 needs-validation${validated ? ' was-validated' : ''}`} noValidate onSubmit={onSubmit}>
          <div className="col-md-6">
            <label className="form-label" htmlFor="pfFirst">
              First name
            </label>
            <input type="text" className="form-control" id="pfFirst" value={form.first_name} onChange={set('first_name')} required minLength={2} />
            <div className="invalid-feedback">Enter your first name.</div>
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="pfLast">
              Last name
            </label>
            <input type="text" className="form-control" id="pfLast" value={form.last_name} onChange={set('last_name')} required minLength={2} />
            <div className="invalid-feedback">Enter your last name.</div>
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="pfEmail">
              Email address
            </label>
            <input type="email" className="form-control" id="pfEmail" value={customer?.email || ''} disabled />
            <div className="form-text">Contact our support to change your email.</div>
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="pfPhone">
              Phone number
            </label>
            <input type="tel" className="form-control" id="pfPhone" value={customer?.phone || ''} disabled />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="pfCity">
              City
            </label>
            <input type="text" className="form-control" id="pfCity" value={form.city} onChange={set('city')} required />
            <div className="invalid-feedback">Enter your city.</div>
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="pfCountry">
              Country
            </label>
            <input type="text" className="form-control" id="pfCountry" value={form.country} onChange={set('country')} required />
            <div className="invalid-feedback">Enter your country.</div>
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="pfAddress">
              Address
            </label>
            <input type="text" className="form-control" id="pfAddress" value={form.address} onChange={set('address')} required minLength={3} />
            <div className="invalid-feedback">Enter your address.</div>
          </div>

          <div className="col-12">
            <hr className="my-2" />
          </div>
          <div className="col-12">
            <h6 className="footer-title mb-0">Change Password</h6>
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="pfCurrent">
              Current password
            </label>
            <input type="password" className="form-control" id="pfCurrent" placeholder="••••••••" value={pw.old_password} onChange={setPwField('old_password')} />
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="pfNew">
              New password
            </label>
            <input type="password" className="form-control" id="pfNew" placeholder="••••••••" value={pw.password} onChange={setPwField('password')} />
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="pfConfirm">
              Confirm new password
            </label>
            <input type="password" className="form-control" id="pfConfirm" placeholder="••••••••" value={pw.password_confirmation} onChange={setPwField('password_confirmation')} />
          </div>

          <div className="col-12 mt-2">
            <button type="submit" className="btn btn-accent" disabled={busy}>
              {busy ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </DashLayout>
  );
}
