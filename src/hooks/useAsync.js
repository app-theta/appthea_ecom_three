import { useCallback, useEffect, useRef, useState } from 'react';
import { parseApiError } from '../api/errors';

/**
 * Runs an async function on mount (and whenever `deps` change). `fn` is
 * called with an AbortSignal - forward it into the request (e.g. axios'
 * `{ signal }` config) to get real cancellation on unmount/param-change/
 * StrictMode's dev-only double-invoke; ignoring it is harmless, the request
 * just runs to completion with its result discarded as before.
 * `initial` is data the server already fetched for the first `deps`: it is shown
 * at once and that first request is skipped; later deps / reload() fetch as usual.
 * Returns { data, error, loading, reload, setData }.
 */
export function useAsync(fn, deps = [], { skip = false, initial = null } = {}) {
  const [data, setData] = useState(initial);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!skip && initial == null);
  const [nonce, setNonce] = useState(0);
  const alive = useRef(true);
  const seeded = useRef(initial != null);

  useEffect(() => () => { alive.current = false; }, []);

  useEffect(() => {
    if (skip) { setLoading(false); return; }
    if (seeded.current) { seeded.current = false; return; }
    let current = true;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    Promise.resolve()
      .then(() => fn(controller.signal))
      .then((res) => { if (current) setData(res); })
      .catch((e) => {
        if (e?.code === 'ERR_CANCELED' || e?.name === 'CanceledError' || e?.name === 'AbortError') return;
        if (current) setError(parseApiError(e));
      })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; controller.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce, skip]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { data, error, loading, reload, setData };
}

export default useAsync;
