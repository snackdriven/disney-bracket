import { lazy, Suspense, useEffect, useState } from 'react';
import { CoopRetiredScreen } from './components/CoopRetiredScreen';

// The retired-room gate must not import the App and initialize Firebase or saves.
const App = lazy(() => import('./App'));
const AdminPage = lazy(() => import('./components/AdminPage').then(module => ({ default: module.AdminPage })));

export function AppRouter() {
  const [href, setHref] = useState(() => window.location.href);
  useEffect(() => {
    const refresh = () => setHref(window.location.href);
    window.addEventListener('popstate', refresh);
    window.addEventListener('hashchange', refresh);
    return () => {
      window.removeEventListener('popstate', refresh);
      window.removeEventListener('hashchange', refresh);
    };
  }, []);

  const url = new URL(href);
  if (url.searchParams.get('admin') === '1') {
    return <Suspense fallback={<p role="status">Loading metadata admin…</p>}><AdminPage /></Suspense>;
  }
  if (url.searchParams.has('room')) {
    return <CoopRetiredScreen key={href} originalUrl={href} onContinue={nextUrl => {
      window.history.replaceState(null, '', nextUrl);
      setHref(nextUrl);
    }} />;
  }
  return <Suspense fallback={<p role="status">Loading bracket…</p>}><App /></Suspense>;
}
