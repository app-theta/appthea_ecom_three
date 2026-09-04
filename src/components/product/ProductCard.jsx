import { Link, useNavigate } from 'react-router-dom';
import { useQuickView } from '../../context/QuickViewContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useBusiness } from '../../context/BusinessContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { money } from '../../utils/format.js';
import {
  headlinePrice, productImages, productInStock, primaryBarcode, barcodesOf, isCombo,
} from '../../utils/product.js';

function Stars({ full = 4, half = 1 }) {
  const empty = 5 - full - half;
  return (
    <span className="stars" aria-hidden="true">
      {Array.from({ length: full }).map((_, i) => (
        <i className="bi bi-star-fill" key={`f${i}`}></i>
      ))}
      {Array.from({ length: half }).map((_, i) => (
        <i className="bi bi-star-half" key={`h${i}`}></i>
      ))}
      {Array.from({ length: empty }).map((_, i) => (
        <i className="bi bi-star" key={`e${i}`}></i>
      ))}
    </span>
  );
}

export default function ProductCard({ product }) {
  const { openQuickView } = useQuickView();
  const { addItem } = useCart();
  const { isAuthed } = useAuth();
  const { currencySymbol } = useBusiness();
  const wishlist = useWishlist();
  const toast = useToast();
  const navigate = useNavigate();

  const images = productImages(product);
  const price = headlinePrice(product);
  const discount = price.was > price.now ? Math.round(((price.was - price.now) / price.was) * 100) : 0;
  const soldOut = !productInStock(product);
  const href = `/product/${product.slug}`;
  const wished = wishlist.has(product.id);
  const rating = Number(product.average_rating ?? product.rating ?? 4);

  const onWish = (e) => {
    e.preventDefault();
    if (!isAuthed) { navigate('/login'); return; }
    wishlist.toggle(product.id).catch(() => { });
  };

  const onAddToCart = (e) => {
    e.preventDefault();
    const barcodes = barcodesOf(product);
    if (barcodes.length > 1 || isCombo(product)) {
      openQuickView(product);
      return;
    }
    addItem(product, primaryBarcode(product), 1);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <article className="product-card">
      <div className="product-media">
        {discount > 0 && <span className="product-badge">-{discount}% OFF</span>}
        <Link to={href}>
          <img className="product-thumb" src={images[0]} alt={product.name} loading="lazy" />
          {images[1] && (
            <img
              className="product-thumb product-thumb-secondary"
              src={images[1]}
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
          )}
        </Link>
        <div className="product-hover-actions">
          <button type="button" className="product-action" aria-label="Add to wishlist" aria-pressed={wished} onClick={onWish}>
            <i className={`bi ${wished ? 'bi-heart-fill' : 'bi-heart'}`}></i>
          </button>
          <button
            type="button"
            className="product-action js-quickview-trigger"
            aria-label="Quick view"
            data-bs-toggle="offcanvas"
            data-bs-target="#quickViewDrawer"
            onClick={() => openQuickView(product)}
          >
            <i className="bi bi-eye"></i>
          </button>
        </div>
      </div>
      <div className="product-body">
        <h3 className="product-name">
          <Link to={href}>{product.name}</Link>
        </h3>
        {/* <div className="product-rating">
          <Stars full={Math.floor(rating)} half={rating % 1 >= 0.5 ? 1 : 0} />
        </div> */}
        <div className="product-price justify-content-between">
          <span className="price-now">{money(price.now, currencySymbol)}</span>
          {price.was > 0 && <span className="price-old">{money(price.was, currencySymbol)}</span>}
        </div>
        <div className="product-actions">
          <button type="button" className="btn btn-accent btn-add-cart" disabled={soldOut} onClick={onAddToCart}>
            <i className="bi bi-cart3"></i> {soldOut ? 'Sold Out' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </article>
  );
}
