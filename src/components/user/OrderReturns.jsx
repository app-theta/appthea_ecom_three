import { useEffect, useState } from 'react';
import { returns as returnsApi } from '../../api/endpoints.js';
import { parseApiError } from '../../api/errors.js';
import { useAsync } from '../../hooks/useAsync.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useBusiness } from '../../context/BusinessContext.jsx';
import { money, dateShort, returnTone } from '../../utils/format.js';

/**
 * Returns for one delivered order: what can still be sent back (and until when), the request
 * form, and the requests so far. The shop approves and refunds from its admin panel.
 */
export default function OrderReturns({ orderId, onChanged }) {
  const { currencySymbol } = useBusiness();
  const toast = useToast();
  const state = useAsync((signal) => returnsApi.forOrder(orderId, { signal }), [orderId]);
  const [open, setOpen] = useState(false);
  const [reasons, setReasons] = useState([]);
  const [qty, setQty] = useState({});
  const [reasonId, setReasonId] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // arriving from the refund-requests page (…/purchase-history/5#returns): bring the section into view
  useEffect(() => {
    if (state.data && window.location.hash === '#returns') document.getElementById('returns')?.scrollIntoView({ behavior: 'smooth' });
  }, [state.data]);

  if (state.loading && !state.data) return <div className="panel mt-4"><p className="mb-0">Loading returns…</p></div>;
  if (state.error) return null;

  const info = state.data || {};
  const items = (info.returnable_items || []).filter((line) => line.returnable_quantity > 0);
  const history = info.returns || [];
  const value = items.reduce((sum, line) => sum + (qty[line.sale_product_id] || 0) * line.unit_price, 0);

  const start = async () => {
    setOpen(true);
    if (!reasons.length) {
      try { setReasons(await returnsApi.reasons()); } catch (e) { setError(parseApiError(e).message); }
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const chosen = items
      .filter((line) => (qty[line.sale_product_id] || 0) > 0)
      .map((line) => ({ sale_product_id: line.sale_product_id, quantity: qty[line.sale_product_id] }));
    if (!chosen.length) {
      setError('Choose at least one item to return.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const res = await returnsApi.request(orderId, { items: chosen, sale_return_reason_id: Number(reasonId), note });
      toast.success(`Return request ${res?.return_no || ''} sent - the shop will contact you`);
      setOpen(false);
      setQty({});
      setReasonId('');
      setNote('');
      state.reload();
      onChanged?.();
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="panel mt-4" id="returns">
      <div className="dash-block-head">
        <h5>Returns</h5>
        {info.return_deadline && info.can_return && <span className="text-muted">Accepted until {dateShort(info.return_deadline)}</span>}
      </div>

      {info.can_return ? (
        !open && <button type="button" className="btn btn-outline-dark btn-sm" onClick={start}>Request a return</button>
      ) : (
        info.not_returnable_reason && <p className="text-muted mb-0">{info.not_returnable_reason}</p>
      )}

      {open && (
        <form onSubmit={submit}>
          <label className="form-label fw-semibold">Choose what you are sending back</label>
          {items.map((line) => (
            <div key={line.sale_product_id} className="d-flex align-items-center justify-content-between gap-3 py-2 border-bottom">
              <div>
                <div className="fw-semibold">{line.product}</div>
                <small className="text-muted">
                  {line.combination ? `${line.combination} · ` : ''}{money(line.unit_price, currencySymbol)} · up to {line.returnable_quantity} of {line.quantity}
                </small>
              </div>
              <select
                className="form-select form-select-sm return-qty"
                style={{ maxWidth: 90 }}
                aria-label={`Quantity to return of ${line.product}`}
                value={qty[line.sale_product_id] || 0}
                onChange={(e) => setQty({ ...qty, [line.sale_product_id]: Number(e.target.value) })}
              >
                {Array.from({ length: Math.floor(line.returnable_quantity) + 1 }, (_, n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          ))}
          <div className="mt-3">
            <label className="form-label" htmlFor="return-reason">Reason</label>
            <select className="form-select" id="return-reason" required value={reasonId} onChange={(e) => setReasonId(e.target.value)}>
              <option value="">Choose a reason</option>
              {reasons.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div className="mt-3">
            <label className="form-label" htmlFor="return-note">Anything the shop should know? (optional)</label>
            <textarea className="form-control" id="return-note" rows={3} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          {error && <p className="text-danger small mt-2 mb-0">{error}</p>}
          <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap mt-3">
            <span>Return value <strong className="return-value">{money(value, currencySymbol)}</strong></span>
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => setOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-accent btn-sm" disabled={busy}>{busy ? 'Sending…' : 'Send return request'}</button>
            </div>
          </div>
        </form>
      )}

      {history.length > 0 && (
        <div className="mt-4 return-history">
          <h6 className="mb-2">Your return requests</h6>
          {history.map((r) => (
            <div key={r.id} className="border rounded p-3 mb-2">
              <div className="d-flex align-items-center justify-content-between gap-2">
                <strong>{r.return_no}</strong>
                <span className={`dash-badge ${returnTone(r.status)}`}>{r.status}</span>
              </div>
              <small className="text-muted">{dateShort(r.requested_at)}{r.reason ? ` · ${r.reason}` : ''}</small>
              <ul className="list-unstyled small mt-2 mb-2">
                {r.items.map((line) => <li key={line.sale_product_id}>{line.product}{line.combination ? ` (${line.combination})` : ''} × {line.quantity}</li>)}
              </ul>
              <div className="small d-flex gap-4 flex-wrap">
                <span>Return value <strong>{money(r.total_amount, currencySymbol)}</strong></span>
                {r.refunded_amount > 0 && <span>Refunded <strong>{money(r.refunded_amount, currencySymbol)}</strong></span>}
              </div>
              {r.shop_note && <p className="small text-muted mb-0 mt-2">Note from the shop: {r.shop_note}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
