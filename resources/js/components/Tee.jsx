import React, { useCallback, useEffect, useRef, useState } from 'react';

/*
 * The garment. Drawn rather than photographed so the print can be placed
 * exactly: red, centred on x=200, sitting high on the back panel.
 *
 * Two faces on one preserve-3d stage. The back face is pre-rotated 180deg and
 * both faces hide their backface, so the flip is a single uninterrupted
 * rotateY on the parent — no cross-fade, no repaint mid-turn.
 */

const BODY = [
  'M 162 46',
  'C 149 49 137 54 127 61',
  'L 58 99',
  'C 50 103 47 112 51 120',
  'L 74 170',
  'C 78 179 88 182 96 178',
  'L 120 166',
  'L 120 406',
  'C 120 419 128 427 141 427',
  'L 259 427',
  'C 272 427 280 419 280 406',
  'L 280 166',
  'L 304 178',
  'C 312 182 322 179 326 170',
  'L 349 120',
  'C 353 112 350 103 342 99',
  'L 273 61',
  'C 263 54 251 49 238 46',
  'C 233 74 218 88 200 88',
  'C 182 88 167 74 162 46',
  'Z',
].join(' ');

const COLLAR = 'M 166 52 C 172 76 186 85 200 85 C 214 85 228 76 234 52';

const SKIN = {
  black: { cloth: '#111114', seam: 'rgba(255,255,255,.17)', shade: 'rgba(0,0,0,.5)' },
  white: { cloth: '#FAFAF7', seam: 'rgba(0,0,0,.18)', shade: 'rgba(0,0,0,.09)' },
};

/* Widest line decides the size, so a four-line stack never runs off the body.
   0.46em per glyph is a deliberate over-estimate for a face this condensed. */
function printMetrics(lines) {
  const longest = lines.reduce((n, l) => Math.max(n, l.length), 1);
  const size = Math.min(28, 146 / (longest * 0.46));
  return { size, leading: size * 1.04 };
}

function Cloth({ colour, id }) {
  const skin = SKIN[colour];
  return (
    <>
      <defs>
        <linearGradient id={`fold-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={skin.shade} stopOpacity=".55" />
          <stop offset="26%" stopColor={skin.shade} stopOpacity="0" />
          <stop offset="74%" stopColor={skin.shade} stopOpacity="0" />
          <stop offset="100%" stopColor={skin.shade} stopOpacity=".55" />
        </linearGradient>
      </defs>
      <path d={BODY} fill={skin.cloth} stroke={skin.seam} strokeWidth="1.2" />
      <path d={BODY} fill={`url(#fold-${id})`} />
      <path d={COLLAR} fill="none" stroke={skin.seam} strokeWidth="1.2" />
      <path d="M 120 166 L 120 178" stroke={skin.seam} strokeWidth="1.2" />
      <path d="M 280 166 L 280 178" stroke={skin.seam} strokeWidth="1.2" />
      <path d="M 126 412 L 274 412" stroke={skin.seam} strokeWidth="1" opacity=".6" />
    </>
  );
}

export function TeeFace({ colour, side, quote, id }) {
  const { size, leading } = printMetrics(quote);
  return (
    <svg className="tee-svg" viewBox="0 0 400 440" role="img"
         aria-label={`${colour} tee, ${side}`}>
      <Cloth colour={colour} id={`${id}-${side}`} />

      {side === 'back' ? (
        <g className="print" style={{ fontSize: size }}>
          {quote.map((line, i) => (
            <text key={i} x="200" y={138 + i * leading}>{line}</text>
          ))}
        </g>
      ) : (
        <g>
          <text className="print print--chest" x="200" y="150">TOO COLD</text>
          <text className="print print--since" x="200" y="164">— SINCE 2026 —</text>
        </g>
      )}
    </svg>
  );
}

let uid = 0;

export default function Tee({
  colour = 'black',
  quote = [],
  flipped: controlled,
  onFlip,
  tilt = true,
  showFlip = true,
}) {
  const [uncontrolled, setUncontrolled] = useState(false);
  const flipped = controlled === undefined ? uncontrolled : controlled;
  const tiltRef = useRef(null);
  const idRef = useRef(`t${(uid += 1)}`);

  const toggle = useCallback(() => {
    if (onFlip) onFlip(!flipped);
    else setUncontrolled((v) => !v);
  }, [flipped, onFlip]);

  /* Pointer tilt lives on a parent stage so it composes with the flip
     instead of fighting it for the same transform property. */
  useEffect(() => {
    const node = tiltRef.current;
    if (!node || !tilt) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    if (window.matchMedia('(pointer: coarse)').matches) return undefined;

    let frame = null;
    const move = (e) => {
      const box = node.getBoundingClientRect();
      const dx = (e.clientX - (box.left + box.width / 2)) / box.width;
      const dy = (e.clientY - (box.top + box.height / 2)) / box.height;
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        node.style.transform =
          `rotateY(${(dx * 13).toFixed(2)}deg) rotateX(${(-dy * 9).toFixed(2)}deg)`;
      });
    };
    const leave = () => {
      if (frame) cancelAnimationFrame(frame);
      node.style.transform = 'rotateY(0deg) rotateX(0deg)';
    };

    node.addEventListener('pointermove', move);
    node.addEventListener('pointerleave', leave);
    return () => {
      node.removeEventListener('pointermove', move);
      node.removeEventListener('pointerleave', leave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [tilt]);

  return (
    <div className="tee">
      <div className="tee-tilt" ref={tiltRef}>
        <div className={`tee-3d${flipped ? ' flipped' : ''}`}>
          <div className="tee-face">
            <TeeFace colour={colour} side="front" quote={quote} id={idRef.current} />
          </div>
          <div className="tee-face tee-face--back">
            <TeeFace colour={colour} side="back" quote={quote} id={idRef.current} />
          </div>
        </div>
        <div className="tee-shadow" aria-hidden="true" />
      </div>

      {showFlip && (
        <button type="button" className="tee-flip" data-hot onClick={toggle}
                aria-pressed={flipped}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
            <path d="M21 12a9 9 0 1 1-2.6-6.4" />
            <path d="M21 3v6h-6" />
          </svg>
          {flipped ? 'Front' : 'Back'}
        </button>
      )}
    </div>
  );
}
