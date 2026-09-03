import { useBusiness } from '../../context/BusinessContext.jsx';
import { money } from '../../utils/format.js';
import { num, barcodesOf, variantLabel, meaningfulVariantLabel, thumbOf } from '../../utils/product.js';

/**
 * combo_type = "Same": quantity-break pricing on the product itself
 * ("buy 3, get 1 free"). Every amount here (combo_price, regular_total,
 * savings_amount) is precomputed by the backend - never recalculated here.
 */
export default function ComboTiers({ tiers = [], selectedQty, onSelect, freePicks = [], onFreePick }) {
  const { currencySymbol } = useBusiness();
  if (!tiers.length) return null;

  return (
    <div className="qv-block">
      <span className="qv-label">Combo offers</span>
      {tiers.map((tier) => {
        const qty = num(tier.combo_qty);
        const active = Number(selectedQty) === qty;
        const free = num(tier.free_qty);
        const eligible = Array.isArray(tier.eligible_free_products) ? tier.eligible_free_products : [];

        return (
          <div key={qty}>
            <button
              type="button"
              className={'promo-card' + (active ? ' is-active' : '')}
              aria-pressed={active}
              onClick={() => onSelect(active ? null : tier)}
            >
              <div className="promo-card-top">
                <span className="promo-card-title">
                  Buy {qty}{free > 0 ? ` + get ${free} free` : ''}
                </span>
                <span className="promo-card-price">{money(tier.combo_price, currencySymbol)}</span>
              </div>
              <div className="promo-card-sub">
                <s>{money(tier.regular_total, currencySymbol)}</s>
                {num(tier.savings_amount) > 0 && (
                  <span className="promo-card-save">Save {money(tier.savings_amount, currencySymbol)}</span>
                )}
              </div>
            </button>

            {active && free > 0 && (
              <FreeProductPicker slots={free} products={eligible} picks={freePicks} onPick={onFreePick} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/** One row per free slot: choose a product, then a variant of that product. */
export function FreeProductPicker({ slots = 1, products = [], picks = [], onPick }) {
  if (!products.length) return null;

  return (
    <div className="promo-pick">
      <div className="promo-pick-label">Choose your free item{slots > 1 ? 's' : ''}</div>

      {Array.from({ length: slots }).map((_, slot) => {
        const pick = picks[slot] || {};
        const chosen = products.find((p) => Number(p.id) === Number(pick.product_id));
        const chosenBarcodes = chosen ? barcodesOf(chosen) : [];

        return (
          <div key={slot}>
            <div className="promo-pick-chips">
              {products.map((p) => {
                const active = Number(pick.product_id) === Number(p.id);
                const bcs = barcodesOf(p);
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={'promo-chip' + (active ? ' is-active' : '')}
                    onClick={() => onPick(slot, {
                      product_id: p.id,
                      barcode_id: bcs.length === 1 ? bcs[0].id : null,
                      name: p.name,
                      variant: bcs.length === 1 ? meaningfulVariantLabel(bcs[0]) : null,
                    })}
                  >
                    <img src={thumbOf(p)} alt="" loading="lazy" />
                    {p.name}
                  </button>
                );
              })}
            </div>

            {chosen && chosenBarcodes.length > 1 && (
              <div className="promo-pick-chips">
                {chosenBarcodes.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    className={'promo-chip' + (Number(pick.barcode_id) === Number(b.id) ? ' is-active' : '')}
                    onClick={() => onPick(slot, { ...pick, barcode_id: b.id, variant: variantLabel(b) })}
                  >
                    {variantLabel(b)}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
