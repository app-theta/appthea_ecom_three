import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext.jsx';
import { useBusiness } from '../context/BusinessContext.jsx';
import { useSeoMeta } from '../hooks/useSeoMeta.js';
import { useAsync } from '../hooks/useAsync.js';
import { content } from '../api/endpoints.js';
import { parseApiError } from '../api/errors.js';

const BLANK = { name: '', email: '', phone: '', subject: 'Order enquiry', message: '', website: '' };

export default function Contact() {
  useSeoMeta('contact');
  const toast = useToast();
  const { info } = useBusiness();
  const faqs = useAsync((signal) => content.faqs({ signal }), []);
  const [form, setForm] = useState(BLANK);
  const [fields, setFields] = useState({});
  const [busy, setBusy] = useState(false);

  const set = (name) => (e) => setForm({ ...form, [name]: e.target.value });
  const address = [info?.address, info?.area, info?.city].filter(Boolean).join(', ');
  const quick = (Array.isArray(faqs.data) ? faqs.data : []).slice(0, 4);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setFields({});
    try {
      await content.contact(form);
      toast.success('Thanks — your message has been sent. We will reply as soon as we can.');
      setForm(BLANK);
    } catch (err) {
      const parsed = parseApiError(err);
      setFields(parsed.fields);
      toast.error(parsed.message);
    } finally {
      setBusy(false);
    }
  };

  const invalid = (name) => (fields[name] ? ' is-invalid' : '');

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
            {address && (
              <div className="col-lg-4 col-sm-6">
                <div className="info-card">
                  <span className="info-icon"><i className="bi bi-geo-alt"></i></span>
                  <h6>Visit us</h6>
                  <p>{address}</p>
                </div>
              </div>
            )}
            {info?.phone && (
              <div className="col-lg-4 col-sm-6">
                <div className="info-card">
                  <span className="info-icon"><i className="bi bi-telephone"></i></span>
                  <h6>Call us</h6>
                  <p><a href={`tel:${info.phone}`}>{info.phone}</a></p>
                </div>
              </div>
            )}
            {info?.email && (
              <div className="col-lg-4 col-sm-6">
                <div className="info-card">
                  <span className="info-icon"><i className="bi bi-envelope"></i></span>
                  <h6>Email</h6>
                  <p><a href={`mailto:${info.email}`}>{info.email}</a></p>
                </div>
              </div>
            )}
          </div>

          <div className="row g-5 align-items-start">
            <div className="col-lg-7">
              <div className="panel">
                <h2 className="section-title">Send a message</h2>
                <p className="section-sub">Fill in the form and the team will get back to you.</p>

                <form className="row g-3 contact-form" noValidate onSubmit={onSubmit}>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="cName">Full name</label>
                    <input type="text" className={`form-control${invalid('name')}`} id="cName" placeholder="Your name" required maxLength={191} value={form.name} onChange={set('name')} />
                    {fields.name && <div className="invalid-feedback">{fields.name}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="cEmail">Email</label>
                    <input type="email" className={`form-control${invalid('email')}`} id="cEmail" placeholder="you@example.com" required maxLength={191} value={form.email} onChange={set('email')} />
                    {fields.email && <div className="invalid-feedback">{fields.email}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="cPhone">Phone</label>
                    <input type="tel" className={`form-control${invalid('phone')}`} id="cPhone" placeholder="+880 1XXX XXXXXX" maxLength={30} value={form.phone} onChange={set('phone')} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="cTopic">Topic</label>
                    <select className="form-select" id="cTopic" value={form.subject} onChange={set('subject')}>
                      <option>Order enquiry</option>
                      <option>Return or exchange</option>
                      <option>Wholesale</option>
                      <option>Something else</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label" htmlFor="cMsg">Message</label>
                    <textarea className={`form-control${invalid('message')}`} id="cMsg" rows="5" placeholder="How can we help?" required maxLength={2000} value={form.message} onChange={set('message')}></textarea>
                    {fields.message && <div className="invalid-feedback">{fields.message}</div>}
                  </div>
                  {/* honeypot: people never see or fill it, bots do - the API then refuses the message */}
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={set('website')}
                    style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />
                  <div className="col-12">
                    <button type="submit" className="btn btn-accent" disabled={busy}>{busy ? 'Sending…' : 'Send message'}</button>
                  </div>
                </form>
              </div>
            </div>

            <div className="col-lg-5">
              {address && (
                <div className="map-wrap">
                  <iframe
                    title="Store location"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              )}
              {quick.length > 0 && (
                <div className="panel mt-4">
                  <h6 className="side-title mb-3">Quick answers</h6>
                  <div className="accordion accordion-flush faq" id="faq">
                    {quick.map((f) => (
                      <div className="accordion-item" key={f.id}>
                        <h2 className="accordion-header">
                          <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#faq-${f.id}`}>
                            {f.question}
                          </button>
                        </h2>
                        <div id={`faq-${f.id}`} className="accordion-collapse collapse" data-bs-parent="#faq">
                          <div className="accordion-body">{f.answer}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link to="/faq" className="link-accent d-inline-block mt-3">All questions <i className="bi bi-arrow-right"></i></Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
