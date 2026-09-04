import React from 'react';
import { TeeFace } from '../components/Tee.jsx';
import { Btn, Footer, useStore } from '../components/Shell.jsx';
import { bySlug, cartTotals, money } from '../lib/catalog.js';

export default function Cart() {
  const { items, setQty, remove, go } = useStore();
  const { subtotal, shipping, total } = cartTotals(items);

  return (
    <>
      <section className="pdp panel">
        <div className="shell">
          <span className="meta">Bag</span>
          <h1 className="pdp-title" style={{ marginBottom: 44 }}>Your bag</h1>

          {items.length === 0 ? (
            <div className="empty" style={{ textAlign: 'left', padding: '10px 0 70px' }}>
              <h4>Nothing in here yet</h4>
              <p className="meta" style={{ marginBottom: 26 }}>Drop 01 has two pieces</p>
              <Btn solid onClick={() => go('/', 'drop')}>See the drop</Btn>
            </div>
          ) : (
            <div className="co-grid">
              <div>
                {items.map((item) => {
                  const product = item.product || bySlug(item.slug);
                  return (
                    <div className="line" key={item.key}>
                      <div className={`line-thumb${item.colour === 'white' ? ' on-white' : ''}`}>
                        <TeeFace colour={item.colour} side="back" quote={product.quote}
                                 id={`c-${item.key}`} />
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
                        <button type="button" className="line-rm"
                                onClick={() => remove(item.key)}>Remove</button>
                      </div>
                      <div className="line-price">{money(item.price * item.qty)}</div>
                    </div>
                  );
                })}
              </div>

              <div className="summary">
                <span className="meta">Summary</span>
                <div className="totals" style={{ marginTop: 22 }}>
                  <div className="total-row"><span>Subtotal</span><span>{money(subtotal)}</span></div>
                  <div className="total-row">
                    <span>Shipping</span><span>{shipping === 0 ? 'Free' : money(shipping)}</span>
                  </div>
                  <div className="total-row grand"><span>Total</span><span>{money(total)}</span></div>
                </div>
                <Btn solid wide onClick={() => go('/checkout')}>Checkout</Btn>
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
