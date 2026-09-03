import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuickView } from '../../context/QuickViewContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useBusiness } from '../../context/BusinessContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { money } from '../../utils/format.js';
import {
  barcodesOf, coloursOf, sizesOf, barcodePrice, productImages, plain, isCombo,
} from '../../utils/product.js';

export default function QuickViewDrawer() {
  const { product } = useQuickView();
  const { addItem } = useCart();
  const { isAuthed } = useAuth();
  const { currencySymbol } = useBusiness();
  const wishlist = useWishlist();
  const toast = useToast();
  const navigate = useNavigate();

  const [activeImage, setActiveImage] = useState(0);
  const [colourCode, setColourCode] = useState(null);
  const [sizeLabel, setSizeLabel] = useState(null);
  const [qty, setQty] = useState(1);

  const barcodes = useMemo(() => (product ? barcodesOf(product) : []), [product]);
  const colours = useMemo(() => coloursOf(barcodes), [barcodes]);
  const sizesForColour = useMemo(() => {
    const pool = colours.length > 0
      ? barcodes.filter((b) => (b?.combination?.colour?.code || b?.combination?.color?.code) === colourCode)
      : barcodes;
    return sizesOf(pool);
  }, [barcodes, colours.length, colourCode]);

  const selectedBarcode = useMemo(() => {
    if (barcodes.length === 1) return barcodes[0];
    return sizesForColour.find((s) => s.label === sizeLabel)?.barcode || null;
  }, [barcodes, sizesForColour, sizeLabel]);

  useEffect(() => {
    if (!product) return;
    setActiveImage(0);
    setQty(1);
    setColourCode(coloursOf(barcodesOf(product))[0]?.code ?? null);
    setSizeLabel(barcodesOf(product).length === 1 ? sizesOf(barcodesOf(product))[0]?.label ?? null : null);
  }, [product]);

  if (!product) {
    return (
      <div className="offcanvas offcanvas-end quickview-drawer" tabIndex="-1" id="quickViewDrawer" aria-labelledby="quickViewLabel">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="quickViewLabel">Quick View</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
      </div>
    );
  }

  const images = productImages(product);
  const price = selectedBarcode ? barcodePrice(selectedBarcode) : { now: 0, was: 0 };
  const needsVariant = barcodes.length > 1 && !selectedBarcode;
  const wished = wishlist.has(product.id);

  const onWish = () => {
    if (!isAuthed) { navigate('/login'); return; }
    wishlist.toggle(product.id).then((action) => {
      toast.success(action === 'added' ? 'Added to wishlist' : 'Removed from wishlist');
    }).catch(() => {});
  };

  const buy = (goToCheckout) => {
    if (needsVariant) { toast.error('Please select a variant'); return; }
    addItem(product, selectedBarcode, qty);
    if (goToCheckout) navigate('/checkout');
    else toast.success(`${product.name} added to cart`);
  };

  return (
    <div
      className="offcanvas offcanvas-end quickview-drawer"
      tabIndex="-1"
      id="quickViewDrawer"
      aria-labelledby="quickViewLabel"
    >
      <div className="offcanvas-header">
        <h5 className="offcanvas-title" id="quickViewLabel">
          Quick View
        </h5>
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        ></button>
      </div>
      <div className="offcanvas-body">
        <div className="qv-gallery">
          <div className="qv-thumbs">
            {images.map((img, i) => (
              <button
                type="button"
                key={img + i}
                className={`qv-thumb${activeImage === i ? ' is-active' : ''}`}
                aria-label={`Image ${i + 1}`}
                onClick={() => setActiveImage(i)}
              >
                <img src={img} alt="" loading="lazy" />
              </button>
            ))}
          </div>
          <div className="qv-main">
            <img src={images[activeImage]} alt={product.name} loading="lazy" />
          </div>
        </div>

        <div className="qv-info">
          <h4 className="qv-name">{product.name}</h4>

          <div className="product-price qv-price">
            <span className="price-now qv-price-now">{money(price.now, currencySymbol)}</span>
            {price.was > 0 && <span className="price-old qv-price-old">{money(price.was, currencySymbol)}</span>}
          </div>

          {colours.length > 0 && (
            <div className="qv-block">
              <span className="qv-label">
                Color: <strong className="qv-color-name">{colours.find((c) => c.code === colourCode)?.name || ''}</strong>
              </span>
              <div className="product-swatches">
                {colours.map((c) => (
                  <button
                    type="button"
                    key={c.code}
                    className={`swatch${colourCode === c.code ? ' is-active' : ''}`}
                    style={{ '--sw': c.code }}
                    aria-label={c.name}
                    onClick={() => { setColourCode(c.code); setSizeLabel(null); }}
                  ></button>
                ))}
              </div>
            </div>
          )}

          {sizesForColour.length > 0 && (
            <div className="qv-block">
              <span className="qv-label">
                Size: <strong className="qv-size-name">{sizeLabel || ''}</strong>
              </span>
              <div className="size-options">
                {sizesForColour.map((s) => (
                  <button
                    type="button"
                    key={s.label}
                    className={`size-opt${sizeLabel === s.label ? ' is-active' : ''}`}
                    onClick={() => setSizeLabel(s.label)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isCombo(product) ? (
            <p className="qv-desc">This product has combo/bundle offers - open the full page to pick one.</p>
          ) : (
            <div className="qv-block">
              <span className="qv-label">Quantity</span>
              <div className="qv-buy-row">
                <div className="qty">
                  <button
                    type="button"
                    aria-label="Decrease"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                  >
                    &minus;
                  </button>
                  <span>{qty}</span>
                  <button type="button" aria-label="Increase" onClick={() => setQty((q) => q + 1)}>
                    +
                  </button>
                </div>
                <button type="button" className="btn btn-dark qv-buy-now" onClick={() => buy(true)}>
                  Buy Now
                </button>
                <button type="button" className="btn btn-accent qv-add-cart" onClick={() => buy(false)}>
                  <i className="bi bi-cart3"></i> Add to Cart
                </button>
              </div>
            </div>
          )}

          <button type="button" className="pd-wish-link" onClick={onWish}>
            <i className={`bi ${wished ? 'bi-heart-fill' : 'bi-heart'}`}></i> {wished ? 'In wishlist' : 'Add to wishlist'}
          </button>

          <ul className="qv-meta">
            <li>
              <i className="bi bi-upc-scan"></i> <strong>SKU:</strong>{' '}
              <span className="qv-sku">{selectedBarcode?.barcode || '—'}</span>
            </li>
            {product.category?.name && (
              <li>
                <i className="bi bi-tags"></i> <strong>Category:</strong> {product.category.name}
              </li>
            )}
          </ul>

          {(product.short_description || product.long_description) && (
            <div className="qv-accordion">
              <button
                type="button"
                className="qv-accordion-toggle"
                data-bs-toggle="collapse"
                data-bs-target="#qvDescription"
                aria-expanded="true"
              >
                Description <i className="bi bi-chevron-down"></i>
              </button>
              <div className="collapse show" id="qvDescription">
                <p className="qv-desc">{plain(product.long_description || product.short_description)}</p>
              </div>
            </div>
          )}

          <Link to={`/product/${product.slug}`} className="btn btn-outline-dark w-100 mt-3">
            View Full Details
          </Link>
        </div>
      </div>
    </div>
  );
}
