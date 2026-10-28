// Minimal hash router: works on GitHub Pages without server rewrites.
// Logical routes like /lesson/abc appear as /kidgem/#/lesson/abc.
import { useEffect, useState, type AnchorHTMLAttributes, type ReactNode } from 'react';

export interface Route {
  path: string;
  segments: string[];
  query: URLSearchParams;
}

function parse(): Route {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const [p, q = ''] = raw.split('?');
  const path = p.startsWith('/') ? p : `/${p}`;
  return { path, segments: path.split('/').filter(Boolean).map(decodeURIComponent), query: new URLSearchParams(q) };
}

export function useRoute(): Route {
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const on = () => setRoute(parse());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

export function navigate(to: string) {
  const target = `#${to}`;
  if (window.location.hash === target) window.dispatchEvent(new HashChangeEvent('hashchange'));
  else window.location.hash = to;
}

export function href(to: string) {
  return `#${to}`;
}

export function Link({ to, children, ...rest }: { to: string; children: ReactNode } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a href={href(to)} {...rest}>
      {children}
    </a>
  );
}
