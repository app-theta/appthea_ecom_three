import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  const push = useCallback((message, variant = 'dark') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, variant }]);
  }, []);

  const value = {
    push,
    success: (msg) => push(msg, 'success'),
    error: (msg) => push(msg, 'danger'),
    info: (msg) => push(msg, 'dark'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1200 }}>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDone={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDone }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.bootstrap) {
      const t = setTimeout(onDone, 3000);
      return () => clearTimeout(t);
    }
    const instance = window.bootstrap.Toast.getOrCreateInstance(el, { delay: 3000 });
    instance.show();
    el.addEventListener('hidden.bs.toast', onDone);
    return () => el.removeEventListener('hidden.bs.toast', onDone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={ref} className={`toast align-items-center text-white bg-${toast.variant} border-0`} role="alert" aria-live="assertive" aria-atomic="true">
      <div className="d-flex">
        <div className="toast-body">{toast.message}</div>
        <button type="button" className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
