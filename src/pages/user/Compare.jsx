import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashLayout from '../../components/user/DashLayout.jsx';
import { useBusiness } from '../../context/BusinessContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useCompare, COMPARE_LIMIT } from '../../context/CompareContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { catalog } from '../../api/endpoints.js';
import { money } from '../../utils/format.js';
import { showOffcanvas } from '../../utils/offcanvas.js';
import {
  barcodesOf, headlinePrice, isBundle, isCombo, meaningfulVariantLabel, num, plain, primaryBarcode,
  productImages, productInStock, ratingOf,
} from '../../utils/product.js';

// a guest compares too - without the account sidebar
function GuestFrame({ children }) {
  return (
    <>
      <div className="page-title-bar">
        <div className="container">
          <h1>Compare</h1>
        </div>
      </div>
      <section className="section">
        <div className="container">{children}</div>
      </section>
    </>
  );
}

export default function Compare() {
  const { currencySymbol, features } = useBusiness();
  const { isAuthed } = useAuth();
  const { addItem } = useCart();
  const toast = useToast();
  const compare = useCompare();

  // the live product for every picked slug; one that is gone (deleted / switched off) comes back null
  const key = compare.items.map((item) => item.slug).join(',');
  const { data, loading } = useAsync(async (signal) => {
    const results = await Promise.allSettled(compare.items.map((item) => catalog.product(item.slug, { signal })));
    return compare.items.map((item, i) => ({ item, product: results[i].status === 'fulfilled' ? results[i].value : null }));
  }, [key]);

  const gone = (data || []).filter((row) => !row.product);
  useEffect(() => {
    if (!gone.length) return;
    gone.forEach((row) => compare.remove(row.item.id));
    toast.error(`${gone.map((row) => row.item.name).join(', ')} is no longer available and was taken off the list`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gone.length]);

  const products = (data || []).filter((row) => row.product && compare.has(row.item.id)).map((row) => row.product);
  const Frame = isAuthed ? DashLayout : GuestFrame;

  const addToCart = (p) => {
    addItem(p, primaryBarcode(p), 1);
    toast.success(`${p.name} added to cart`);
    if (features.open_cart) showOffcanvas('cartDrawer');
  };

  const rows = [
    ['Name', (p) => <Link to={`/product/${p.slug}`} className="link-accent">{p.name}</Link>],
    ['Price', (p) => {
      const price = headlinePrice(p);
      return (
        <>
          <strong>{money(price.now, currencySymbol)}</strong>
          {price.was > 0 && <del className="compare-muted ms-2">{money(price.was, currencySymbol)}</del>}
        </>
      );
    }],
    ['Rating', (p) => {
      const rating = ratingOf(p);
      return rating.count > 0
        ? <span><i className="bi bi-star-fill text-warning"></i> {rating.value.toFixed(1)} ({rating.count})</span>
        : <span className="compare-muted">No reviews yet</span>;
    }],
    ['Category', (p) => p.category?.name || <span className="compare-muted">—</span>],
    ['Brand', (p) => p.brand?.name || <span className="compare-muted">—</span>],
    ['Options', (p) => {
      if (isBundle(p)) return 'Bundle offer';
      // the API sends a variant's name as one string ("Red - XL"); the helper covers an object form
      const labels = barcodesOf(p)
        .map((b) => meaningfulVariantLabel(b) || (typeof b?.combination === 'string' ? b.combination.trim() : ''))
        .filter(Boolean);
      const text = labels.length ? labels.join(', ') : <span className="compare-muted">—</span>;
      return isCombo(p) ? <>{text} <span className="dash-badge is-active ms-1">Combo offer</span></> : text;
    }],
    ['Availability', (p) => {
      if (!productInStock(p)) return <span className="dash-badge is-danger">Out of Stock</span>;
      const left = num(p.total_stock_qty);
      return left > 0 && left <= 5
        ? <span className="dash-badge is-pending">Only {left} left</span>
        : <span className="dash-badge is-done">In Stock</span>;
    }],
    ['Description', (p) => <span className="compare-desc d-block">{plain(p.short_description).slice(0, 160) || '—'}</span>],
  ];

  return (
    <Frame title="Compare">
      <div className="panel dash-table-panel">
        <div className="dash-block-head">
          <h5>Compare products</h5>
          {compare.count > 0 && (
            <button type="button" className="btn btn-outline-dark btn-sm" onClick={compare.clear}>
              Clear all
            </button>
          )}
        </div>

        {compare.count === 0 ? (
          <div className="p-4 text-center">
            <p className="mb-3">Nothing to compare yet. Use the <i className="bi bi-arrow-left-right"></i> button on any product (up to {COMPARE_LIMIT}).</p>
            <Link to="/shop" className="btn btn-accent btn-sm">Browse products</Link>
          </div>
        ) : loading && !data ? (
          <p className="p-4 mb-0">Loading…</p>
        ) : (
          <div className="table-responsive dash-compare-scroll">
            <table className="table dash-compare-table">
              <tbody>
                <tr className="dash-compare-imgs">
                  <td>Product</td>
                  {products.map((p) => (
                    <td key={p.id}>
                      <Link to={`/product/${p.slug}`}>
                        <img src={productImages(p)[0]} alt={p.name} loading="lazy" />
                      </Link>
                      <button type="button" className="dash-wish-remove" aria-label={`Remove ${p.name}`} onClick={() => compare.remove(p.id)}>
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </td>
                  ))}
                </tr>
                {rows.map(([label, render]) => (
                  <tr key={label}>
                    <td>{label}</td>
                    {products.map((p) => <td key={p.id}>{render(p)}</td>)}
                  </tr>
                ))}
                <tr>
                  <td></td>
                  {products.map((p) => {
                    const simple = barcodesOf(p).length <= 1 && !isCombo(p);
                    return (
                      <td key={p.id}>
                        {!productInStock(p) ? (
                          <button type="button" className="btn btn-accent btn-sm w-100" disabled>Sold Out</button>
                        ) : simple ? (
                          <button type="button" className="btn btn-accent btn-sm w-100" onClick={() => addToCart(p)}>
                            <i className="bi bi-cart3"></i> Add to Cart
                          </button>
                        ) : (
                          <Link to={`/product/${p.slug}`} className="btn btn-outline-dark btn-sm w-100">Choose options</Link>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Frame>
  );
}
