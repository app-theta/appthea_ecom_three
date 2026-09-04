import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useBusiness } from '../context/BusinessContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import OtpModal from '../components/layout/OtpModal.jsx';
import { LineDetail } from '../components/layout/CartDrawer.jsx';
import { checkout as checkoutApi } from '../api/endpoints.js';
import { parseApiError, isPriceMismatch, needsOtp } from '../api/errors.js';
import { money } from '../utils/format.js';

const PAYMENT_META = {
  'Cash On Delivery': { icon: 'bi-cash-coin', bg: '#e3f5ea', fg: '#1f9254', note: 'Pay when your order arrives' },
  Bkash: { icon: 'bi-phone', bg: '#fde3ee', fg: '#e2136e', note: 'Pay securely with bKash' },
  Nagad: { icon: 'bi-phone', bg: '#ffe9d6', fg: '#e8720c', note: 'Pay securely with Nagad' },
  SSL: { icon: 'bi-shield-lock', bg: '#dff3ef', fg: '#12866f', note: 'Pay securely online' },
  AamarPay: { icon: 'bi-credit-card-2-front', bg: '#e1eefb', fg: '#1a6fd1', note: 'Pay securely online' },
  Stripe: { icon: 'bi-credit-card', bg: '#e4e9fb', fg: '#4a3aed', note: 'Pay by card' },
  Paypal: { icon: 'bi-paypal', bg: '#e1ecfb', fg: '#14337f', note: 'Pay with PayPal' },
};

