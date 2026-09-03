import { useState } from 'react';
import { useToast } from '../context/ToastContext.jsx';

const infoCards = [
  { icon: 'bi-geo-alt', title: 'Visit the studio', lines: ['House 42, Road 6, Dhanmondi', 'Dhaka 1205, Bangladesh'] },
  { icon: 'bi-telephone', title: 'Call us', links: [{ href: 'tel:+18001234567', text: '+1-800-123-4567' }, { href: 'tel:+8809611000000', text: '+880 9611 000 000' }] },
  { icon: 'bi-envelope', title: 'Email', links: [{ href: 'mailto:hello@apptheta.com', text: 'hello@apptheta.com' }, { href: 'mailto:support@apptheta.com', text: 'support@apptheta.com' }] },
  { icon: 'bi-clock', title: 'Opening hours', lines: ['Sat – Thu: 10am – 8pm', 'Friday: closed'] },
];

const faqs = [
  { id: 'faq1', q: 'How long does delivery take?', a: 'Inside Dhaka 1–2 days, elsewhere in Bangladesh 3–5 days, international 7–14 days.' },
  { id: 'faq2', q: 'Can I return an item?', a: 'Yes — unworn items with tags can be returned within 14 days of delivery.' },
  { id: 'faq3', q: 'Where is my order?', a: 'Use Track Order in the top bar with the ID from your confirmation email.' },
];

export default function Contact() {
  const [validated, setValidated] = useState(false);
  const toast = useToast();

  const onSubmit = (e) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    toast.success('Thanks — your message has been sent. We reply within one business day.');
    e.currentTarget.reset();
    setValidated(false);
  };

  return (
    <>
      <div className="page-title-bar">
        <div className="container">
          <h1>Contact Us</h1>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="row g-4 mb-5">
            {infoCards.map((c) => (
              <div className="col-lg-3 col-sm-6" key={c.title}>
                <div className="info-card">
                  <span className="info-icon">
                    <i className={`bi ${c.icon}`}></i>
                  </span>
                  <h6>{c.title}</h6>
                  {c.lines && (
                    <p>
                      {c.lines.map((l, i) => (
                        <span key={l}>
                          {l}
                          {i < c.lines.length - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  )}
                  {c.links && (
                    <p>
                      {c.links.map((l, i) => (
                        <span key={l.href}>
                          <a href={l.href}>{l.text}</a>
                          {i < c.links.length - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="row g-5 align-items-start">
            <div className="col-lg-7">
              <div className="panel">
                <h2 className="section-title">Send a message</h2>
                <p className="section-sub">Fill in the form and the team replies within one business day.</p>

                <form className={`row g-3 needs-validation${validated ? ' was-validated' : ''}`} noValidate onSubmit={onSubmit}>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="cName">
                      Full name
                    </label>
                    <input type="text" className="form-control" id="cName" placeholder="Your name" required />
                    <div className="invalid-feedback">Enter your name.</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="cEmail">
                      Email
                    </label>
                    <input type="email" className="form-control" id="cEmail" placeholder="you@example.com" required />
                    <div className="invalid-feedback">Enter a valid email address.</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="cPhone">
                      Phone
                    </label>
                    <input type="tel" className="form-control" id="cPhone" placeholder="+880 1XXX XXXXXX" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="cTopic">
                      Topic
                    </label>
                    <select className="form-select" id="cTopic" defaultValue="Order enquiry">
                      <option>Order enquiry</option>
                      <option>Return or exchange</option>
                      <option>Wholesale</option>
                      <option>Something else</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label" htmlFor="cMsg">
                      Message
                    </label>
                    <textarea className="form-control" id="cMsg" rows="5" placeholder="How can we help?" required></textarea>
                    <div className="invalid-feedback">Write a short message.</div>
                  </div>
                  <div className="col-12">
                    <button type="submit" className="btn btn-accent">
                      Send message
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="map-wrap">
                <iframe
                  title="Store location"
                  src="https://www.google.com/maps?q=Dhanmondi,Dhaka&output=embed"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
              <div className="panel mt-4">
                <h6 className="footer-title mb-3">Quick answers</h6>
                <div className="accordion accordion-flush faq" id="faq">
                  {faqs.map((f) => (
                    <div className="accordion-item" key={f.id}>
                      <h2 className="accordion-header">
                        <button
                          className="accordion-button collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#${f.id}`}
                        >
                          {f.q}
                        </button>
                      </h2>
                      <div id={f.id} className="accordion-collapse collapse" data-bs-parent="#faq">
                        <div className="accordion-body">{f.a}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
