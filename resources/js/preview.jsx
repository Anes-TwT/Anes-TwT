/*
 * Standalone entry. Same pages and components as the Inertia build, but the
 * router and the bag run in the browser so the front end can be inspected
 * without a PHP process behind it. Laravel's routes/web.php mirrors these paths.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import Home from './Pages/Home.jsx';
import Product from './Pages/Product.jsx';
import Cart from './Pages/Cart.jsx';
import Checkout from './Pages/Checkout.jsx';
import Confirmation from './Pages/Confirmation.jsx';

import { CartDrawer, Nav, Store } from './components/Shell.jsx';
import { Cursor, Intro, ScrollProgress, Toast, reduced, useArmAnimations } from './lib/motion.jsx';
import { bySlug, lineKey } from './lib/catalog.js';

import '../css/app.css';

const KEY = 'toocold.bag.v1';

const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
};
const save = (items) => {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* private mode */ }
};

function parse(path) {
  if (path.startsWith('/p/')) return { name: 'product', slug: path.slice(3) };
  if (path === '/cart') return { name: 'cart' };
  if (path === '/checkout') return { name: 'checkout' };
  if (path.startsWith('/order/')) return { name: 'order', reference: path.slice(7) };
  return { name: 'home' };
}

function App() {
  useArmAnimations();

  const [route, setRoute] = useState(() => parse('/'));
  const [jumpTo, setJumpTo] = useState(null);
  const [items, setItems] = useState(load);
  const [open, setOpen] = useState(false);
  const [curtain, setCurtain] = useState('');
  const [toast, setToast] = useState('');
  const [introOver, setIntroOver] = useState(false);

  useEffect(() => save(items), [items]);

  const go = useCallback((path, hash) => {
    const next = parse(path);
    const sameHome = next.name === 'home' && route.name === 'home';

    if (sameHome && hash) {
      const node = document.getElementById(hash);
      if (node) node.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth' });
      return;
    }

    const swap = () => {
      setRoute(next);
      setJumpTo(hash || null);
      window.scrollTo(0, 0);
    };

    if (reduced()) { swap(); return; }
    setCurtain('in');
    setTimeout(() => { swap(); setCurtain('out'); }, 500);
    setTimeout(() => setCurtain(''), 1050);
  }, [route.name]);

  const add = useCallback(({ slug, colour, size, qty, price }) => {
    const key = lineKey(slug, colour, size);
    setItems((list) => {
      const found = list.find((i) => i.key === key);
      if (found) {
        return list.map((i) => (i.key === key ? { ...i, qty: Math.min(10, i.qty + qty) } : i));
      }
      return [...list, { key, slug, colour, size, qty, price }];
    });
    setToast(`${bySlug(slug).name} · ${size} added`);
  }, []);

  const setQty = useCallback((key, qty) => {
    setItems((list) => (qty <= 0
      ? list.filter((i) => i.key !== key)
      : list.map((i) => (i.key === key ? { ...i, qty: Math.min(10, qty) } : i))));
  }, []);

  const remove = useCallback((key) => setItems((l) => l.filter((i) => i.key !== key)), []);
  const clear = useCallback(() => setItems([]), []);

  const store = useMemo(
    () => ({ items, add, setQty, remove, clear, open, setOpen, go }),
    [items, add, setQty, remove, clear, open, go]
  );

  let page;
  if (route.name === 'product') page = <Product slug={route.slug} />;
  else if (route.name === 'cart') page = <Cart />;
  else if (route.name === 'checkout') page = <Checkout />;
  else if (route.name === 'order') page = <Confirmation reference={route.reference} />;
  else page = <Home jumpTo={jumpTo} />;

  return (
    <Store.Provider value={store}>
      {!introOver && <Intro onDone={() => setIntroOver(true)} />}
      <Cursor />
      <ScrollProgress />
      <div className={`curtain${curtain ? ` ${curtain}` : ''}`} aria-hidden="true" />
      <Nav />
      <main>{page}</main>
      <CartDrawer />
      <Toast message={toast} />
    </Store.Provider>
  );
}

createRoot(document.getElementById('app')).render(<App />);
