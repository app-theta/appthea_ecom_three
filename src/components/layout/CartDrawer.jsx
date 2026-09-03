import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { useBusiness } from '../../context/BusinessContext.jsx';
import { money } from '../../utils/format.js';

export default function CartDrawer() {
  const { items, count, subtotal, updateQty, removeItem } = useCart();
  const { currencySymbol } = useBusiness();

  return (
    <div
      className="offcanvas offcanvas-end cart-drawer"
      tabIndex="-1"
      id="cartDrawer"
      aria-labelledby="cartDrawerLabel"
    >
      <div className="offcanvas-header">
        <h5 className="offcanvas-title" id="cartDrawerLabel">
          Shopping bag <span className="cart-count">({count})</span>
        </h5>
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        ></button>
      </div>
      <div className="offcanvas-body">
        {items.length === 0 ? (
          <p className="text-center text-muted py-5 mb-0">Your bag is empty.</p>
        ) : (
          items.map((item) => (
            <div className="cart-item" key={item.id}>
              <div className="cart-thumb">
                <img src={item.image} alt="" loading="lazy" />
              </div>
              <div className="cart-info">
                <Link to={item.slug ? `/product/${item.slug}` : '/shop'} className="cart-name">
                  {item.name}
                </Link>
                <LineDetail item={item} />
                <div className="cart-bottom">
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
                  <span className="cart-price">{money(item.total_price, currencySymbol)}</span>
                </div>
              </div>
              <button
                className="cart-remove"
                type="button"
                aria-label="Remove item"
                onClick={() => removeItem(item.id)}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
          ))
        )}
      </div>
      <div className="cart-footer">
        <div className="cart-total">
          <span>Subtotal</span>
          <strong>{money(subtotal, currencySymbol)}</strong>
        </div>
        <p className="cart-note">Shipping and taxes are calculated at checkout.</p>
        <Link to="/checkout" className="btn btn-dark w-100 mb-2">
          Checkout
        </Link>
        <Link to="/cart" className="btn btn-outline-dark w-100">
          View bag
        </Link>
      </div>
    </div>
  );
}

/** The sub-detail line under a cart item's name - the variant for a simple
    line, or the free items / bundled items list for a combo/bundle line. */
export function LineDetail({ item }) {
  if (item.type === 'bundle') {
    return (
      <p className="cart-variant mb-0">
        Bundle
        {(item.bundleItems || []).map((i, n) => <span key={n} className="d-block">{i}</span>)}
      </p>
    );
  }
  if (item.type === 'combo_product') {
    return (
      <p className="cart-variant mb-0">
        {item.variant || 'Combo'}
        {(item.freeItems || []).map((i, n) => <span key={n} className="d-block">Free: {i}</span>)}
      </p>
    );
  }
  return item.variant ? <p className="cart-variant">{item.variant}</p> : null;
}
