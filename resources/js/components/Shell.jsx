import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { TeeFace } from './Tee.jsx';
import { Marquee, useMagnetic } from '../lib/motion.jsx';
import { bySlug, cartTotals, countItems, money } from '../lib/catalog.js';

export const Store = createContext(null);
export const useStore = () => useContext(Store);

export function Mark({ onClick }) {
  return (
    <div className="nav-mark" onClick={onClick} data-hot role="link" tabIndex={0}
         onKeyDown={(e) => { if (e.key === 'Enter') onClick(); }}>
      <b>Too Cold</b>
      <i>— Since 2026 —</i>
    </div>
  );
}

export function Nav() {
  const { go, items, open, setOpen } = useStore();
  const [hidden, setHidden] = useState(false);
  const [bump, setBump] = useState(false);
  const count = countItems(items);
  const seen = useRef(count);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > 220 && y > last);
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (count !== seen.current) {
      seen.current = count;
      setBump(true);
      const t = setTimeout(() => setBump(false), 480);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [count]);

  return (
    <header className={`nav${hidden && !open ? ' up' : ''}`}>
      <Mark onClick={() => go('/')} />
      <nav className="nav-links">
        <a href="/" onClick={(e) => { e.preventDefault(); go('/'); }}>Home</a>
        <a href="/#drop" onClick={(e) => { e.preventDefault(); go('/', 'drop'); }}>The Drop</a>
        <a href="/#creed" onClick={(e) => { e.preventDefault(); go('/', 'creed'); }}>Creed</a>
        <a href="/cart" onClick={(e) => { e.preventDefault(); go('/cart'); }}>Cart</a>
      </nav>
      <button type="button" className="nav-cart" data-hot onClick={() => setOpen(true)}>
        Bag <span className={`n${bump ? ' bump' : ''}`}>{count}</span>
      </button>
    </header>
  );
}

function Line({ item }) {
  const { setQty, remove } = useStore();
  const product = item.product || bySlug(item.slug);
  return (
    <div className="line">
      <div className={`line-thumb${item.colour === 'white' ? ' on-white' : ''}`}>
        <TeeFace colour={item.colour} side="back" quote={product.quote} id={`l-${item.key}`} />
      </div>
      <div>
        <h4 className="line-name">{product.name}</h4>
        <div className="line-meta">{item.colour} · Size {item.size}</div>
        <div className="line-ctl">
          <button type="button" onClick={() => setQty(item.key, item.qty - 1)}
                  aria-label="Decrease quantity">–</button>
          <span>{item.qty}</span>
          <button type="button" onClick={() => setQty(item.key, item.qty + 1)}
                  aria-label="Increase quantity">+</button>
        </div>
        <button type="button" className="line-rm" onClick={() => remove(item.key)}>Remove</button>
      </div>
      <div className="line-price">{money(item.price * item.qty)}</div>
    </div>
  );
}

export function CartDrawer() {
  const { items, open, setOpen, go } = useStore();
  const { subtotal, shipping, total } = cartTotals(items);

  useEffect(() => {
    document.body.classList.toggle('locked', open);
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', esc);
    return () => { window.removeEventListener('keydown', esc); document.body.classList.remove('locked'); };
  }, [open, setOpen]);

  return (
    <>
      <div className={`scrim${open ? ' on' : ''}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <aside className={`drawer${open ? ' on' : ''}`} aria-label="Shopping bag" aria-hidden={!open}>
        <div className="drawer-head">
          <h3 className="drawer-title">Your bag</h3>
          <button type="button" className="x" onClick={() => setOpen(false)} aria-label="Close bag">
            <svg width="19" height="19" viewBox="0 0 24 24" stroke="currentColor"
                 strokeWidth="2.2" fill="none"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="empty">
              <h4>Nothing yet</h4>
              <p className="meta">Two pieces are live</p>
            </div>
          ) : items.map((item) => <Line key={item.key} item={item} />)}
        </div>

        {items.length > 0 && (
          <div className="drawer-foot">
            <div className="totals">
              <div className="total-row"><span>Subtotal</span><span>{money(subtotal)}</span></div>
              <div className="total-row">
                <span>Shipping</span><span>{shipping === 0 ? 'Free' : money(shipping)}</span>
              </div>
              <div className="total-row grand"><span>Total</span><span>{money(total)}</span></div>
            </div>
            <button type="button" className="btn btn--solid btn--wide" data-hot
                    onClick={() => { setOpen(false); go('/checkout'); }}>
              <span>Checkout</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

export function Btn({ children, solid, dark, wide, onClick, type = 'button', disabled }) {
  const ref = useMagnetic(0.22);
  return (
    <button ref={ref} type={type} disabled={disabled} onClick={onClick} data-hot
            className={`btn${solid ? ' btn--solid' : ''}${dark ? ' btn--dark' : ''}${wide ? ' btn--wide' : ''}`}>
      <span>{children}</span>
    </button>
  );
}

export function Footer() {
  const { go } = useStore();
  return (
    <footer className="foot">
      <div className="shell">
        <div className="foot-grid">
          <div>
            <h2 className="foot-mark">Too Cold</h2>
            <div className="foot-since">— Since 2026 —</div>
          </div>
          <div className="foot-cols">
            <div className="foot-col">
              <h5>Shop</h5>
              <a href="/p/more-risk-more-rizq" onClick={(e) => { e.preventDefault(); go('/p/more-risk-more-rizq'); }}>More Risk More Rizq</a>
              <a href="/p/dirty-hands" onClick={(e) => { e.preventDefault(); go('/p/dirty-hands'); }}>Don&apos;t Touch My Soul</a>
              <a href="/cart" onClick={(e) => { e.preventDefault(); go('/cart'); }}>Bag</a>
            </div>
            <div className="foot-col">
              <h5>Info</h5>
              <a href="#sizing" onClick={(e) => e.preventDefault()}>Sizing</a>
              <a href="#shipping" onClick={(e) => e.preventDefault()}>Shipping</a>
              <a href="#returns" onClick={(e) => e.preventDefault()}>Returns</a>
            </div>
          </div>
        </div>
        <div className="foot-btm">
          <span className="meta">© 2026 Too Cold</span>
          <span className="meta">Printed in Portugal</span>
        </div>
      </div>
    </footer>
  );
}

export function BrandMarquee({ reverse }) {
  return <Marquee reverse={reverse} items={['Too Cold', 'Since 2026', 'More Risk More Rizq', 'Drop 01']} />;
}
