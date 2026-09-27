import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const CompareContext = createContext(null);
const STORAGE_KEY = 'apptheta_compare';
// side by side stops being readable beyond this
export const COMPARE_LIMIT = 4;

function read() {
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(list) ? list.filter((item) => item && item.id && item.slug) : [];
  } catch {
    return [];
  }
}

/**
 * The products picked for comparison. Kept in the browser (no login needed, nothing on the
 * server) as { id, slug, name } - the compare page loads the live product for each slug.
 */
export function CompareProvider({ children }) {
  const [items, setItems] = useState(read);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* private mode */ }
  }, [items]);

  // another tab added or removed something
  useEffect(() => {
    const onStorage = (e) => { if (e.key === STORAGE_KEY) setItems(read()); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const has = useCallback((id) => items.some((item) => Number(item.id) === Number(id)), [items]);

  /** Adds or removes; returns 'added' | 'removed' | 'full'. */
  const toggle = useCallback((product) => {
    if (items.some((item) => Number(item.id) === Number(product.id))) {
      setItems((list) => list.filter((item) => Number(item.id) !== Number(product.id)));
      return 'removed';
    }
    if (items.length >= COMPARE_LIMIT) return 'full';
    setItems((list) => [...list, { id: product.id, slug: product.slug, name: product.name }]);
    return 'added';
  }, [items]);

  const remove = useCallback((id) => setItems((list) => list.filter((item) => Number(item.id) !== Number(id))), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({ items, count: items.length, has, toggle, remove, clear }),
    [items, has, toggle, remove, clear],
  );
  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used inside CompareProvider');
  return ctx;
}

/** The toast text for a toggle() result. */
export function compareMessage(result, name) {
  if (result === 'added') return `${name} added to compare`;
  if (result === 'removed') return `${name} removed from compare`;
  return `You can compare up to ${COMPARE_LIMIT} products - remove one first`;
}
