import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { checkout as checkoutApi, account } from '../api/endpoints.js';
import { parseApiError } from '../api/errors.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useBusiness } from '../context/BusinessContext.jsx';
import { money } from '../utils/format.js';
import { num } from '../utils/product.js';

const STEP_ICON = { Pending: 'bi-hourglass-split', Processing: 'bi-gear', Confirmed: 'bi-check-lg', Delivery: 'bi-truck', Cancelled: 'bi-x-lg' };

export default function TrackOrder() {
  const [params] = useSearchParams();
  const { isAuthed } = useAuth();
  const { currencySymbol } = useBusiness();
  const [orderId, setOrderId] = useState(params.get('order') || '');
  const [contact, setContact] = useState('');
  const [validated, setValidated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);

  const runTrack = async (code) => {
    setBusy(true);
    setError('');
    try {
      const data = await checkoutApi.trackOrder(code);
      setResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
    } catch (err) {
      setResult(null);
      setError(parseApiError(err, 'Order not found. Please check your order number.').message);
    } finally { setBusy(false); }
  };

  useEffect(() => {
    if (params.get('order')) runTrack(params.get('order'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    setValidated(true);
    runTrack(orderId.trim());
  };

  const order = result?.order;
  const statusArray = result?.order_status_array || [];
  const keyIndex = result?.key_index ?? -1;

  const downloadInvoice = async () => {
    if (!isAuthed || !order?.id) return;
    try {
      const data = await account.orderDownload(order.id);
      if (data?.download_url) window.open(data.download_url, '_blank');
    } catch { /* no-op */ }
  };

  return (
    <>
      <div className="page-title-bar">
        <div className="container">
          <h1>Track Your Order</h1>
        </div>
      </div>

      <section className="section track-section">
        <div className="container">
          <div className="panel track-form-panel">
            <h5 className="checkout-panel-title">
              <i className="bi bi-search"></i> Enter Your Order Details
            </h5>
            <form
              className={`track-form js-track-form needs-validation${validated ? ' was-validated' : ''}`}
              noValidate
              onSubmit={onSubmit}
            >
              <div className="track-form-field">
                <label className="form-label" htmlFor="trkOrderId">
                  Order number
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="trkOrderId"
                  placeholder="e.g. AP-260902-0001"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  required
                />
                <div className="invalid-feedback">Enter your order number.</div>
              </div>
              <div className="track-form-field">
                <label className="form-label" htmlFor="trkEmail">
                  Email or phone
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="trkEmail"
                  placeholder="you@example.com"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  required
                />
                <div className="invalid-feedback">Enter the email or phone used at checkout.</div>
              </div>
              <div className="track-form-submit">
                <button type="submit" className="btn btn-accent w-100" disabled={busy}>
                  {busy ? 'Searching…' : 'Track'}
                </button>
              </div>
            </form>
            {error && <p className="text-danger mt-3 mb-0">{error}</p>}
          </div>

          {order && (
            <div className="track-result js-track-result" ref={resultRef}>
              <div className="track-result-head">
                <div>
                  <h5 className="mb-1">
                    Order <span className="text-accent">#{order.invoice_no || order.unique_code}</span>
                  </h5>
                  <p className="text-muted mb-0">
                    Placed on {order.date} &middot; {order.products?.length || 0} items &middot; {money(num(order.total_amount), currencySymbol)}
                  </p>
                </div>
                <span className="track-status-badge">{order.sale_status}</span>
              </div>

              {statusArray.length > 0 && (
                <ol className="track-timeline">
                  {statusArray.map((status, i) => (
                    <li className={i < keyIndex ? 'is-done' : i === keyIndex ? 'is-active' : ''} key={status}>
                      <span className="track-icon">
                        <i className={`bi ${STEP_ICON[status] || 'bi-circle'}`}></i>
                      </span>
                      <div className="track-info">
                        <strong>{status}</strong>
                      </div>
                    </li>
                  ))}
                </ol>
              )}

              <div className="row g-4 mt-2">
                <div className="col-lg-7">
                  <div className="panel">
                    <h6 className="footer-title mb-3">Order Items</h6>
                    <ul className="checkout-mini-cart mb-0">
                      {(order.products || []).map((item) => (
                        <li key={item.id}>
                          <div className="cart-thumb cart-thumb-sm">
                            <img src={item.product?.thumbnail} alt="" loading="lazy" />
                            <span className="mini-cart-qty">{item.quantity}</span>
                          </div>
                          <span className="mini-cart-name">{item.product?.name}</span>
                          <span className="mini-cart-price">{money(num(item.subtotal_price), currencySymbol)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="col-lg-5">
                  <div className="panel">
                    <h6 className="footer-title mb-3">Delivery Address</h6>
                    <p className="oc-address mb-0">
                      {order.shipping_address?.name}
                      <br />
                      {order.shipping_address?.address}
                      <br />
                      {order.shipping_address?.city}
                      <br />
                      {order.shipping_address?.phone}
                    </p>
                  </div>
                </div>
              </div>

              <div className="track-invoice-actions">
                {isAuthed && (
                  <button type="button" className="btn btn-outline-dark js-download-invoice" onClick={downloadInvoice}>
                    <i className="bi bi-download"></i> Download Invoice
                  </button>
                )}
                <button type="button" className="btn btn-outline-dark js-print-invoice" onClick={() => window.print()}>
                  <i className="bi bi-printer"></i> Print Invoice
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
