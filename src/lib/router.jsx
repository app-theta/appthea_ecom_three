'use client';

/**
 * The slice of react-router-dom this storefront was written against, on top of
 * Next.js navigation - pages and components keep their `to=`, `useNavigate()`,
 * `useParams()` code unchanged.
 *
 * Router `state` (Login's 'from' / 'notice') has no Next.js equivalent, so it
 * is kept here in memory for the one navigation it was passed with.
 */
import { forwardRef, useCallback, useEffect, useMemo } from 'react';
import NextLink from 'next/link';
import {
  useParams as useNextParams,
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
} from 'next/navigation';

let pending = null; // { path, state } handed over by navigate(to, { state })

const pathOf = (to) => String(to).split(/[?#]/)[0];

// react-router resolved a bare "user/wishlist" from the root layout route; as an href it would
// resolve against the current URL (/product/x/user/wishlist), so such links are made absolute here
const absolutePath = (to) => (typeof to === 'string' && !/^([a-z][a-z+.-]*:|\/|#|\?)/i.test(to) ? '/' + to : to);

function setPending(to, state) {
  pending = state === undefined ? null : { path: pathOf(to), state };
}

export const Link = forwardRef(function Link({ to, replace, state, onClick, ...rest }, ref) {
  const href = absolutePath(to);
  return (
    <NextLink
      ref={ref}
      href={href}
      replace={replace}
      onClick={(e) => { setPending(href, state); onClick?.(e); }}
      {...rest}
    />
  );
});

/** Adds `active` (and aria-current) when the link's path is the current one. */
export const NavLink = forwardRef(function NavLink({ to, end = false, className, style, children, ...rest }, ref) {
  const pathname = usePathname();
  const target = pathOf(absolutePath(to));
  const isActive = pathname === target || (!end && target !== "/" && pathname.startsWith(target + '/'));
  const cls = typeof className === "function" ? className({ isActive }) : [className, isActive ? 'active' : ''].filter(Boolean).join(' ');
  return (
    <Link
      ref={ref}
      to={to}
      className={cls || undefined}
      style={typeof style === "function" ? style({ isActive }) : style}
      aria-current={isActive ? 'page' : undefined}
      {...rest}
    >
      {typeof children === "function" ? children({ isActive }) : children}
    </Link>
  );
});

export function useNavigate() {
  const router = useRouter();
  return useCallback((to, { replace = false, state } = {}) => {
    if (typeof to === "number") { router.back(); return; }
    const href = absolutePath(to);
    setPending(href, state);
    replace ? router.replace(href) : router.push(href);
  }, [router]);
}

export function Navigate({ to, replace = false, state }) {
  const navigate = useNavigate();
  useEffect(() => { navigate(to, { replace, state }); }, [navigate, to, replace, state]);
  return null;
}

/** pathname + the state the last navigation carried; `search` is read on demand (handlers only). */
export function useLocation() {
  const pathname = usePathname();
  return useMemo(() => ({
    pathname,
    state: pending && pending.path === pathname ? pending.state : null,
    get search() { return typeof window === "undefined" ? '' : window.location.search; },
    get hash() { return typeof window === "undefined" ? '' : window.location.hash; },
  }), [pathname]);
}

export function useParams() {
  return useNextParams() || {};
}

/** [URLSearchParams, setParams(next, { replace })] like react-router's. */
export function useSearchParams() {
  const params = useNextSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const setParams = useCallback((next, { replace = false } = {}) => {
    const qs = new URLSearchParams(next).toString();
    const href = qs ? `${pathname}?${qs}` : pathname;
    replace ? router.replace(href, { scroll: false }) : router.push(href, { scroll: false });
  }, [router, pathname]);
  return [params, setParams];
}
