import { useEffect, useRef, useState } from 'react';
import { checkout as checkoutApi } from '../../api/endpoints.js';
import { parseApiError } from '../../api/errors.js';

export default function OtpModal({ open, phone, onClose, onVerified }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const modalRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (!modalRef.current || !window.bootstrap) return;
    instanceRef.current = window.bootstrap.Modal.getOrCreateInstance(modalRef.current);
    const el = modalRef.current;
    const onHidden = () => onClose();
    el.addEventListener('hidden.bs.modal', onHidden);
    return () => el.removeEventListener('hidden.bs.modal', onHidden);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!instanceRef.current) return;
    if (open) instanceRef.current.show();
    else instanceRef.current.hide();
  }, [open]);

  const verify = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await checkoutApi.verifyOtp({ phone, otp_code: code });
      instanceRef.current?.hide();
      onVerified();
    } catch (err) {
      setError(parseApiError(err).message);
    } finally { setBusy(false); }
  };

  const resend = async () => {
    setError('');
    try { await checkoutApi.sendOtp(phone); } catch (err) { setError(parseApiError(err).message); }
  };

  return (
    <div className="modal fade" tabIndex="-1" ref={modalRef} aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Verify your phone</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <p>We sent a verification code to {phone}. Enter it below to confirm your order.</p>
            <form onSubmit={verify}>
              <input
                type="text"
                className="form-control text-center mb-2"
                inputMode="numeric"
                maxLength={6}
                placeholder="••••••"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                autoFocus
                style={{ letterSpacing: '0.5em', fontSize: '1.4rem' }}
              />
              {error && <p className="text-danger small">{error}</p>}
              <button type="submit" className="btn btn-accent w-100" disabled={busy || code.length < 4}>
                {busy ? 'Verifying…' : 'Verify & Place Order'}
              </button>
            </form>
            <button type="button" className="btn btn-link w-100 mt-2" onClick={resend}>
              Resend code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
