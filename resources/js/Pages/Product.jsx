import React, { useMemo, useState } from 'react';
import Tee from '../components/Tee.jsx';
import { Btn, Footer, useStore } from '../components/Shell.jsx';
import { Reveal } from '../lib/motion.jsx';
import { isSoldOut, money, PRODUCTS, SIZES } from '../lib/catalog.js';

function Accordion({ product }) {
  const [open, setOpen] = useState('spec');
  const panels = [
    {
      id: 'spec',
      label: 'Specification',
      body: (
        <div>
          {Object.entries(product.spec).map(([k, v]) => (
            <div className="spec-row" key={k}><span>{k}</span><span>{v}</span></div>
          ))}
        </div>
      ),
    },
    {
      id: 'print',
      label: 'The print',
      body: (
        <p style={{ margin: 0 }}>
          Red discharge ink, centred on the upper back so it clears a jacket collar.
          Discharge lifts the dye out of the cotton instead of sitting on top of it,
          so the print stays soft and will not crack along a fold.
        </p>
      ),
    },
    {
      id: 'ship',
      label: 'Shipping & returns',
      body: (
        <p style={{ margin: 0 }}>
          Free shipping over €90. Dispatched within two working days from Portugal.
          Thirty days to return anything unworn, with the tag on.
        </p>
      ),
    },
  ];

  return (
    <div className="acc">
      {panels.map((p) => (
        <div className={`acc-item${open === p.id ? ' open' : ''}`} key={p.id}>
          <button type="button" className="acc-btn" data-hot
                  onClick={() => setOpen(open === p.id ? '' : p.id)}
                  aria-expanded={open === p.id}>
            {p.label}<i>+</i>
          </button>
          <div className="acc-body"><div className="acc-inner">{p.body}</div></div>
        </div>
      ))}
    </div>
  );
}

export default function Product({ product: fromServer, others: othersFromServer, slug }) {
  const product = useMemo(
    () => fromServer || PRODUCTS.find((p) => p.slug === slug) || PRODUCTS[0],
    [fromServer, slug]
  );
  const others = useMemo(
    () => othersFromServer || PRODUCTS.filter((p) => p.slug !== product.slug),
    [othersFromServer, product.slug]
  );
  const { add, go, setOpen } = useStore();
  const [colour, setColour] = useState('black');
  const [size, setSize] = useState('M');
  const [qty, setQty] = useState(1);
  const [flipped, setFlipped] = useState(true);

  const unavailable = isSoldOut(product, colour, size);

  const addToBag = (thenCheckout) => {
    if (unavailable) return;
    add({ slug: product.slug, colour, size, qty, price: product.price });
    if (thenCheckout) go('/checkout'); else setOpen(true);
  };

  return (
    <>
      <section className="pdp panel">
        <div className="shell">
          <div className="pdp-crumb">
            <a href="/" className="meta" onClick={(e) => { e.preventDefault(); go('/'); }}>Home</a>
            <span className="meta" style={{ color: 'var(--red)' }}>/</span>
            <span className="meta">Drop 01</span>
          </div>

          <div className="pdp-grid">
            <div className={`pdp-stage${colour === 'white' ? ' on-white' : ''}`}>
              <Tee colour={colour} quote={product.quote} flipped={flipped} onFlip={setFlipped} />
            </div>

            <div>
              <span className="meta">Drop 01 · {product.slug.toUpperCase()}</span>
              <h1 className="pdp-title">{product.name}</h1>
              <div className="pdp-price mono">{money(product.price)}</div>

              <blockquote className="pdp-quote">
                {product.quote.map((l, i) => <div key={i}>{l}</div>)}
              </blockquote>

              <p className="pdp-blurb">{product.blurb}</p>

              <div className="opt">
                <div className="opt-k">
                  <span className="meta">Colour</span>
                  <span className="meta" style={{ color: 'var(--paper)' }}>{colour}</span>
                </div>
                <div className="opt-row">
                  {product.colours.map((c) => (
                    <button key={c} type="button" data-hot
                            className={`chip chip--col${colour === c ? ' on' : ''}`}
                            onClick={() => setColour(c)}>
                      <span>
                        <i style={{ background: c === 'black' ? '#0B0B0C' : '#fff' }} />
                        {c}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="opt">
                <div className="opt-k">
                  <span className="meta">Size</span>
                  <span className="meta" style={{ color: 'var(--paper)' }}>
                    {unavailable ? 'Sold out' : size}
                  </span>
                </div>
                <div className="opt-row">
                  {SIZES.map((s) => {
                    const gone = isSoldOut(product, colour, s);
                    return (
                      <button key={s} type="button" data-hot disabled={gone}
                              className={`chip${size === s ? ' on' : ''}${gone ? ' sold' : ''}`}
                              onClick={() => !gone && setSize(s)}>
                        <span>{s}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="opt">
                <div className="opt-k"><span className="meta">Quantity</span></div>
                <div className="qty">
                  <button type="button" onClick={() => setQty(Math.max(1, qty - 1))}
                          aria-label="Decrease quantity">–</button>
                  <span>{qty}</span>
                  <button type="button" onClick={() => setQty(Math.min(10, qty + 1))}
                          aria-label="Increase quantity">+</button>
                </div>
              </div>

              <div className="pdp-actions">
                <Btn solid disabled={unavailable} onClick={() => addToBag(false)}>
                  {unavailable ? 'Sold out' : `Add to bag — ${money(product.price * qty)}`}
                </Btn>
                <Btn disabled={unavailable} onClick={() => addToBag(true)}>Buy now</Btn>
              </div>

              <Accordion product={product} />
            </div>
          </div>

          <Reveal className="sec" style={{ paddingBottom: 0 }}>
            <div className="sec-head">
              <div>
                <span className="meta">Also in Drop 01</span>
                <h2 className="sec-title">The other one</h2>
              </div>
            </div>
            {others.map((p) => (
              <div key={p.slug} className="pdp-grid" style={{ alignItems: 'center' }}>
                <div className="pdp-stage" style={{ position: 'relative', top: 0 }}>
                  <Tee colour="white" quote={p.quote} tilt={false} />
                </div>
                <div>
                  <h3 className="pdp-title" style={{ fontSize: 'clamp(2rem,5vw,3.4rem)' }}>{p.name}</h3>
                  <div className="pdp-price mono">{money(p.price)}</div>
                  <div className="pdp-actions">
                    <Btn onClick={() => { go(`/p/${p.slug}`); setFlipped(true); }}>Inspect</Btn>
                  </div>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  );
}
