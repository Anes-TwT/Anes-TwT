import React, { useEffect, useState } from 'react';
import Tee from '../components/Tee.jsx';
import { BrandMarquee, Btn, Footer, useStore } from '../components/Shell.jsx';
import { Reveal, SplitText, useScrollSkew } from '../lib/motion.jsx';
import { money, PRODUCTS } from '../lib/catalog.js';

function Card({ product, index, total }) {
  const { go } = useStore();
  const [flipped, setFlipped] = useState(false);
  return (
    <article
      className="card"
      data-hot
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onClick={() => go(`/p/${product.slug}`)}
    >
      <div className="card-top">
        <span className="card-idx">{String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
        <div className="swatches">
          <span className="sw sw--black" title="Black" />
          <span className="sw sw--white" title="White" />
        </div>
      </div>

      <div className="card-stage">
        <Tee colour={index === 0 ? 'black' : 'white'} quote={product.quote}
             flipped={flipped} showFlip={false} tilt={false} />
      </div>

      <h3 className="card-name">{product.name}</h3>

      <div className="card-foot">
        <span className="card-price">{money(product.price)}</span>
        <span className="card-go">
          Inspect
          <svg width="15" height="10" viewBox="0 0 20 12" fill="none" stroke="currentColor"
               strokeWidth="1.8" aria-hidden="true"><path d="M0 6h18M13 1l5 5-5 5" /></svg>
        </span>
      </div>
    </article>
  );
}

export default function Home({ products = PRODUCTS, jumpTo }) {
  const { go } = useStore();
  const skewRef = useScrollSkew();

  useEffect(() => {
    if (!jumpTo) return;
    const node = document.getElementById(jumpTo);
    if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [jumpTo]);

  return (
    <div ref={skewRef} className="skewer">
      <section className="hero panel">
        <div className="shell hero-grid">
          <div>
            <h1 className="hero-wm">
              <span><em>Too</em></span>
              <span><em>Cold</em></span>
            </h1>
            <p className="hero-since">— Since 2026 —</p>
            <p className="hero-blurb">
              Two quotes, printed red and high on the back, on 240 gsm black and white.
              Nothing on the front but the mark. Drop 01 is live.
            </p>
            <div className="hero-cta">
              <Btn solid onClick={() => go('/', 'drop')}>See the drop</Btn>
              <Btn onClick={() => go('/p/more-risk-more-rizq')}>Inspect a piece</Btn>
            </div>
          </div>

          <div className="hero-stage">
            <div className="hero-glow" aria-hidden="true" />
            <Tee colour="black" quote={products[0].quote} />
          </div>
        </div>

        <div style={{ marginTop: 'clamp(56px,8vw,110px)' }}>
          <BrandMarquee />
        </div>
      </section>

      <section className="sec panel" id="drop">
        <div className="shell">
          <div className="sec-head">
            <div>
              <span className="meta">Drop 01 · Two pieces · Shipping worldwide</span>
              <h2 className="sec-title"><SplitText text="The Drop" /></h2>
            </div>
            <span className="meta">Hover a piece to turn it around</span>
          </div>
        </div>

        <Reveal variant="reveal" className="shell">
          <div className="grid">
            {products.map((p, i) => <Card key={p.slug} product={p} index={i} total={products.length} />)}
          </div>
        </Reveal>
      </section>

      <section className="sec panel panel--paper" id="creed">
        <div className="shell">
          <div className="sec-head">
            <div>
              <span className="meta">Why these words</span>
              <h2 className="sec-title">The <em>Creed</em></h2>
            </div>
          </div>

          <Reveal className="manif">
            <p>
              Rizq is provision. It is written for you before you arrive, and it still
              does not walk to your door. You go out in the cold and meet it.
            </p>
            <p>
              That is the whole brand. Two lines of it fit on a back. The rest is
              240 gsm cotton and a red discharge print that will not crack in the wash.
            </p>
          </Reveal>

          <Reveal variant="reveal-clip">
            <p className="pull">More risk,<br />more rizq.</p>
          </Reveal>

          <Reveal className="manif">
            <p>
              The second piece says the thing you should not have to say. Four lines,
              stacked and centred, printed the size they deserve.
            </p>
          </Reveal>
        </div>
      </section>

      <BrandMarquee reverse />

      <section className="sec panel">
        <div className="shell center">
          <h2 className="sec-title" style={{ marginBottom: 30 }}>
            <SplitText text="Cold enough?" />
          </h2>
          <Btn solid onClick={() => go('/', 'drop')}>Take one</Btn>
        </div>
      </section>

      <Footer />
    </div>
  );
}
