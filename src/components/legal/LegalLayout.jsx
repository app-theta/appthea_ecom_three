export default function LegalLayout({ title, children }) {
  return (
    <>
      <div className="page-title-bar">
        <div className="container">
          <h1>{title}</h1>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 mx-auto">
              <div className="legal-body">{children}</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
