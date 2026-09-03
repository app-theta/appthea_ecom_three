import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useBusiness } from '../context/BusinessContext.jsx';
import { money } from '../utils/format.js';

export default function OrderComplete() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthed } = useAuth();
  const { currencySymbol } = useBusiness();
  const order = location.state;

  /* Landing here without a real order (e.g. a direct link) has nothing to show. */
  useEffect(() => {
    if (!order) navigate('/shop', { replace: true });
  }, [order, navigate]);

  if (!order) return null;

  return (
    <>
      <div className="checkout-steps">
        <div className="container">
          <ol className="steps">
            <li className="is-done">
              <span className="step-num">
                <i className="bi bi-check-lg"></i>
              </span>{' '}
              Cart
            </li>
            <li className="is-done">
              <span className="step-num">
                <i className="bi bi-check-lg"></i>
              </span>{' '}
              Checkout
            </li>
            <li className="is-active">
              <span className="step-num">3</span> Order Complete
            </li>
          </ol>
        </div>
      </div>

      <section className="section order-complete-section">
      <div className="container">
        <div className="order-complete-head">
          <span className="order-complete-icon">
            <i className="bi bi-check-lg"></i>
          </span>
          <h1 className="order-complete-title">Thank you! Your order is confirmed.</h1>
          <p className="order-complete-sub">
            {order.message || "We've received your order and will contact you shortly."}
          </p>
        </div>

        <div className="row g-4 order-complete-meta">
          <div className="col-6 col-md-4">
            <div className="oc-meta-card">
              <span className="oc-meta-label">Order Number</span>
              <strong>{order.invoiceNo || (order.orderCode ? `#${order.orderCode.slice(0, 8).toUpperCase()}` : '—')}</strong>
            </div>
          </div>
          <div className="col-6 col-md-4">
            <div className="oc-meta-card">
              <span className="oc-meta-label">Order Date</span>
              <strong>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
            </div>
          </div>
          <div className="col-6 col-md-4">
            <div className="oc-meta-card">
              <span className="oc-meta-label">Payment Method</span>
              <strong>{order.paymentLabel || 'Cash On Delivery'}</strong>
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
                {order.items.map((item) => (
                  <li key={item.id}>
                    <div className="cart-thumb cart-thumb-sm">
                      <img src={item.image} alt="" loading="lazy" />
                      <span className="mini-cart-qty">{item.qty}</span>
                    </div>
                    <span className="mini-cart-name">{item.name}</span>
                    <span className="mini-cart-price">{money(item.total_price, currencySymbol)}</span>
                  </li>
                ))}
              </ul>
              <div className="order-summary-row">
                <span>Subtotal</span>
                <strong>{money(order.subtotal, currencySymbol)}</strong>
              </div>
              <div className="order-summary-row">
                <span>Shipping</span>
                <strong className={order.shipping === 0 ? 'text-accent' : ''}>
                  {order.shipping === 0 ? 'Free' : money(order.shipping, currencySymbol)}
                </strong>
              </div>
              {order.discount > 0 && (
                <div className="order-summary-row">
                  <span>Discount</span>
                  <strong className="text-accent">&minus; {money(order.discount, currencySymbol)}</strong>
                </div>
              )}
              <div className="order-summary-total">
                <span>Total</span>
                <strong>{money(order.total, currencySymbol)}</strong>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="panel mb-4">
              <h5 className="checkout-panel-title">
                <i className="bi bi-geo-alt"></i> Shipping Address
              </h5>
              <p className="oc-address">
                {order.fullName}
                <br />
                {order.address}
                <br />
                {order.city}
                <br />
                {order.phone}
              </p>
            </div>

            <div className="oc-actions">
              <Link to={`/track-order${order.orderCode ? `?order=${encodeURIComponent(order.orderCode)}` : ''}`} className="btn btn-accent w-100">
                <i className="bi bi-truck"></i> Track Your Order
              </Link>
              {isAuthed && (
                <Link to="/user/purchase-history" className="btn btn-outline-dark w-100">
                  View My Orders
                </Link>
              )}
              <Link to="/shop" className="btn btn-outline-dark w-100">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
      </section>
    </>
  );
}
