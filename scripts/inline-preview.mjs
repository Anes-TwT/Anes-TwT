/*
 * Folds the built preview bundle into one HTML file with no external script or
 * style requests — only the Google Fonts stylesheet stays a link.
 *   node scripts/inline-preview.mjs
 * Emits public/preview/index.html (standalone) and public/preview/body.html
 * (same page without the document skeleton, for embedding).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'public/preview');

let css = readFileSync(resolve(out, 'preview.css'), 'utf8');
const js = readFileSync(resolve(out, 'preview.js'), 'utf8');

/*
 * The stylesheet already carries the vendored faces: resources/css/app.css
 * imports resources/fonts/fonts.css, and vite.preview.config.js inlines every
 * asset, so the woff2 files arrive here as data URIs. Nothing to rewrite —
 * just refuse to emit a page that would reach for a third-party font host.
 */
const remote = css.match(/url\(\s*['"]?https?:[^)]*\)/g);
if (remote) {
  throw new Error(`Built CSS still points off-machine: ${remote.join(', ')}`);
}

const embedded = (css.match(/url\(data:font/g) || []).length;
if (embedded === 0) {
  throw new Error('No fonts embedded — check assetsInlineLimit in vite.preview.config.js.');
}

const head = [
  '<title>TOO COLD Drop 01</title>',
  `<style>${css}</style>`,
].join('\n');

const body = `<div id="app"></div>\n<script>${js}</script>`;

writeFileSync(resolve(out, 'body.html'), `${head}\n${body}\n`);
writeFileSync(
  resolve(out, 'index.html'),
  [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<meta name="description" content="TOO COLD — Since 2026. Drop 01: two quotes printed red on 240 gsm black and white tees.">',
    head,
    '</head>',
    '<body>',
    body,
    '</body>',
    '</html>',
  ].join('\n')
);

console.log(
  'inlined -> index.html',
  `${Math.round((head.length + body.length) / 1024)} KB`,
  `(${embedded} font faces embedded, no network needed)`
);
