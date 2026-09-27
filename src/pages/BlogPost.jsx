import { Link, useParams } from 'react-router-dom';
import { content } from '../api/endpoints.js';
import { useAsync } from '../hooks/useAsync.js';
import { dateShort } from '../utils/format.js';

export default function BlogPost() {
  const { slug } = useParams();
  const { data: post, loading, error } = useAsync((signal) => content.blog(slug, { signal }), [slug]);

  return (
    <>
      <div className="page-title-bar">
        <div className="container">
          <h1>{loading ? 'Journal' : post?.title || 'Journal'}</h1>
        </div>
      </div>

      <section className="section">
        <div className="container" style={{ maxWidth: 860 }}>
          {loading ? (
            <p>Loading…</p>
          ) : error ? (
            <p>
              {error.status === 404 ? 'This post could not be found.' : error.message}{' '}
              <Link to="/blog" className="link-accent">Back to the journal</Link>
            </p>
          ) : (
            <article className="blog-article">
              <p className="post-meta mb-4"><i className="bi bi-calendar3"></i> {dateShort(post?.published_at)}</p>
              {post?.thumbnail && <img src={post.thumbnail} alt="" className="mb-4" style={{ width: '100%', borderRadius: 16 }} />}
              {/* written by the shop in the admin's rich-text editor */}
              <div className="blog-body" dangerouslySetInnerHTML={{ __html: post?.description || '' }} />
              <p className="mt-5 mb-0">
                <Link to="/blog" className="link-accent"><i className="bi bi-arrow-left"></i> Back to the journal</Link>
              </p>
            </article>
          )}
        </div>
      </section>
    </>
  );
}
