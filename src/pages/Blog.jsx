import { useState } from 'react';
import { Link } from 'react-router-dom';
import { content } from '../api/endpoints.js';
import { useAsync } from '../hooks/useAsync.js';
import { paginated } from '../utils/product.js';
import { dateShort } from '../utils/format.js';

const cover = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' };

export default function Blog() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState('');
  const { data, loading, error } = useAsync(
    (signal) => content.blogs({ page, per_page: 6, keyword: search || undefined }, { signal }),
    [page, search],
  );
  const { rows: posts, lastPage } = paginated(data);
  const recent = paginated(useAsync((signal) => content.blogs({ per_page: 3 }, { signal }), []).data).rows;

  const go = (p) => { if (p >= 1 && p <= lastPage) setPage(p); };

  return (
    <>
      <div className="page-title-bar">
        <div className="container">
          <h1>Journal</h1>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-8">
              {loading ? (
                <p>Loading…</p>
              ) : error ? (
                <p className="text-danger">{error.message}</p>
              ) : posts.length === 0 ? (
                <p className="text-muted">{search ? `No posts match “${search}”.` : 'No posts yet.'}</p>
              ) : (
                <div className="row g-4">
                  {posts.map((post) => (
                    <div className="col-md-6" key={post.id}>
                      <article className="post-card">
                        <Link to={`/blog/${post.slug}`} className="post-thumb" tabIndex={-1} aria-hidden="true">
                          {post.thumbnail ? <img src={post.thumbnail} alt="" style={cover} /> : <i className="bi bi-journal-text"></i>}
                        </Link>
                        <div className="post-body">
                          <p className="post-meta">
                            <i className="bi bi-calendar3"></i> {dateShort(post.published_at)}
                          </p>
                          <h3 className="post-title">
                            <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                          </h3>
                          {post.excerpt && <p className="post-excerpt">{post.excerpt}</p>}
                          <Link to={`/blog/${post.slug}`} className="post-more">
                            Read article <i className="bi bi-arrow-right"></i>
                          </Link>
                        </div>
                      </article>
                    </div>
                  ))}
                </div>
              )}

              {lastPage > 1 && (
                <nav className="pager" aria-label="Blog pages">
                  <button type="button" className={`pager-btn${page <= 1 ? ' disabled' : ''}`} onClick={() => go(page - 1)} aria-label="Previous page">
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  {Array.from({ length: lastPage }, (_, i) => (
                    <button
                      type="button"
                      key={i}
                      className={`pager-btn${page === i + 1 ? ' is-current' : ''}`}
                      aria-current={page === i + 1 ? 'page' : undefined}
                      onClick={() => go(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button type="button" className={`pager-btn${page >= lastPage ? ' disabled' : ''}`} onClick={() => go(page + 1)} aria-label="Next page">
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </nav>
              )}
            </div>

            <aside className="col-lg-4">
              <div className="side-box">
                <h6 className="side-title">Search the journal</h6>
                <form className="side-search" role="search" onSubmit={(e) => { e.preventDefault(); setPage(1); setSearch(keyword.trim()); }}>
                  <input
                    type="search"
                    className="form-control"
                    placeholder="Search articles"
                    aria-label="Search articles"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                  <button type="submit" aria-label="Search">
                    <i className="bi bi-search"></i>
                  </button>
                </form>
              </div>

              {recent.length > 0 && (
                <div className="side-box">
                  <h6 className="side-title">Recent posts</h6>
                  <ul className="side-posts">
                    {recent.map((post) => (
                      <li key={post.id}>
                        <Link to={`/blog/${post.slug}`} className="mini-thumb" style={{ position: 'relative', overflow: 'hidden' }} tabIndex={-1} aria-hidden="true">
                          {post.thumbnail ? <img src={post.thumbnail} alt="" style={cover} /> : <i className="bi bi-journal-text"></i>}
                        </Link>
                        <div>
                          <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                          <span>{dateShort(post.published_at)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
