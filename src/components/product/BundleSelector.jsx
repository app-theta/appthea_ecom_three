import { useBusiness } from '../../context/BusinessContext.jsx';
import { money } from '../../utils/format.js';
import { num, barcodesOf, variantLabel, meaningfulVariantLabel, thumbOf } from '../../utils/product.js';

/**
 * combo_type = "Different": one or more fixed bundles, each a set of
 * different products sold together at one bundle price. `is_current_product`
 * marks the item that IS the product being viewed - its variant comes from
 * the page's own picker above; every other item needs its own choice here.
 */
export default function BundleSelector({
  bundles = [], selectedId, onSelect, selections = {}, onSelectItem, currentBarcodeId,
}) {
  const { currencySymbol } = useBusiness();
  if (!bundles.length) return null;

  return (
    <div className="qv-block">
      <span className="qv-label">Bundle offers</span>
      {bundles.map((bundle) => {
        const active = Number(selectedId) === Number(bundle.id);
        const items = Array.isArray(bundle.items) ? bundle.items : [];

        return (
          <div key={bundle.id}>
            <button
              type="button"
              className={'promo-card' + (active ? ' is-active' : '')}
              aria-pressed={active}
              onClick={() => onSelect(active ? null : bundle)}
            >
              <div className="promo-card-top">
                <span className="promo-card-title">{items.length} items bundled</span>
                <span className="promo-card-price">{money(bundle.price, currencySymbol)}</span>
              </div>
              <div className="promo-card-sub">
                <s>{money(bundle.regular_total, currencySymbol)}</s>
                {num(bundle.savings_amount) > 0 && (
                  <span className="promo-card-save">Save {money(bundle.savings_amount, currencySymbol)}</span>
                )}
              </div>
              <ul className="promo-card-items">
                {items.map((it, n) => (
                  <li key={it.product?.id ?? n}>
                    <span>{num(it.quantity) > 1 ? `${it.quantity} × ` : ''}{it.product?.name || `#${it.product?.id}`}</span>
                    <span>{money(it.unit_price, currencySymbol)}</span>
                  </li>
                ))}
              </ul>
            </button>

            {active && (
              <div className="promo-pick">
                <div className="promo-pick-label">Choose the variant for each item</div>
                {items.map((it) => {
                  const product = it.product || {};
                  const bcs = barcodesOf(product);
                  const isCurrent = Boolean(it.is_current_product);
                  const chosen = isCurrent
                    ? currentBarcodeId
                    : selections?.[product.id]?.barcode_id ?? (bcs.length === 1 ? bcs[0].id : null);

                  return (
                    <div key={product.id} className="promo-item-row">
                      <img src={thumbOf(product)} alt="" loading="lazy" />
                      <div>
                        <div>
                          {product.name}
                          {isCurrent && <span className="text-muted"> · this product, variant above ↑</span>}
                        </div>
                        {!isCurrent && bcs.length > 1 && (
                          <div className="promo-pick-chips" style={{ marginTop: 6 }}>
                            {bcs.map((b) => (
                              <button
                                key={b.id}
                                type="button"
                                className={'promo-chip' + (Number(chosen) === Number(b.id) ? ' is-active' : '')}
                                onClick={() => onSelectItem(product.id, { barcode_id: b.id, name: product.name, variant: variantLabel(b) })}
                              >
                                {variantLabel(b)}
                              </button>
                            ))}
                          </div>
                        )}
                        {!isCurrent && bcs.length === 1 && meaningfulVariantLabel(bcs[0]) && (
                          <small className="text-muted">{meaningfulVariantLabel(bcs[0])}</small>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
