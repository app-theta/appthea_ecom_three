import { Link } from 'react-router-dom';
import DashLayout from '../../components/user/DashLayout.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useBusiness } from '../../context/BusinessContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { money } from '../../utils/format.js';
import { headlinePrice, productImages, productInStock, primaryBarcode, barcodesOf } from '../../utils/product.js';

export default function Wishlist() {
  const wishlist = useWishlist();
  const { addItem } = useCart();
  const { currencySymbol } = useBusiness();
  const toast = useToast();

  const remove = async (productId, name) => {
    try {
      await wishlist.toggle(productId);
      toast.success(`${name} removed from wishlist`);
    } catch { toast.error('Something went wrong'); }
  };

  const addToCart = (product) => {
    if (barcodesOf(product).length > 1) {
      toast.info('Open the product page to pick a variant first');
      return;
    }
    addItem(product, primaryBarcode(product), 1);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <DashLayout title="Wishlist">
      <div className="dash-block-head">
        <h5>Saved Items</h5>
        <span className="text-muted">{wishlist.rows.length} products</span>
      </div>
      {wishlist.loading ? (
        <p>Loading…</p>
      ) : wishlist.rows.length === 0 ? (
        <p className="text-muted">
          Your wishlist is empty. <Link to="/shop">Find something you like</Link>
        </p>
      ) : (
        <div className="row g-4">
          {wishlist.rows.map((r) => {
            const p = r.product;
            if (!p) return null;
            const images = productImages(p);
            const price = headlinePrice(p);
            const soldOut = !productInStock(p);
            return (
              <div className="col-6 col-md-4 col-lg-3" key={r.id}>
                <article className="product-card">
                  <div className="product-media">
                    <button
                      type="button"
                      className="dash-wish-remove"
                      aria-label="Remove from wishlist"
                      onClick={() => remove(p.id, p.name)}
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                    <Link to={`/product/${p.slug}`}>
                      <img className="product-thumb" src={images[0]} alt={p.name} loading="lazy" />
                    </Link>
                  </div>
                  <div className="product-body">
                    <h3 className="product-name">
                      <Link to={`/product/${p.slug}`}>{p.name}</Link>
                    </h3>
                    <div className="product-price">
                      <span className="price-now">{money(price.now, currencySymbol)}</span>
                      {price.was > 0 && <span className="price-old">{money(price.was, currencySymbol)}</span>}
                    </div>
                    <div className="product-actions">
                      <button
                        type="button"
                        className="btn btn-accent btn-add-cart w-100"
                        disabled={soldOut}
                        onClick={() => addToCart(p)}
                      >
                        <i className="bi bi-cart3"></i> {soldOut ? 'Sold Out' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      )}
    </DashLayout>
  );
}
