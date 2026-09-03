import { useState } from 'react';
import DashLayout from '../../components/user/DashLayout.jsx';
import { useToast } from '../../context/ToastContext.jsx';

const initialTickets = [
  { id: '#TCK-2214', subject: 'Delay in delivery for #APT-10098', date: 'Jul 12, 2026', status: 'Closed', badge: 'is-done' },
  { id: '#TCK-2298', subject: 'Wrong item colour received', date: 'Aug 05, 2026', status: 'Answered', badge: 'is-active' },
];

export default function SupportTicket() {
  const [tickets, setTickets] = useState(initialTickets);
  const [validated, setValidated] = useState(false);
  const toast = useToast();

  const onSubmit = (e) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    const form = e.currentTarget;
    const subject = form.tkSubject.value;
    setTickets((prev) => [
      { id: `#TCK-${2300 + prev.length}`, subject, date: 'Today', status: 'Open', badge: 'is-pending' },
      ...prev,
    ]);
    toast.success('Your ticket has been submitted');
    form.reset();
    setValidated(false);
  };

  return (
    <DashLayout title="Support Ticket">
      <div className="row g-4">
        <div className="col-lg-7">
          <div className="panel dash-table-panel">
            <div className="dash-block-head">
              <h5>Your Tickets</h5>
            </div>
            <div className="table-responsive">
              <table className="table dash-table">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.id}>
                      <td data-label="Ticket">{t.id}</td>
                      <td data-label="Subject">{t.subject}</td>
                      <td data-label="Date">{t.date}</td>
                      <td data-label="Status">
                        <span className={`dash-badge ${t.badge}`}>{t.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="panel">
            <h6 className="footer-title mb-3">Open a New Ticket</h6>
            <form className={`row g-3 needs-validation${validated ? ' was-validated' : ''}`} noValidate onSubmit={onSubmit}>
              <div className="col-12">
                <label className="form-label" htmlFor="tkSubject">
                  Subject
                </label>
                <input type="text" name="tkSubject" className="form-control" id="tkSubject" placeholder="Briefly describe your issue" required />
                <div className="invalid-feedback">Enter a subject.</div>
              </div>
              <div className="col-12">
                <label className="form-label" htmlFor="tkOrder">
                  Related order (optional)
                </label>
                <input type="text" className="form-control" id="tkOrder" placeholder="e.g. APT-10482" />
              </div>
              <div className="col-12">
                <label className="form-label" htmlFor="tkMsg">
                  Message
                </label>
                <textarea className="form-control" id="tkMsg" rows="4" placeholder="How can we help?" required></textarea>
                <div className="invalid-feedback">Write a short message.</div>
              </div>
              <div className="col-12">
                <button type="submit" className="btn btn-accent w-100">
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashLayout>
  );
}
