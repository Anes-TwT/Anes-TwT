/*
 * Inertia entry for the Laravel build. Page components are shared verbatim
 * with preview.jsx; only the router and the bag differ — here they go through
 * Inertia to CartController and CheckoutController.
 */
import React, { useCallback, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp, router, usePage } from '@inertiajs/react';

import { CartDrawer, Nav, Store } from './components/Shell.jsx';
import { Cursor, Intro, ScrollProgress, Toast, useArmAnimations, useSmoothScroll } from './lib/motion.jsx';
import { bySlug, lineKey } from './lib/catalog.js';

import '../css/app.css';

function Layout({ children }) {
  useArmAnimations();
  useSmoothScroll();
  const { props } = usePage();
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [introOver, setIntroOver] = useState(false);

  const items = props.cart || [];

  const go = useCallback((path, hash) => {
    router.visit(hash ? `${path}#${hash}` : path, { preserveScroll: false });
  }, []);

  const add = useCallback(({ slug, colour, size, qty, price }) => {
    router.post('/cart', { slug, colour, size, qty }, {
      preserveScroll: true,
      onSuccess: () => setToast(`${bySlug(slug).name} · ${size} added`),
    });
    void price; void lineKey;
  }, []);

  const setQty = useCallback((key, qty) => {
    router.patch(`/cart/${encodeURIComponent(key)}`, { qty }, { preserveScroll: true });
  }, []);

  const remove = useCallback((key) => {
    router.delete(`/cart/${encodeURIComponent(key)}`, { preserveScroll: true });
  }, []);

  const clear = useCallback(() => router.delete('/cart', { preserveScroll: true }), []);

  const store = useMemo(
    () => ({ items, add, setQty, remove, clear, open, setOpen, go }),
    [items, add, setQty, remove, clear, open, go]
  );

  return (
    <Store.Provider value={store}>
      {!introOver && <Intro onDone={() => setIntroOver(true)} />}
      <Cursor />
      <ScrollProgress />
      <Nav />
      <main>{children}</main>
      <CartDrawer />
      <Toast message={toast} />
    </Store.Provider>
  );
}

createInertiaApp({
  title: (title) => (title ? `${title} · TOO COLD` : 'TOO COLD — Since 2026'),
  resolve: (name) => {
    const pages = import.meta.glob('./Pages/*.jsx', { eager: true });
    const page = pages[`./Pages/${name}.jsx`];
    page.default.layout = page.default.layout || ((children) => <Layout>{children}</Layout>);
    return page;
  },
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />);
  },
});
