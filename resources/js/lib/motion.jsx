import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

export const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Reveal classes are only armed once this runs, so a failed bundle or a
   crawler still sees a fully painted page rather than a blank one. */
export function useArmAnimations() {
  useLayoutEffect(() => {
    if (!reduced()) document.documentElement.classList.add('anim');
    return () => document.documentElement.classList.remove('anim');
  }, []);
}

export function useInView(options) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (reduced() || !('IntersectionObserver' in window)) { setSeen(true); return undefined; }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { setSeen(true); io.unobserve(e.target); }
      }),
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12, ...options }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [options]);
  return [ref, seen];
}

export function Reveal({ as: Tag = 'div', variant = 'reveal', className = '', children, ...rest }) {
  const [ref, seen] = useInView();
  return (
    <Tag ref={ref} className={`${variant}${seen ? ' in' : ''}${className ? ` ${className}` : ''}`} {...rest}>
      {children}
    </Tag>
  );
}

/* Per-character rise. Spaces stay real spaces so the line still wraps. */
export function SplitText({ text, className = '', delay = 0.022 }) {
  const [ref, seen] = useInView();
  return (
    <span ref={ref} className={`split${seen ? ' in' : ''}${className ? ` ${className}` : ''}`}>
      {Array.from(text).map((ch, i) => (
        <i key={i} style={{ transitionDelay: `${i * delay}s` }}>
          {ch === ' ' ? ' ' : ch}
        </i>
      ))}
    </span>
  );
}

/* Buttons lean toward the pointer, then spring back. */
export function useMagnetic(strength = 0.32) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || reduced()) return undefined;
    if (window.matchMedia('(pointer: coarse)').matches) return undefined;
    let frame = null;
    const move = (e) => {
      const b = node.getBoundingClientRect();
      const x = (e.clientX - (b.left + b.width / 2)) * strength;
      const y = (e.clientY - (b.top + b.height / 2)) * strength;
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        node.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      });
    };
    const out = () => {
      if (frame) cancelAnimationFrame(frame);
      node.style.transform = 'translate(0,0)';
    };
    node.addEventListener('pointermove', move);
    node.addEventListener('pointerleave', out);
    return () => {
      node.removeEventListener('pointermove', move);
      node.removeEventListener('pointerleave', out);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [strength]);
  return ref;
}

/* Red ring that swells over anything marked data-hot. */
export function Cursor() {
  useEffect(() => {
    if (reduced() || window.matchMedia('(pointer: coarse)').matches) return undefined;
    const ring = document.createElement('div');
    const dot = document.createElement('div');
    ring.className = 'cursor hide';
    dot.className = 'cursor-dot hide';
    document.body.append(ring, dot);

    let rx = window.innerWidth / 2; let ry = window.innerHeight / 2;
    let tx = rx; let ty = ry; let raf = null;

    const loop = () => {
      rx += (tx - rx) * 0.16;
      ry += (ty - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      dot.style.transform = `translate(${tx}px, ${ty}px)`;
      raf = requestAnimationFrame(loop);
    };
    const move = (e) => {
      tx = e.clientX; ty = e.clientY;
      ring.classList.remove('hide'); dot.classList.remove('hide');
      const hot = e.target.closest?.('a,button,[data-hot],input,select');
      ring.classList.toggle('hot', Boolean(hot));
    };
    const leave = () => { ring.classList.add('hide'); dot.classList.add('hide'); };

    window.addEventListener('pointermove', move);
    document.addEventListener('pointerleave', leave);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
      if (raf) cancelAnimationFrame(raf);
      ring.remove(); dot.remove();
    };
  }, []);
  return null;
}

export function ScrollProgress() {
  const ref = useRef(null);
  useEffect(() => {
    const bar = ref.current;
    if (!bar) return undefined;
    let raf = null;
    const draw = () => {
      raf = null;
      const max = document.body.scrollHeight - window.innerHeight;
      bar.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(draw); };
    draw();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return <div className="prog" ref={ref} aria-hidden="true" />;
}

/* Page skews a little with scroll velocity, then settles. */
export function useScrollSkew(max = 2.6) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || reduced()) return undefined;
    let last = window.scrollY; let raf = null; let skew = 0;
    const loop = () => {
      const now = window.scrollY;
      const target = Math.max(-max, Math.min(max, (now - last) * 0.12));
      last = now;
      skew += (target - skew) * 0.12;
      node.style.transform = Math.abs(skew) < 0.01 ? '' : `skewY(${skew.toFixed(3)}deg)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { if (raf) cancelAnimationFrame(raf); node.style.transform = ''; };
  }, [max]);
  return ref;
}

export function Marquee({ items, variant = '', reverse = false }) {
  const run = [...items, ...items];
  return (
    <div className={`marquee ${variant}${reverse ? ' marquee--rev' : ''}`} aria-hidden="true">
      <div className="marquee-track">
        {run.map((text, i) => (
          <span className="marquee-item" key={i}>{text}</span>
        ))}
      </div>
    </div>
  );
}

export function Intro({ onDone }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const wait = reduced() ? 200 : 2100;
    const t1 = setTimeout(() => setDone(true), wait);
    const t2 = setTimeout(() => onDone && onDone(), wait + 900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);
  return (
    <div className={`intro${done ? ' done' : ''}`} aria-hidden="true">
      <div className="intro-mark">
        <span className="intro-line"><span className="intro-word">Too</span></span>
        <span className="intro-line"><span className="intro-word">Cold</span></span>
        <span className="intro-since">— Since 2026 —</span>
        <div className="intro-bar" />
      </div>
    </div>
  );
}

export function Toast({ message }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!message) return undefined;
    setShown(true);
    const t = setTimeout(() => setShown(false), 2300);
    return () => clearTimeout(t);
  }, [message]);
  return <div className={`toast${shown ? ' on' : ''}`} role="status">{message}</div>;
}
