import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useBusiness } from '../context/BusinessContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { LineDetail } from '../components/layout/CartDrawer.jsx';
import { money } from '../utils/format.js';

export default function Cart() {
  const { items, subtotal, updateQty, removeItem } = useCart();
  const { currencySymbol } = useBusiness();
  const toast = useToast();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState('');

  const applyCoupon = (e) => {
    e.preventDefault();
    if (!coupon.trim()) return;
    navigate('/checkout', { state: { coupon: coupon.trim() } });
  };

  return (
    <>
      <div className="page-title-bar">
        <div className="container">
          <h1>Shopping Cart</h1>
        </div>
      </div>

      <section className="section cart-page-section">
        <div className="container">
          <div className="row g-5 align-items-start">
            <div className="col-lg-8">
              <div className="panel cart-panel">
                <div className="cart-list-head d-none d-md-flex">
                  <span className="cart-col-product">Product</span>
                  <span className="cart-col-qty">Quantity</span>
                  <span className="cart-col-total">Total</span>
                </div>

                {items.length === 0 && (
                  <p className="text-center text-muted py-5 mb-0">Your bag is empty.</p>
                )}

                {items.map((item) => (
                  <div className="cart-row" key={item.id}>
                    <div className="cart-item cart-item-full">
                      <Link to={item.slug ? `/product/${item.slug}` : '/shop'} className="cart-thumb cart-thumb-lg">
                        <img src={item.image} alt={item.name} loading="lazy" />
                      </Link>
                      <div className="cart-info">
                        <Link to={item.slug ? `/product/${item.slug}` : '/shop'} className="cart-name">{item.name}</Link>
                        <LineDetail item={item} />
                        <span className="cart-price cart-price-mobile">{money(item.price, currencySymbol)}</span>
                      </div>
                      <div className="cart-col-qty">
                        {item.type === 'simple' ? (
                          <div className="qty">
                            <button
                              type="button"
                              aria-label="Decrease"
                              onClick={() => updateQty(item.id, -1)}
                            >
                              &minus;
                            </button>
                            <span>{item.qty}</span>
                            <button
                              type="button"
                              aria-label="Increase"
                              onClick={() => updateQty(item.id, 1)}
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <span className="cart-variant">Qty {item.qty}</span>
                        )}
                      </div>
                      <div className="cart-col-total">
                        <span className="cart-row-total">{money(item.total_price, currencySymbol)}</span>
                        <button
                          className="cart-remove"
                          type="button"
                          aria-label="Remove item"
                          onClick={() => removeItem(item.id)}
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="cart-panel-footer">
                  <Link to="/shop" className="link-accent">
                    <i className="bi bi-arrow-left"></i> Continue shopping
                  </Link>
                  <button type="button" className="btn btn-outline-dark" onClick={() => toast.info('Cart updated')}>
                    Update Cart
                  </button>
                </div>
              </div>

              <div className="panel coupon-panel mt-4">
                <form className="coupon-form" onSubmit={applyCoupon}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Coupon code"
                    aria-label="Coupon code"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                  />
                  <button type="submit" className="btn btn-dark">
                    Apply Coupon
                  </button>
                </form>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="panel order-summary">
                <h5 className="order-summary-title">Order Summary</h5>
                <div className="order-summary-row">
                  <span>Subtotal</span>
                  <strong>{money(subtotal, currencySymbol)}</strong>
                </div>
                <div className="order-summary-row">
                  <span>Shipping</span>
                  <strong className="text-accent">Calculated at checkout</strong>
                </div>
                <div className="order-summary-total">
                  <span>Total</span>
                  <strong>{money(subtotal, currencySymbol)}</strong>
                </div>
                <Link to="/checkout" className="btn btn-accent w-100">
                  Proceed to Checkout <i className="bi bi-arrow-right"></i>
                </Link>
                <p className="order-summary-note">
                  <i className="bi bi-shield-check"></i> Secure checkout &mdash; SSL encrypted
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
