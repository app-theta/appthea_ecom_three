import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard.jsx';
import { useBusiness } from '../context/BusinessContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { catalog } from '../api/endpoints.js';
import { paginated } from '../utils/product.js';

const SORTS = [
  { value: 'latest', label: 'Sort: Popularity' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A - Z' },
];

const PRICE_RANGES = {
  under25: { max_price: 25 },
  '25-75': { min_price: 25, max_price: 75 },
  '75-200': { min_price: 75, max_price: 200 },
  above200: { min_price: 200 },
};

export default function Shop() {
  const { categories, brands } = useBusiness();
  const [params, setParams] = useSearchParams();
  const [isListView, setIsListView] = useState(false);

  const categorySlug = params.get('category') || '';
  const keyword = params.get('keyword') || '';
  const price = params.get('price') || '';
  const sort = params.get('sort') || 'latest';
  const page = Number(params.get('page') || 1);

  const activeCategory = categories.find((c) => c.slug === categorySlug);
  const activeBrand = brands.find((b) => b.slug === params.get('brand'));

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === null || value === '' || value === undefined) next.delete(key);
    else next.set(key, String(value));
    if (key !== 'page') next.delete('page');
    setParams(next, { replace: true });
  };

  const query = useMemo(() => ({
    keyword: keyword || undefined,
    category_id: activeCategory?.id,
    brand_id: activeBrand?.id,
    sort,
    per_page: 12,
    page,
    ...(PRICE_RANGES[price] || {}),
  }), [keyword, activeCategory?.id, activeBrand?.id, sort, page, price]);

  const { data, loading, error, reload } = useAsync(
    (signal) => catalog.products(query, { signal }),
    [JSON.stringify(query)],
  );
  const { rows, lastPage, total } = paginated(data);

  const goPage = (n) => {
    setParam('page', n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className="page-title-bar">
        <div className="container">
          <h1>{activeCategory ? activeCategory.name : 'Shop'}</h1>
        </div>
      </div>

      <section className="section shop-section">
        <div className="container">
          <div className="row g-4">
            {/* Filter sidebar */}
            <div className="shop-sidebar-col">
              <div
                className="offcanvas-lg offcanvas-start shop-filters"
                tabIndex="-1"
                id="shopFilters"
                aria-labelledby="shopFiltersLabel"
              >
                <div className="offcanvas-header">
                  <h5 className="offcanvas-title" id="shopFiltersLabel">
                    Filters
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="offcanvas"
                    data-bs-target="#shopFilters"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="offcanvas-body">
                  <div className="filter-panel">
                    <div className="filter-head">
                      <h6>Filters</h6>
                      <a
                        href="#"
                        className="filter-clear"
                        onClick={(e) => { e.preventDefault(); setParams({}, { replace: true }); }}
                      >
                        Clear all
                      </a>
                    </div>

                    {categories.length > 0 && (
                      <div className="filter-group">
                        <h6 className="filter-title">Category</h6>
                        {categories.filter((c) => (c.products_count ?? 1) > 0).map((c) => (
                          <div className="form-check" key={c.id}>
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`fCat${c.id}`}
                              checked={categorySlug === c.slug}
                              onChange={() => setParam('category', categorySlug === c.slug ? null : c.slug)}
                            />
                            <label className="form-check-label" htmlFor={`fCat${c.id}`}>
                              {c.name} {c.products_count != null && <span>({c.products_count})</span>}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}

                    {brands.length > 0 && (
                      <div className="filter-group">
                        <h6 className="filter-title">Brand</h6>
                        {brands.map((b) => (
                          <div className="form-check" key={b.id}>
                            <input
                              className="form-check-input"
                              type="radio"
                              name="fBrand"
                              id={`fBrand${b.id}`}
                              checked={params.get('brand') === b.slug}
                              onChange={() => setParam('brand', b.slug)}
                            />
                            <label className="form-check-label" htmlFor={`fBrand${b.id}`}>
                              {b.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="filter-group">
                      <h6 className="filter-title">Price</h6>
                      {[
                        { id: 'under25', label: 'Under 25' },
                        { id: '25-75', label: '25 – 75' },
                        { id: '75-200', label: '75 – 200' },
                        { id: 'above200', label: '200 & above' },
                      ].map((f) => (
                        <div className="form-check" key={f.id}>
                          <input
                            className="form-check-input"
                            type="radio"
                            name="fPrice"
                            id={`fPrice-${f.id}`}
                            checked={price === f.id}
                            onChange={() => setParam('price', f.id)}
                          />
                          <label className="form-check-label" htmlFor={`fPrice-${f.id}`}>
                            {f.label}
                          </label>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="btn btn-accent w-100 d-lg-none"
                      data-bs-dismiss="offcanvas"
                      data-bs-target="#shopFilters"
                    >
                      Show results
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Product listing */}
            <div className="shop-content-col">
              <div className="shop-toolbar">
                <p className="shop-count">
                  <strong>{total}</strong> results
                </p>

                <div className="shop-toolbar-actions">
                  <button
                    type="button"
                    className="btn btn-outline-dark d-lg-none shop-filter-toggle"
                    data-bs-toggle="offcanvas"
                    data-bs-target="#shopFilters"
                  >
                    <i className="bi bi-sliders"></i> Filters
                  </button>

                  <div className="view-toggle" role="group" aria-label="Toggle grid or list view">
                    <button
                      type="button"
                      className={`view-toggle-btn js-view-grid${!isListView ? ' is-active' : ''}`}
                      aria-label="Grid view"
                      aria-pressed={!isListView}
                      onClick={() => setIsListView(false)}
                    >
                      <i className="bi bi-grid-3x3-gap-fill"></i>
                    </button>
                    <button
                      type="button"
                      className={`view-toggle-btn js-view-list${isListView ? ' is-active' : ''}`}
                      aria-label="List view"
                      aria-pressed={isListView}
                      onClick={() => setIsListView(true)}
                    >
                      <i className="bi bi-list-ul"></i>
                    </button>
                  </div>
                  <select
                    className="form-select shop-sort"
                    aria-label="Sort products"
                    value={sort}
                    onChange={(e) => setParam('sort', e.target.value)}
                  >
                    {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="shop-grid js-shop-grid">
                  {Array.from({ length: 12 }, (_, i) => (
                    <div className="shop-grid-item" key={i}>
                      <div style={{ aspectRatio: '3/4', background: 'var(--cat-bg)', borderRadius: 'var(--radius)' }} />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-5">
                  <p>{error.message}</p>
                  <button type="button" className="btn btn-outline-dark" onClick={reload}>Retry</button>
                </div>
              ) : rows.length === 0 ? (
                <div className="text-center py-5">
                  <p>No products match these filters.</p>
                </div>
              ) : (
                <div className={`shop-grid js-shop-grid${isListView ? ' is-list-view' : ''}`}>
                  {rows.map((p) => (
                    <div className="shop-grid-item" key={p.id}>
                      <ProductCard product={p} />
                    </div>
                  ))}
                </div>
              )}

              {lastPage > 1 && (
                <nav className="shop-pagination" aria-label="Product pagination">
                  <ul className="pagination">
                    <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
                      <a className="page-link" href="#" aria-label="Previous" onClick={(e) => { e.preventDefault(); if (page > 1) goPage(page - 1); }}>
                        <i className="bi bi-chevron-left"></i>
                      </a>
                    </li>
                    {Array.from({ length: lastPage }, (_, i) => (
                      <li className={`page-item${page === i + 1 ? ' active' : ''}`} key={i}>
                        <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); goPage(i + 1); }}>
                          {i + 1}
                        </a>
                      </li>
                    ))}
                    <li className={`page-item${page === lastPage ? ' disabled' : ''}`}>
                      <a className="page-link" href="#" aria-label="Next" onClick={(e) => { e.preventDefault(); if (page < lastPage) goPage(page + 1); }}>
                        <i className="bi bi-chevron-right"></i>
                      </a>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
