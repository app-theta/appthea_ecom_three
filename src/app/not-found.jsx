import Link from 'next/link';

export const metadata = { title: 'Page not found', robots: { index: false } };

/** A real 404 (status and page) for unknown URLs, missing products and posts. */
export default function NotFound() {
  return (
    <section className="section">
      <div className="container text-center py-5">
        <i className="bi bi-signpost-split" style={{ fontSize: 44 }}></i>
        <h1 className="mt-3">Page not found</h1>
        <p className="text-muted">This page could not be found - the link may have changed or the product is no longer available.</p>
        <div className="d-flex gap-2 justify-content-center mt-3">
          <Link className="btn btn-dark" href="/">Home</Link>
          <Link className="btn btn-outline-dark" href="/shop">Shop</Link>
        </div>
      </div>
    </section>
  );
}
