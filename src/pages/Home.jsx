import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroSlider from '../components/product/HeroSlider.jsx';
import CategorySlider from '../components/product/CategorySlider.jsx';
import ProductCard from '../components/product/ProductCard.jsx';
import { useBusiness } from '../context/BusinessContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { catalog, home } from '../api/endpoints.js';
import { paginated } from '../utils/product.js';
import { categoryNavTree } from '../utils/categoryTree.js';

function ProductGrid({ rows, loading, cols = 'col-12 col-sm-6 col-md-3' }) {
  if (loading) {
    return (
      <div className="row g-4 product-grid">
        {Array.from({ length: 4 }, (_, i) => (
          <div className={cols} key={i}>
            <div style={{ aspectRatio: '3/4', background: 'var(--cat-bg)', borderRadius: 'var(--radius)' }} />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="row g-4 product-grid">
      {rows.map((p) => (
        <div className={cols} key={p.id}>
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  );
}

function CategoryBlock({ category, isLast }) {
  const { data, loading } = useAsync(
    (signal) => catalog.products({ category_id: category.id, per_page: 4 }, { signal }),
    [category.id],
  );
  const rows = paginated(data).rows;
  if (!loading && rows.length === 0) return null;

  return (
    <section className={`section category-block${isLast ? ' category-block-last' : ''}`}>
      <div className="container">
        <div className="sec-head">
          <div>
            <h2 className="sec-title">Shop {category.label}</h2>
          </div>
          <Link to={`/shop?category=${category.slug}`} className="btn-ghost">
            View all
          </Link>
        </div>
        <ProductGrid rows={rows} loading={loading} />
      </div>
    </section>
  );
}

export default function Home() {
  const { categories } = useBusiness();
  const topCategories = useMemo(() => categoryNavTree(categories).slice(0, 3), [categories]);
  const [activeDealCategory, setActiveDealCategory] = useState(null);
  const dealTabs = useMemo(() => categoryNavTree(categories).slice(0, 5), [categories]);
  const dealCategoryId = activeDealCategory ?? dealTabs[0]?.id ?? null;

  const summary = useAsync((signal) => home.summary({ per_page: 8 }, { signal }), []);
  const featuredRows = paginated(summary.data?.featured).rows;
  const bestSellerRows = paginated(summary.data?.latest).rows.slice(0, 4);

  const flashDeal = useAsync(
    (signal) => (dealCategoryId ? catalog.products({ category_id: dealCategoryId, per_page: 5 }, { signal }) : Promise.resolve(null)),
    [dealCategoryId],
    { skip: !dealCategoryId },
  );
  const flashDealRows = paginated(flashDeal.data).rows;

  return (
    <>
      <HeroSlider />

      {/* ============================= CATEGORY SLIDER ============================= */}
      <section className="section cat-section">
        <div className="container">
          <div className="sec-head">
            <div>
              <h2 className="sec-title">Featured Categories</h2>
            </div>
            <Link to="/shop" className="btn-ghost">
              View all
            </Link>
          </div>
          <CategorySlider />
        </div>
      </section>

      {/* ============================= FLASH DEAL ============================= */}
      {dealTabs.length > 0 && (
        <section className="section deal-section">
          <div className="container">
            <div className="sec-head sec-head-center">
              <h2 className="sec-title">Flash Fashion Deal</h2>
            </div>

            <div className="deal-tabs js-deal-tabs" role="tablist">
              {dealTabs.map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  className={`deal-tab${dealCategoryId === tab.id ? ' is-active' : ''}`}
                  role="tab"
                  aria-selected={dealCategoryId === tab.id}
                  onClick={() => setActiveDealCategory(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <ProductGrid rows={flashDealRows} loading={flashDeal.loading} cols="col-12 col-sm-6 col-md-4 col-lg" />
          </div>
        </section>
      )}

      {/* ============================= FEATURED PRODUCTS ============================= */}
      <section className="section featured-section">
        <div className="container">
          <div className="sec-head">
            <div>
              <h2 className="sec-title">Featured Products</h2>
            </div>
            <Link to="/shop?is_featured=Yes" className="btn-ghost">
              View all
            </Link>
          </div>
          <ProductGrid rows={featuredRows.slice(0, 4)} loading={summary.loading} />
        </div>
      </section>

      {/* ============================= BEST SELLERS ============================= */}
      <section className="section bestseller-section">
        <div className="container">
          <div className="sec-head">
            <div>
              <h2 className="sec-title">New Arrivals</h2>
            </div>
            <Link to="/shop" className="btn-ghost">
              View all
            </Link>
          </div>
          <ProductGrid rows={bestSellerRows} loading={summary.loading} />
        </div>
      </section>

      {/* ============================= PER-CATEGORY BLOCKS ============================= */}
      {topCategories.map((cat, i) => (
        <CategoryBlock key={cat.id} category={cat} isLast={i === topCategories.length - 1} />
      ))}
    </>
  );
}
