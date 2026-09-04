import React from 'react';
import { Btn, useStore } from '../components/Shell.jsx';

export default function Confirmation({ reference }) {
  const { go } = useStore();
  return (
    <section className="done panel">
      <div>
        <svg className="done-tick" viewBox="0 0 74 74" aria-hidden="true">
          <circle cx="37" cy="37" r="33" />
          <path d="M23 38.5 33 48l19-21" />
        </svg>
        <h1 className="done-title">Order placed</h1>
        <p className="done-no mono">{reference}</p>
        <p style={{ color: 'var(--smoke)', maxWidth: '44ch', margin: '22px auto 34px' }}>
          A confirmation would land in your inbox on a live build. Dispatched within two
          working days from Portugal.
        </p>
        <Btn onClick={() => go('/')}>Back to Too Cold</Btn>
      </div>
    </section>
  );
}
