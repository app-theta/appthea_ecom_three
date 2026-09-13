import { useEffect, useRef, useState } from 'react';
import { useBusiness } from '../../context/BusinessContext.jsx';

const SEEN_KEY = 'apptheta_newsletter_seen';

/** Shows a one-time "join our newsletter" modal a few seconds after load,
    gated by the `newsletter_popup` business feature flag. Any dismissal
    (close button, backdrop click, Esc) marks it seen so it never shows
    again on this device. */
export default function NewsletterPopup() {
  const { features, info } = useBusiness();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const modalRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (!modalRef.current || !window.bootstrap) return;
    instanceRef.current = window.bootstrap.Modal.getOrCreateInstance(modalRef.current);
    const el = modalRef.current;
    const onHidden = () => {
      setOpen(false);
      try { localStorage.setItem(SEEN_KEY, '1'); } catch { /* ignore */ }
    };
    el.addEventListener('hidden.bs.modal', onHidden);
    return () => el.removeEventListener('hidden.bs.modal', onHidden);
  }, []);

  useEffect(() => {
    if (!instanceRef.current) return;
    if (open) instanceRef.current.show();
    else instanceRef.current.hide();
  }, [open]);

  useEffect(() => {
    if (!features.newsletter_popup) return;
    let seen = false;
    try { seen = localStorage.getItem(SEEN_KEY) === '1'; } catch { /* ignore */ }
    if (seen) return;
    const id = window.setTimeout(() => setOpen(true), 6000);
    return () => window.clearTimeout(id);
  }, [features.newsletter_popup]);

  const subscribe = (e) => {
    e.preventDefault();
    setDone(true);
  };

  return (
    <div className="modal fade" tabIndex="-1" ref={modalRef} aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Join our newsletter</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            {done ? (
              <p className="text-accent mb-0">Thanks for subscribing!</p>
            ) : (
              <>
                <p>Get updates on new arrivals, sales and more from {info?.name || 'us'}.</p>
                <form onSubmit={subscribe}>
                  <input
                    type="email"
                    className="form-control mb-2"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    aria-label="Email address"
                  />
                  <button type="submit" className="btn btn-accent w-100">Subscribe</button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
