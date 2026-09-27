import { Link } from 'react-router-dom';
import { content } from '../api/endpoints.js';
import { useAsync } from '../hooks/useAsync.js';

export default function Faq() {
  const { data, loading, error } = useAsync((signal) => content.faqs({ signal }), []);
  const faqs = Array.isArray(data) ? data : [];

  return (
    <>
      <div className="page-title-bar">
        <div className="container">
          <h1>Frequently Asked Questions</h1>
        </div>
      </div>

      <section className="section">
        <div className="container" style={{ maxWidth: 860 }}>
          {loading ? (
            <p>Loading…</p>
          ) : error ? (
            <p className="text-danger">{error.message}</p>
          ) : faqs.length === 0 ? (
            <p className="text-muted">No questions have been added yet.</p>
          ) : (
            <div className="panel">
              <div className="accordion accordion-flush faq" id="faq-page">
                {faqs.map((f, i) => (
                  <div className="accordion-item" key={f.id}>
                    <h2 className="accordion-header">
                      <button
                        className={`accordion-button${i === 0 ? '' : ' collapsed'}`}
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#faqp-${f.id}`}
                        aria-expanded={i === 0}
                      >
                        {f.question}
                      </button>
                    </h2>
                    <div id={`faqp-${f.id}`} className={`accordion-collapse collapse${i === 0 ? ' show' : ''}`} data-bs-parent="#faq-page">
                      <div className="accordion-body" style={{ whiteSpace: 'pre-line' }}>{f.answer}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="text-muted mt-4 mb-0">Still have a question? <Link to="/contact" className="link-accent">Contact us</Link></p>
        </div>
      </section>
    </>
  );
}