export default function Checkout() {
  const { items, subtotal, apiCart, syncPrices, clearCart } = useCart();
  const { customer, isAuthed } = useAuth();
  const { shipping, enabledPayments, features, currencySymbol } = useBusiness();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: '', phone: '', firstName: '', lastName: '', address: '', city: '', zip: '', country: 'Bangladesh',
  });
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [coupon, setCoupon] = useState(location.state?.coupon || '');
  const [applied, setApplied] = useState(null);
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [validated, setValidated] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpDone, setOtpDone] = useState(false);
  const renderedAt = useRef(Math.floor(Date.now() / 1000));

  useEffect(() => {
    if (!paymentMethod && enabledPayments.length) setPaymentMethod(enabledPayments[0]);
  }, [enabledPayments, paymentMethod]);

  useEffect(() => {
    if (!isAuthed || !customer) return;
    setForm((f) => ({
      ...f,
      firstName: f.firstName || customer.first_name || '',
      lastName: f.lastName || customer.last_name || '',
      email: f.email || customer.email || '',
      phone: f.phone || customer.phone || '',
      address: f.address || customer.address || '',
      city: f.city || customer.city || '',
    }));
  }, [isAuthed, customer]);

  const applyCoupon = async (code) => {
    const c = (code ?? coupon).trim();
    if (!c) return;
    setCouponBusy(true); setCouponError('');
    try {
      const data = await checkoutApi.applyCoupon({ coupon_code: c, cart: apiCart(), shipping_area: 'inside_city' });
      setApplied(data);
      setCoupon(c);
      toast.success('Coupon applied');
    } catch (e) {
      setApplied(null);
      setCouponError(parseApiError(e).message);
    } finally { setCouponBusy(false); }
  };

  useEffect(() => {
    if (location.state?.coupon) applyCoupon(location.state.coupon);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shippingCharge = useMemo(() => {
    if (shipping.freeAbove > 0 && subtotal >= shipping.freeAbove) return 0;
    return shipping.inside;
  }, [shipping, subtotal]);

  const discount = Number(applied?.discount_amount ?? 0);
  const total = useMemo(() => {
    if (applied?.grand_total != null) return Number(applied.grand_total);
    return Math.max(0, subtotal + shippingCharge - discount);
  }, [applied, subtotal, shippingCharge, discount]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    submitOrder();
  };

  const submitOrder = async () => {
    if (!paymentMethod) { toast.error('Please select a payment method'); return; }

    setPlacing(true);
    try {
      const { changed } = await syncPrices();
      if (changed) {
        toast.info('Prices were updated - please review your order before continuing.');
        setPlacing(false);
        return;
      }

      const payload = {
        cart: apiCart(),
        coupon_code: applied ? coupon : '',
        coupon_discount_amount: discount,
        full_name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        zip_code: form.zip,
        country: form.country,
        shipping_area: 'inside_city',
        payment_type: paymentMethod,
        grand_total: total,
        form_rendered_at: renderedAt.current,
      };

      const res = await checkoutApi.place(payload);
      if (res?.status === false) throw { response: { data: res, status: res.code } };

      const data = res?.data || {};
      const code = data.order?.unique_code || data.order?.order_code || '';
      const invoiceNo = data.order?.invoice_no || '';

      if (data.payment_required && data.payment_url) {
        toast.info('Redirecting to payment…');
        window.location.href = data.payment_url;
        return;
      }

      const orderSnapshot = {
        items, subtotal, shipping: shippingCharge, discount, total,
        paymentLabel: paymentMethod, orderCode: code, invoiceNo, message: res?.message,
        fullName: payload.full_name, phone: form.phone, address: form.address, city: form.city,
      };
      clearCart();
      navigate('/order-complete', { state: orderSnapshot });
    } catch (err) {
      const parsed = parseApiError(err);
      if (needsOtp(parsed) && paymentMethod === 'Cash On Delivery' && !otpDone) {
        try { await checkoutApi.sendOtp(form.phone); } catch { /* modal has its own resend */ }
        setOtpOpen(true);
      } else if (isPriceMismatch(parsed)) {
        await syncPrices();
        toast.error('A price changed - please review your order and try again.');
      } else {
        toast.error(parsed.message);
      }
    } finally { setPlacing(false); }
  };

  if (!items.length) {
    return (
      <div className="container py-5 text-center">
        <p>Your cart is empty.</p>
        <Link to="/shop" className="btn btn-accent">Continue shopping</Link>
      </div>
    );
  }

  return (
    <>
      <div className="page-title-bar">
        <div className="container">
          <h1>Checkout</h1>
        </div>
      </div>

      <div className="checkout-steps">
        <div className="container">
          <ol className="steps">
            <li className="is-done">
              <span className="step-num">
                <i className="bi bi-check-lg"></i>
              </span>{' '}
              Cart
            </li>
            <li className="is-active">
              <span className="step-num">2</span> Checkout
            </li>
            <li>
              <span className="step-num">3</span> Order Complete
            </li>
          </ol>
        </div>
      </div>

      <section className="section checkout-section">
        <div className="container">
          <form
            className={`row g-5 align-items-start needs-validation js-checkout-form${validated ? ' was-validated' : ''}`}
            noValidate
            onSubmit={placeOrder}
          >
            {/* Left: forms */}
            <div className="col-lg-7">
              <div className="panel checkout-panel">
                <h5 className="checkout-panel-title">
                  <i className="bi bi-person-circle"></i> Contact Information
                </h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="coEmail">
                      Email address
                    </label>
                    <input type="email" className="form-control" id="coEmail" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
                    <div className="invalid-feedback">Enter a valid email address.</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="coPhone">
                      Phone number
                    </label>
                    <input type="tel" className="form-control" id="coPhone" placeholder="+880 1XXX XXXXXX" value={form.phone} onChange={set('phone')} required />
                    <div className="invalid-feedback">Enter your phone number.</div>
                  </div>
                </div>
              </div>

              <div className="panel checkout-panel">
                <h5 className="checkout-panel-title">
                  <i className="bi bi-geo-alt"></i> Shipping Address
                </h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="coFirst">
                      First name
                    </label>
                    <input type="text" className="form-control" id="coFirst" placeholder="First name" value={form.firstName} onChange={set('firstName')} required />
                    <div className="invalid-feedback">Enter your first name.</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="coLast">
                      Last name
                    </label>
                    <input type="text" className="form-control" id="coLast" placeholder="Last name" value={form.lastName} onChange={set('lastName')} required />
                    <div className="invalid-feedback">Enter your last name.</div>
                  </div>
                  <div className="col-12">
                    <label className="form-label" htmlFor="coAddr">
                      Street address
                    </label>
                    <input type="text" className="form-control" id="coAddr" placeholder="House, road, area" value={form.address} onChange={set('address')} required />
                    <div className="invalid-feedback">Enter your address.</div>
                  </div>
                  <div className="col-md-5">
                    <label className="form-label" htmlFor="coCity">
                      City
                    </label>
                    <input type="text" className="form-control" id="coCity" placeholder="City" value={form.city} onChange={set('city')} required />
                    <div className="invalid-feedback">Enter your city.</div>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label" htmlFor="coZip">
                      Postal code
                    </label>
                    <input type="text" className="form-control" id="coZip" placeholder="Postal code" value={form.zip} onChange={set('zip')} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label" htmlFor="coCountry">
                      Country
                    </label>
                    <select className="form-select" id="coCountry" value={form.country} onChange={set('country')} required>
                      <option>Bangladesh</option>
                      <option>India</option>
                      <option>United States</option>
                      <option>United Kingdom</option>
                      <option>UAE</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="panel checkout-panel">
                <h5 className="checkout-panel-title">
                  <i className="bi bi-credit-card"></i> Payment Method
                </h5>

                <div className="payment-options">
                  {enabledPayments.map((type) => {
                    const meta = PAYMENT_META[type] || { icon: 'bi-credit-card', bg: '#eee', fg: '#333' };
                    return (
                      <label className="payment-card" key={type}>
                        <input
                          type="radio"
                          name="coPayment"
                          className="js-payment-radio"
                          value={type}
                          checked={paymentMethod === type}
                          onChange={() => setPaymentMethod(type)}
                        />
                        <span className="payment-card-icon" style={{ '--pay-bg': meta.bg, '--pay-fg': meta.fg }}>
                          <i className={`bi ${meta.icon}`}></i>
                        </span>
                        <span className="payment-card-label">{type}</span>
                        <span className="payment-card-check">
                          <i className="bi bi-check-lg"></i>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: order summary */}
            <div className="col-lg-5">
              <div className="panel order-summary">
                <h5 className="order-summary-title">Your Order</h5>

                <ul className="checkout-mini-cart">
                  {items.map((item) => (
                    <li key={item.id}>
                      <div className="cart-thumb cart-thumb-sm">
                        <img src={item.image} alt="" loading="lazy" />
                        <span className="mini-cart-qty">{item.qty}</span>
                      </div>
                      <div className="mini-cart-name">
                        {item.name}
                        <LineDetail item={item} />
                      </div>
                      <span className="mini-cart-price">{money(item.total_price, currencySymbol)}</span>
                    </li>
                  ))}
                </ul>

                {features.is_coupon && (
                  <div className="coupon-form coupon-form-sm">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Coupon code"
                      aria-label="Coupon code"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      disabled={!!applied}
                    />
                    {applied ? (
                      <button type="button" className="btn btn-accent" onClick={() => { setApplied(null); setCoupon(''); }}>
                        Remove
                      </button>
                    ) : (
                      <button type="button" className="btn btn-accent" onClick={() => applyCoupon()} disabled={couponBusy}>
                        {couponBusy ? '…' : 'Apply'}
                      </button>
                    )}
                  </div>
                )}
                {couponError && <p className="text-danger small mt-1">{couponError}</p>}

                <div className="order-summary-row">
                  <span>Subtotal</span>
                  <strong>{money(applied?.sub_total ?? subtotal, currencySymbol)}</strong>
                </div>
                <div className="order-summary-row">
                  <span>Shipping</span>
                  <strong className={shippingCharge === 0 ? 'text-accent' : ''}>
                    {shippingCharge === 0 ? 'Free' : money(applied?.shipping_charge ?? shippingCharge, currencySymbol)}
                  </strong>
                </div>
                {discount > 0 && (
                  <div className="order-summary-row">
                    <span>Discount</span>
                    <strong className="text-accent">&minus; {money(discount, currencySymbol)}</strong>
                  </div>
                )}
                <div className="order-summary-total">
                  <span>Total</span>
                  <strong>{money(total, currencySymbol)}</strong>
                </div>

                <div className="form-check mb-3">
                  <input className="form-check-input" type="checkbox" id="coTerms" required />
                  <label className="form-check-label" htmlFor="coTerms">
                    I agree to the <Link to="/terms">Terms &amp; Conditions</Link> and{' '}
                    <Link to="/privacy">Privacy Policy</Link>.
                  </label>
                  <div className="invalid-feedback">You must agree before placing your order.</div>
                </div>

                <button type="submit" className="btn btn-accent w-100" disabled={placing}>
                  <i className="bi bi-lock-fill"></i> {placing ? 'Placing order…' : `Place Order — ${money(total, currencySymbol)}`}
                </button>
                <p className="order-summary-note">
                  <i className="bi bi-shield-check"></i> Secure checkout &mdash; SSL encrypted
                </p>
              </div>
            </div>
          </form>
        </div>
      </section>

      <OtpModal
        open={otpOpen}
        phone={form.phone}
        onClose={() => setOtpOpen(false)}
        onVerified={() => { setOtpOpen(false); setOtpDone(true); submitOrder(); }}
      />
    </>
  );
}
