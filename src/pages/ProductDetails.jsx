import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard.jsx';
import ComboTiers from '../components/product/ComboTiers.jsx';
import BundleSelector from '../components/product/BundleSelector.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useBusiness } from '../context/BusinessContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { catalog, reviews as reviewsApi } from '../api/endpoints.js';
import { money } from '../utils/format.js';
import {
  barcodesOf, coloursOf, sizesOf, barcodePrice, productImages, paginated, plain,
  num, thumbOf, meaningfulVariantLabel, isSameCombo, isBundle, comboTiers, bundlesOf,
} from '../utils/product.js';

function StarRow({ rating }) {
  return (
    <span className="stars" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <i className={`bi ${i < Math.round(rating) ? 'bi-star-fill' : 'bi-star'}`} key={i}></i>
      ))}
    </span>
  );
}

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem, addComboItem, addBundleItem } = useCart();
  const { isAuthed } = useAuth();
  const { currencySymbol, enabledPayments } = useBusiness();
  const wishlist = useWishlist();
  const toast = useToast();

  const { data: product, loading, error, reload: reloadProduct } = useAsync((signal) => catalog.product(slug, { signal }), [slug]);

  const [activeImage, setActiveImage] = useState(0);
  const [colourCode, setColourCode] = useState(null);
  const [sizeLabel, setSizeLabel] = useState(null);
  const [qty, setQty] = useState(1);
  const [tier, setTier] = useState(null);
  const [freePicks, setFreePicks] = useState([]);
  const [bundle, setBundle] = useState(null);
  const [bundleSel, setBundleSel] = useState({});

  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewBusy, setReviewBusy] = useState(false);
  const [ratingError, setRatingError] = useState(false);

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
    setActiveImage(0);
    setQty(1);
    setColourCode(colours[0]?.code ?? null);
    setSizeLabel(barcodes.length === 1 ? sizesOf(barcodes)[0]?.label ?? null : null);
    setTier(null); setFreePicks([]); setBundle(null); setBundleSel({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  const { data: relatedData } = useAsync(
    (signal) => (product?.category?.id ? catalog.products({ category_id: product.category.id, per_page: 4 }, { signal }) : Promise.resolve(null)),
    [product?.category?.id],
    { skip: !product?.category?.id },
  );
  const relatedRows = paginated(relatedData).rows.filter((p) => p.id !== product?.id).slice(0, 4);

  if (loading) {
    return <div className="container py-5 text-center">Loading…</div>;
  }
  if (error || !product) {
    return (
      <div className="container py-5 text-center">
        Product not found. <Link to="/shop">Back to shop</Link>
      </div>
    );
  }
  const reviewRows = Array.isArray(product.reviews) ? product.reviews : [];
  const reviewSummary = {
    average: Number(product.average_rating || 0),
    total: Number(product.total_reviews ?? reviewRows.length),
  };

  const images = productImages(product);
  const price = selectedBarcode ? barcodePrice(selectedBarcode) : { now: 0, was: 0 };
  const discount = price.was > price.now ? Math.round(((price.was - price.now) / price.was) * 100) : 0;
  const needsVariant = barcodes.length > 1 && !selectedBarcode;
  const wished = wishlist.has(product.id);

  const tiers = comboTiers(product);
  const bundles = bundlesOf(product);

  const buildComboEntry = () => {
    if (!selectedBarcode) { toast.error('Please select a variant'); return null; }
    const freeNeeded = num(tier.free_qty);
    const picks = freePicks.slice(0, freeNeeded);
    if (freeNeeded > 0 && (picks.length < freeNeeded || picks.some((p) => !p?.product_id || !p?.barcode_id))) {
      toast.error(`Please choose ${freeNeeded} free item${freeNeeded > 1 ? 's' : ''}`);
      return null;
    }
    const vLabel = meaningfulVariantLabel(selectedBarcode);
    return {
      product_id: product.id,
      barcode_id: selectedBarcode.id,
      slug: product.slug,
      qty: num(tier.combo_qty),
      total_price: num(tier.combo_price),
      name: product.name,
      image: thumbOf(product),
      variant: vLabel ? `${tier.combo_qty} pcs · ${vLabel}` : `${tier.combo_qty} pcs`,
      free_items: picks.map((p) => [p.name, p.variant].filter(Boolean).join(' · ')),
      free_selections: picks.map((p) => ({ product_id: p.product_id, barcode_id: p.barcode_id })),
    };
  };

  const buildBundleEntry = () => {
    const items = Array.isArray(bundle.items) ? bundle.items : [];
    const selections = [];
    const labels = [];
    for (const it of items) {
      const p = it.product || {};
      const own = barcodesOf(p);
      const bid = it.is_current_product
        ? selectedBarcode?.id
        : bundleSel[p.id]?.barcode_id ?? (own.length === 1 ? own[0].id : null);
      if (!bid) { toast.error('Please choose a variant for every bundle item'); return null; }
      selections.push({ product_id: p.id, barcode_id: bid });
      labels.push(`${num(it.quantity) > 1 ? `${it.quantity} × ` : ''}${p.name}`);
    }
    return {
      bundle_id: bundle.id,
      qty,
      total_price: num(bundle.price) * qty,
      name: `${product.name} — Bundle`,
      slug: product.slug,
      image: thumbOf(product),
      items: labels,
      selections,
    };
  };

  const buy = (goToCheckout) => {
    if (bundle) {
      const entry = buildBundleEntry();
      if (!entry) return;
      addBundleItem(entry);
    } else if (tier) {
      const entry = buildComboEntry();
      if (!entry) return;
      addComboItem(entry);
    } else {
      if (needsVariant) { toast.error('Please select a variant'); return; }
      addItem(product, selectedBarcode, qty);
    }
    if (goToCheckout) navigate('/checkout');
    else toast.success(`${product.name} added to cart`);
  };

  const onWish = () => {
    if (!isAuthed) { navigate('/login'); return; }
    wishlist.toggle(product.id).then((action) => {
      toast.success(action === 'added' ? 'Added to wishlist' : 'Removed from wishlist');
    }).catch(() => toast.error('Something went wrong'));
  };

  const onSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthed) { navigate('/login'); return; }
    const okRating = reviewRating > 0;
    setRatingError(!okRating);
    if (!okRating || !reviewComment.trim()) return;

    setReviewBusy(true);
    try {
      await reviewsApi.store({ product_id: product.id, rating: reviewRating, review: reviewComment });
      setReviewComment('');
      setReviewRating(0);
      reloadProduct();
      toast.success('Review submitted');
      if (window.bootstrap) {
        const modalEl = document.getElementById('writeReviewModal');
        if (modalEl) window.bootstrap.Modal.getOrCreateInstance(modalEl).hide();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not submit review');
    } finally {
      setReviewBusy(false);
    }
  };

  return (
    <>
      {/* WRITE A REVIEW MODAL */}
      <div className="modal fade" id="writeReviewModal" tabIndex="-1" aria-labelledby="writeReviewModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content review-modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="writeReviewModalLabel">
                Write a Review
              </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {isAuthed ? (
                <form onSubmit={onSubmitReview}>
                  <div className="review-star-picker">
                    <span className="review-star-label">Your rating</span>
                    <div
                      className="review-stars js-review-stars"
                      role="radiogroup"
                      aria-label="Your rating"
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      {[1, 2, 3, 4, 5].map((v) => (
                        <button
                          type="button"
                          key={v}
                          className={`review-star${(hoverRating || reviewRating) >= v ? ' is-filled' : ''}`}
                          aria-label={`${v} star${v > 1 ? 's' : ''}`}
                          onMouseEnter={() => setHoverRating(v)}
                          onClick={() => { setReviewRating(v); setRatingError(false); }}
                        >
                          <i className="bi bi-star-fill"></i>
                        </button>
                      ))}
                    </div>
                    <p className="review-star-error js-review-star-error" hidden={!ratingError}>
                      Please select a star rating.
                    </p>
                  </div>

                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label" htmlFor="rvText">
                        Your review
                      </label>
                      <textarea
                        className="form-control"
                        id="rvText"
                        rows="4"
                        placeholder="What did you like or dislike?"
                        required
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                      ></textarea>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-accent w-100 mt-3" disabled={reviewBusy}>
                    {reviewBusy ? 'Submitting…' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <div className="text-center py-3">
                  <p>Please log in to write a review.</p>
                  <Link to="/login" className="btn btn-accent">Login</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BREADCRUMB */}
      <div className="pd-crumb-bar">
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="crumb crumb-left">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/shop">Shop</Link>
              </li>
              <li aria-current="page">{product.name}</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* PRODUCT DETAILS */}
      <section className="section pd-section">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-6">
              <div className="pd-gallery">
                {images.length > 1 && (
                  <div className="pd-thumbs">
                    {images.map((img, i) => (
                      <button
                        type="button"
                        key={img + i}
                        className={`pd-thumb${activeImage === i ? ' is-active' : ''}`}
                        aria-label={`Image ${i + 1}`}
                        onClick={() => setActiveImage(i)}
                      >
                        <img src={img} alt="" loading="lazy" />
                      </button>
                    ))}
                  </div>
                )}
                <div className="pd-main">
                  {discount > 0 && <span className="product-badge">-{discount}% OFF</span>}
                  <img src={images[activeImage]} alt={product.name} loading="lazy" />
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="pd-info">
                <h1 className="pd-title">{product.name}</h1>

                <div className="product-rating">
                  <StarRow rating={reviewSummary.average} />
                  <span className="rating-count">
                    {reviewSummary.total > 0 ? `(${reviewSummary.total} reviews)` : ''}
                  </span>
                  <a href="#" className="pd-review-link" data-bs-toggle="modal" data-bs-target="#writeReviewModal">
                    Write a review
                  </a>
                </div>

                <div className="product-price qv-price">
                  <span className="price-now qv-price-now">{money(price.now, currencySymbol)}</span>
                  {price.was > 0 && <span className="price-old">{money(price.was, currencySymbol)}</span>}
                  {discount > 0 && <span className="price-off">{discount}% OFF</span>}
                </div>

                {(product.short_description || product.long_description) && (
                  <p className="pd-desc">{plain(product.short_description || product.long_description)}</p>
                )}

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

                {isSameCombo(product) && (
                  <ComboTiers
                    tiers={tiers}
                    selectedQty={tier ? num(tier.combo_qty) : null}
                    onSelect={(next) => { setTier(next); setFreePicks([]); if (next) setQty(1); }}
                    freePicks={freePicks}
                    onFreePick={(slot, pick) => setFreePicks((list) => {
                      const next = [...list];
                      next[slot] = pick;
                      return next;
                    })}
                  />
                )}

                {isBundle(product) && (
                  <BundleSelector
                    bundles={bundles}
                    selectedId={bundle?.id ?? null}
                    onSelect={(b) => { setBundle(b); setBundleSel({}); setQty(1); }}
                    selections={bundleSel}
                    currentBarcodeId={selectedBarcode?.id ?? null}
                    onSelectItem={(pid, val) => setBundleSel((s) => ({ ...s, [pid]: val }))}
                  />
                )}

                <div className="qv-block">
                  {!tier && <span className="qv-label">Quantity</span>}
                  <div className="qv-buy-row">
                    {!tier && (
                      <div className="qty">
                        <button type="button" aria-label="Decrease" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                          &minus;
                        </button>
                        <span>{qty}</span>
                        <button type="button" aria-label="Increase" onClick={() => setQty((q) => q + 1)}>
                          +
                        </button>
                      </div>
                    )}
                    <button type="button" className="btn btn-dark qv-buy-now" onClick={() => buy(true)}>
                      Buy Now
                    </button>
                    <button type="button" className="btn btn-accent qv-add-cart" onClick={() => buy(false)}>
                      <i className="bi bi-cart3"></i> Add to Cart
                    </button>
                  </div>
                </div>

                <button type="button" className="pd-wish-link" onClick={onWish}>
                  <i className={`bi ${wished ? 'bi-heart-fill' : 'bi-heart'}`}></i> {wished ? 'In wishlist' : 'Add to wishlist'}
                </button>

                <ul className="qv-meta">
                  {enabledPayments.includes('Cash On Delivery') && (
                    <li>
                      <i className="bi bi-truck"></i> <strong>Cash on Delivery available</strong>
                    </li>
                  )}
                  {selectedBarcode?.barcode && (
                    <li>
                      <i className="bi bi-upc-scan"></i> <strong>SKU:</strong> {selectedBarcode.barcode}
                    </li>
                  )}
                  {product.category?.name && (
                    <li>
                      <i className="bi bi-tags"></i> <strong>Category:</strong> {product.category.name}
                      {product.brand?.name && `, ${product.brand.name}`}
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="pd-tabs-wrap">
            <ul className="nav nav-tabs pd-tabs" id="pdTab" role="tablist">
              <li className="nav-item" role="presentation">
                <button className="nav-link active" id="pd-desc-tab" data-bs-toggle="tab" data-bs-target="#pd-desc" type="button" role="tab">
                  Description
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button className="nav-link" id="pd-reviews-tab" data-bs-toggle="tab" data-bs-target="#pd-reviews" type="button" role="tab">
                  Reviews ({reviewRows.length})
                </button>
              </li>
            </ul>
            <div className="tab-content pd-tab-content" id="pdTabContent">
              <div className="tab-pane fade show active" id="pd-desc" role="tabpanel">
                <p>{plain(product.long_description || product.short_description) || 'No description available for this product yet.'}</p>
              </div>
              <div className="tab-pane fade" id="pd-reviews" role="tabpanel">
                <div className="pd-review-summary">
                  {reviewSummary.total > 0 && (
                    <div className="pd-review-score">
                      <span className="pd-score-num">{reviewSummary.average.toFixed(1)}</span>
                      <StarRow rating={reviewSummary.average} />
                      <span className="rating-count">Based on {reviewSummary.total} review{reviewSummary.total > 1 ? 's' : ''}</span>
                    </div>
                  )}
                  <button type="button" className="btn btn-outline-dark pd-write-review-btn" data-bs-toggle="modal" data-bs-target="#writeReviewModal">
                    <i className="bi bi-pencil-square"></i> Write a Review
                  </button>
                </div>

                <div className="pd-review-list" id="pdReviewList">
                  {reviewRows.length === 0 ? (
                    <p>No reviews yet. Be the first to review this product.</p>
                  ) : reviewRows.map((r) => {
                    const name = [r.customer?.first_name, r.customer?.last_name].filter(Boolean).join(' ')
                      || r.customer_name || 'Customer';
                    const date = (r.created_at || '').split(' ').slice(0, 3).join(' ');
                    return (
                      <div className="pd-review" key={r.id}>
                        <div className="pd-review-avatar-fallback">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div className="pd-review-body">
                          <div className="pd-review-head">
                            <strong>{name}</strong>
                            <StarRow rating={r.rating} />
                            {date && <span className="rating-count ms-auto">{date}</span>}
                          </div>
                          <p>{r.review || r.comment}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Related products */}
          {relatedRows.length > 0 && (
            <div className="pd-related">
              <div className="sec-head">
                <div>
                  <h2 className="sec-title">You May Also Like</h2>
                  <p className="sec-sub">More pieces picked to go with this one.</p>
                </div>
                <Link to="/shop" className="btn-ghost">
                  View all
                </Link>
              </div>
              <div className="row g-4">
                {relatedRows.map((p) => (
                  <div className="col-12 col-sm-6 col-md-3" key={p.id}>
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
