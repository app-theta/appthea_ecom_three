import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { checkout as checkoutApi } from '../api/endpoints.js';
import { parseApiError } from '../api/errors.js';
import { useBusiness } from '../context/BusinessContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { money } from '../utils/format.js';
import { num } from '../utils/product.js';

/**
 * Landed on directly by the browser after an online payment gateway
 * (SSLCommerz/Bkash/Nagad/AamarPay) redirects back - see
 * `redirectToFrontendAfterPayment()` in app/Helpers/helpers.php, which sends
 * the browser to `{business.frontend_url}/order/{success|cancel}?order=...`.
 * This is a fresh top-level navigation (not a client-side route change), so
 * unlike /order-complete (used only for the instant Cash On Delivery flow)
 * there is no React Router `location.state` to read - the real order has to
 * be fetched from the API using the `order` (unique_code) query param.
 */
export default function OrderPaymentResult() {
  const { status } = useParams();
  const [params, setParams] = useSearchParams();
  const orderCode = params.get('order');
  // Captured once on mount - the URL's `message` param is stripped right
  // after (see below) so the address bar stays a clean `?order=...`.
  const [message] = useState(() => params.get('message'));
  const { currencySymbol } = useBusiness();
  const { items, clearCart } = useCart();
  const toast = useToast();
  const isSuccess = status === 'success';

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(isSuccess && Boolean(orderCode));
  const [error, setError] = useState('');

  const copyOrderNumber = async (value) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success('Order number copied');
    } catch {
      toast.error('Could not copy - please copy it manually');
    }
  };

  /* Drop the noisy `message` query param from the visible URL. */
  useEffect(() => {
    if (params.get('message')) setParams(orderCode ? { order: orderCode } : {}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* A gateway return means the order went through - the local cart is stale. */
  useEffect(() => {
    if (isSuccess && items.length) clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  useEffect(() => {
    if (!isSuccess || !orderCode) return;
    let cancelled = false;
    checkoutApi.trackOrder(orderCode)
      .then((data) => { if (!cancelled) setOrder(data?.order || null); })
      .catch((err) => { if (!cancelled) setError(parseApiError(err, 'Could not load your order.').message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, orderCode]);

  return (
    <>
      <div className="checkout-steps">
        <div className="container">
          <ol className="steps">
            <li className="is-done">
              <span className="step-num"><i className="bi bi-check-lg"></i></span> Cart
            </li>
            <li className="is-done">
              <span className="step-num"><i className="bi bi-check-lg"></i></span> Checkout
            </li>
            <li className="is-active">
              <span className="step-num">3</span> {isSuccess ? 'Order Complete' : 'Payment'}
            </li>
          </ol>
        </div>
      </div>

      <section className="section order-complete-section">
        <div className="container">
          {!isSuccess ? (
            <div className="order-complete-head">
              <span className="order-complete-icon is-cancel"><i className="bi bi-x-lg"></i></span>
              <h1 className="order-complete-title">Payment was not completed</h1>
              <p className="order-complete-sub">{message || 'Your payment could not be completed. Please try again.'}</p>
              <div className="oc-actions" style={{ maxWidth: 360, margin: '0 auto' }}>
                <Link to="/checkout" className="btn btn-accent w-100">Try Again</Link>
                <Link to="/shop" className="btn btn-outline-dark w-100">Continue Shopping</Link>
              </div>
            </div>
          ) : loading ? (
            <p className="text-center py-5 mb-0">Loading your order…</p>
          ) : error || !order ? (
            <div className="order-complete-head">
              <span className="order-complete-icon is-cancel"><i className="bi bi-exclamation-lg"></i></span>
              <h1 className="order-complete-title">Payment received</h1>
              <p className="order-complete-sub">
                {error || 'Your payment was successful, but we could not load the order details here.'}
              </p>
              <div className="oc-actions" style={{ maxWidth: 360, margin: '0 auto' }}>
                {orderCode && (
                  <Link to={`/track-order?order=${encodeURIComponent(orderCode)}`} className="btn btn-accent w-100">
                    <i className="bi bi-truck"></i> Track Your Order
                  </Link>
                )}
                <Link to="/shop" className="btn btn-outline-dark w-100">Continue Shopping</Link>
              </div>
            </div>
          ) : (
            <>
              <div className="order-complete-head">
                <span className="order-complete-icon"><i className="bi bi-check-lg"></i></span>
                <h1 className="order-complete-title">Thank you! Your order is confirmed.</h1>
                <p className="order-complete-sub">{message || "We've received your order and payment."}</p>
              </div>

              <div className="row g-4 order-complete-meta">
                <div className="col-6 col-md-4">
                  <button
                    type="button"
                    className="oc-meta-card oc-meta-card-btn"
                    onClick={() => copyOrderNumber(order.invoice_no || order.unique_code)}
                    title="Click to copy"
                  >
                    <span className="oc-meta-label">Order Number</span>
                    <strong>{order.invoice_no || order.unique_code}</strong>
                  </button>
                </div>
                <div className="col-6 col-md-4">
                  <div className="oc-meta-card">
                    <span className="oc-meta-label">Order Date</span>
                    <strong>{order.date}</strong>
                  </div>
                </div>
                <div className="col-6 col-md-4">
                  <div className="oc-meta-card">
                    <span className="oc-meta-label">Payment Method</span>
                    <strong>{order.payment_type || '—'}</strong>
                  </div>
                </div>
              </div>

              <div className="row g-5 align-items-start">
                <div className="col-lg-7">
                  <div className="panel">
                    <h5 className="checkout-panel-title">
                      <i className="bi bi-bag-check"></i> Order Items
                    </h5>
                    <ul className="checkout-mini-cart oc-item-list">
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
                    <div className="order-summary-row">
                      <span>Subtotal</span>
                      <strong>{money(num(order.sub_total), currencySymbol)}</strong>
                    </div>
                    <div className="order-summary-row">
                      <span>Shipping</span>
                      <strong>{money(num(order.shipping_charge), currencySymbol)}</strong>
                    </div>
                    {num(order.discount_amount) > 0 && (
                      <div className="order-summary-row">
                        <span>Discount</span>
                        <strong className="text-accent">&minus; {money(num(order.discount_amount), currencySymbol)}</strong>
                      </div>
                    )}
                    <div className="order-summary-total">
                      <span>Total</span>
                      <strong>{money(num(order.total_amount), currencySymbol)}</strong>
                    </div>
                  </div>
                </div>

                <div className="col-lg-5">
                  <div className="panel mb-4">
                    <h5 className="checkout-panel-title">
                      <i className="bi bi-geo-alt"></i> Shipping Address
                    </h5>
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

                  <div className="oc-actions">
                    <Link to={`/track-order?order=${encodeURIComponent(orderCode)}`} className="btn btn-accent w-100">
                      <i className="bi bi-truck"></i> Track Your Order
                    </Link>
                    <Link to="/shop" className="btn btn-outline-dark w-100">Continue Shopping</Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
