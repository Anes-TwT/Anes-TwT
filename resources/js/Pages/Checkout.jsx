import React, { useState } from 'react';
import { Btn, Footer, useStore } from '../components/Shell.jsx';
import { bySlug, cartTotals, money } from '../lib/catalog.js';

const FIELDS = [
  { name: 'email',   label: 'Email',        wide: true },
  { name: 'first',   label: 'First name' },
  { name: 'last',    label: 'Last name' },
  { name: 'address', label: 'Address',      wide: true },
  { name: 'city',    label: 'City' },
  { name: 'post',    label: 'Postcode' },
];

const COUNTRIES = ['Portugal', 'France', 'Spain', 'Germany', 'United Kingdom',
                   'Netherlands', 'Belgium', 'Italy', 'Algeria', 'Morocco'];

export default function Checkout() {
  const { items, go, clear } = useStore();
  const { subtotal, shipping, total } = cartTotals(items);
  const [form, setForm] = useState({ country: 'Portugal' });
  const [bad, setBad] = useState({});
  const [busy, setBusy] = useState(false);

  const set = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setBad((b) => ({ ...b, [name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    FIELDS.forEach((f) => {
      if (!String(form[f.name] || '').trim()) errs[f.name] = 'Required';
    });
    if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      errs.email = 'Needs an @ and a domain';
    }
    setBad(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (items.length === 0 || !validate()) return;
    setBusy(true);
    // The Laravel build posts to /checkout here; this build settles locally.
    setTimeout(() => {
      const ref = `TC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      clear();
      go(`/order/${ref}`);
    }, 900);
  };

  return (
    <>
      <section className="co panel">
        <div className="shell">
          <span className="meta">Checkout</span>
          <h1 className="pdp-title" style={{ marginBottom: 40 }}>Almost yours</h1>

          <div className="co-grid">
            <form onSubmit={submit} noValidate>
              <div className="demo-note">
                <b>Demo</b>
                <span>
                  No payment is taken and nothing leaves this page. Wire a provider into
                  CheckoutController before going live.
                </span>
              </div>

              <fieldset className="fset">
                <legend>Where it goes</legend>
                {FIELDS.reduce((rows, field, i, all) => {
                  if (field.wide) { rows.push([field]); return rows; }
                  const last = rows[rows.length - 1];
                  if (last && last.length === 1 && !last[0].wide && !all[i - 1].wide) last.push(field);
                  else rows.push([field]);
                  return rows;
                }, []).map((row, ri) => (
                  <div className={`frow${row.length === 1 ? ' frow--1' : ''}`} key={ri}>
                    {row.map((f) => (
                      <div className={`field${bad[f.name] ? ' bad' : ''}`} key={f.name}>
                        <input
                          id={f.name}
                          type={f.name === 'email' ? 'email' : 'text'}
                          value={form[f.name] || ''}
                          className={form[f.name] ? 'has' : ''}
                          onChange={(e) => set(f.name, e.target.value)}
                          autoComplete={f.name === 'email' ? 'email' : 'on'}
                        />
                        <label htmlFor={f.name}>{f.label}</label>
                        {bad[f.name] && <span className="err">{bad[f.name]}</span>}
                      </div>
                    ))}
                  </div>
                ))}

                <div className="frow frow--1">
                  <div className="field">
                    <select id="country" className="has" value={form.country}
                            onChange={(e) => set('country', e.target.value)}>
                      {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <label htmlFor="country">Country</label>
                  </div>
                </div>
              </fieldset>

              <fieldset className="fset">
                <legend>Payment</legend>
                <div className="acc-inner" style={{ padding: 0 }}>
                  Payment is stubbed in this build — no card field is shown and no card
                  details are collected. Placing the order records it and sends you to
                  the confirmation.
                </div>
              </fieldset>

              <Btn solid wide type="submit" disabled={busy || items.length === 0}>
                {items.length === 0 ? 'Your bag is empty'
                  : busy ? 'Placing order…' : `Place order — ${money(total)}`}
              </Btn>
            </form>

            <div className="summary">
              <span className="meta">Order</span>
              <div style={{ marginTop: 20 }}>
                {items.map((item) => (
                  <div className="sum-line" key={item.key}>
                    <div>
                      <b>{bySlug(item.slug).name}</b>
                      <em>{item.colour} · {item.size} · ×{item.qty}</em>
                    </div>
                    <span>{money(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="totals" style={{ marginTop: 22 }}>
                <div className="total-row"><span>Subtotal</span><span>{money(subtotal)}</span></div>
                <div className="total-row">
                  <span>Shipping</span><span>{shipping === 0 ? 'Free' : money(shipping)}</span>
                </div>
                <div className="total-row grand"><span>Total</span><span>{money(total)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
