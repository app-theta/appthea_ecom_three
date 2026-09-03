import { createContext, useContext, useState } from 'react';

const QuickViewContext = createContext(null);

export function QuickViewProvider({ children }) {
  const [product, setProduct] = useState(null);

  const openQuickView = (p) => setProduct(p);

  return (
    <QuickViewContext.Provider value={{ product, openQuickView }}>
      {children}
    </QuickViewContext.Provider>
  );
}

export function useQuickView() {
  const ctx = useContext(QuickViewContext);
  if (!ctx) throw new Error('useQuickView must be used within a QuickViewProvider');
  return ctx;
}
