import { useEffect, useState } from 'react';

export default function LegalLayout({ title, intro, toc, lastUpdated, cta, children }) {
  const [activeId, setActiveId] = useState(toc[0]?.id);

  useEffect(() => {
    function spy() {
      const blocks = document.querySelectorAll('.legal-block');
      if (!blocks.length) return;
      const pos = window.scrollY + 160;
      let current = blocks[0].id;
      blocks.forEach((b) => {
        if (b.offsetTop <= pos) current = b.id;
      });
      setActiveId(current);
    }
    window.addEventListener('scroll', spy, { passive: true });
    spy();
    return () => window.removeEventListener('scroll', spy);
  }, []);

  return (
    <>
      <div className="page-title-bar">
        <div className="container">
          <h1>{title}</h1>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-4 order-lg-2">
              <div className="legal-toc">
                <h6 className="side-title">On this page</h6>
                <ul>
                  {toc.map((t) => (
                    <li key={t.id}>
                      <a href={`#${t.id}`} className={activeId === t.id ? 'is-active' : ''}>
                        {t.label}
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="legal-updated">
                  <i className="bi bi-clock-history"></i> Last updated {lastUpdated}
                </p>
              </div>
            </div>
            <div className="col-lg-8 order-lg-1">
              <div className="legal-body">
                <p className="legal-intro">{intro}</p>
                {children}
                <div className="legal-cta">
                  <p>{cta}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
