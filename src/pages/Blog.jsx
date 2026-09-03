const posts = [
  { icon: 'bi-stars', tag: 'Style guide', date: 'Mar 12, 2026', read: '6 min read', title: 'Five ways to wear one midi dress', excerpt: 'Office, brunch, wedding, travel and the school run — the same dress, styled five ways.' },
  { icon: 'bi-droplet', tag: 'Fabric', date: 'Mar 04, 2026', read: '4 min read', title: 'How to read a care label properly', excerpt: 'The symbols on that little tag decide whether a knit lasts one season or ten.' },
  { icon: 'bi-snow', tag: 'Winter', date: 'Feb 22, 2026', read: '5 min read', title: 'Layering without the bulk', excerpt: 'Thin, warm and structured: the three-layer rule that keeps a coat looking sharp.' },
  { icon: 'bi-scissors', tag: 'Behind the seams', date: 'Feb 09, 2026', read: '8 min read', title: 'Meet the makers in Narayanganj', excerpt: 'A morning inside the workshop where the winter collection was cut and stitched.' },
  { icon: 'bi-bag-heart', tag: 'Accessories', date: 'Jan 27, 2026', read: '5 min read', title: 'Choosing a bag that survives daily use', excerpt: 'Hardware, lining and stitch density matter more than the label on the front.' },
  { icon: 'bi-recycle', tag: 'Care', date: 'Jan 15, 2026', read: '3 min read', title: 'Wash less, wear longer', excerpt: 'Airing, spot cleaning and cold cycles keep colour in and shrinkage out.' },
];

const categories = [
  { label: 'Style guide', count: 12 },
  { label: 'Fabric & care', count: 8 },
  { label: 'Winter', count: 6 },
  { label: 'Behind the seams', count: 4 },
  { label: 'Accessories', count: 9 },
];

const tags = ['Denim', 'Knitwear', 'Linen', 'Sustainable', 'Capsule', 'Bags'];

export default function Blog() {
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
              <div className="row g-4">
                {posts.map((post) => (
                  <div className="col-md-6" key={post.title}>
                    <article className="post-card">
                      <a href="#" className="post-thumb" onClick={(e) => e.preventDefault()}>
                        <i className={`bi ${post.icon}`}></i>
                        <span className="post-tag">{post.tag}</span>
                      </a>
                      <div className="post-body">
                        <p className="post-meta">
                          <i className="bi bi-calendar3"></i> {post.date} <span>&middot;</span> {post.read}
                        </p>
                        <h3 className="post-title">
                          <a href="#" onClick={(e) => e.preventDefault()}>
                            {post.title}
                          </a>
                        </h3>
                        <p className="post-excerpt">{post.excerpt}</p>
                        <a href="#" className="post-more" onClick={(e) => e.preventDefault()}>
                          Read article <i className="bi bi-arrow-right"></i>
                        </a>
                      </div>
                    </article>
                  </div>
                ))}
              </div>

              <nav className="pager" aria-label="Blog pages">
                <a href="#" className="pager-btn disabled" aria-disabled="true" onClick={(e) => e.preventDefault()}>
                  <i className="bi bi-chevron-left"></i>
                </a>
                <a href="#" className="pager-btn is-current" aria-current="page" onClick={(e) => e.preventDefault()}>
                  1
                </a>
                <a href="#" className="pager-btn" onClick={(e) => e.preventDefault()}>
                  2
                </a>
                <a href="#" className="pager-btn" onClick={(e) => e.preventDefault()}>
                  3
                </a>
                <a href="#" className="pager-btn" onClick={(e) => e.preventDefault()}>
                  <i className="bi bi-chevron-right"></i>
                </a>
              </nav>
            </div>

            <aside className="col-lg-4">
              <div className="side-box">
                <h6 className="side-title">Search the journal</h6>
                <form className="side-search" role="search" onSubmit={(e) => e.preventDefault()}>
                  <input type="search" className="form-control" placeholder="Search articles" aria-label="Search articles" />
                  <button type="submit" aria-label="Search">
                    <i className="bi bi-search"></i>
                  </button>
                </form>
              </div>

              <div className="side-box">
                <h6 className="side-title">Categories</h6>
                <ul className="side-list">
                  {categories.map((c) => (
                    <li key={c.label}>
                      <a href="#" onClick={(e) => e.preventDefault()}>
                        {c.label} <span>{c.count}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="side-box">
                <h6 className="side-title">Recent posts</h6>
                <ul className="side-posts">
                  {posts.slice(0, 3).map((post) => (
                    <li key={post.title}>
                      <a href="#" className="mini-thumb" onClick={(e) => e.preventDefault()}>
                        <i className={`bi ${post.icon}`}></i>
                      </a>
                      <div>
                        <a href="#" onClick={(e) => e.preventDefault()}>
                          {post.title}
                        </a>
                        <span>{post.date}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="side-box">
                <h6 className="side-title">Tags</h6>
                <div className="side-tags">
                  {tags.map((t) => (
                    <a href="#" key={t} onClick={(e) => e.preventDefault()}>
                      {t}
                    </a>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
