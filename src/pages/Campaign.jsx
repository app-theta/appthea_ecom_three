import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard.jsx';
import CampaignHero from '../components/product/CampaignHero.jsx';
import Breadcrumb from '../components/layout/Breadcrumb.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { deals } from '../api/endpoints.js';
import { paginated } from '../utils/product.js';

/** /campaign/:slug - one running campaign and all its products at the campaign price. */
export default function Campaign() {
  const { slug } = useParams();
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [slug]);

  const { data, loading, error, reload } = useAsync(
    (signal) => deals.campaign(slug, { page, per_page: 24 }, { signal }),
    [slug, page],
  );
  const campaign = data?.campaign;
  const { rows, lastPage } = paginated(data?.products);

  useEffect(() => {
    if (campaign?.title) document.title = campaign.title;
  }, [campaign?.title]);

  const goPage = (n) => {
    setPage(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 404 = not running any more (ended, not started yet, or taken down)
  const ended = error?.status === 404;

  return (
    <>
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Shop', to: '/shop' }, { label: campaign?.title || 'Campaign' }]} />

      <section className="section campaign-page">
        <div className="container">
          {loading && !data ? (
            <div className="row g-4 product-grid">
              {Array.from({ length: 8 }, (_, i) => (
                <div className="col-6 col-md-3" key={i}>
                  <div style={{ aspectRatio: '3/4', background: 'var(--cat-bg)', borderRadius: 'var(--radius)' }} />
                </div>
              ))}
            </div>
          ) : ended ? (
            <div className="campaign-ended text-center py-5">
              <i className="bi bi-hourglass-bottom"></i>
              <h2>This campaign has ended</h2>
              <p>Its special prices are no longer available, but there is plenty more in the shop.</p>
              <Link to="/shop" className="btn btn-accent">Keep shopping</Link>
            </div>
          ) : error ? (
            <div className="text-center py-5">
              <p>{error.message}</p>
              <button type="button" className="btn btn-outline-dark" onClick={reload}>Retry</button>
            </div>
          ) : campaign && (
            <>
              <CampaignHero campaign={campaign} linked={false} as="h1" onEnd={reload} />

              {rows.length ? (
                <div className="row g-4 product-grid mt-2">
                  {rows.map((p) => (
                    <div className="col-6 col-md-4 col-lg-3" key={p.id}>
                      <ProductCard product={p} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5"><p>No products in this campaign right now.</p></div>
              )}

              {lastPage > 1 && (
                <nav className="shop-pagination" aria-label="Campaign pagination">
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
            </>
          )}
        </div>
      </section>
    </>
  );
}
