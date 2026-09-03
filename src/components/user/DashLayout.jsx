import DashSidebar from './DashSidebar.jsx';

export default function DashLayout({ title, children }) {
  return (
    <>
      <div className="page-title-bar">
        <div className="container">
          <h1>{title}</h1>
        </div>
      </div>

      <section className="section dash-section">
        <div className="container">
          <div className="dash-layout">
            <DashSidebar />
            <div className="dash-content">{children}</div>
          </div>
        </div>
      </section>
    </>
  );
}
