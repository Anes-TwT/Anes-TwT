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

/* Pull the font @import out to a <link> so it is not a runtime CSS fetch. */
const fonts = [...css.matchAll(/@import\s+url\((['"]?)(https:\/\/fonts\.googleapis[^)'"]+)\1\);?/g)]
  .map((m) => m[2]);
css = css.replace(/@import\s+url\((['"]?)https:\/\/fonts\.googleapis[^)'"]+\1\);?/g, '');

const head = [
  '<title>TOO COLD Drop 01</title>',
  '<link rel="preconnect" href="https://fonts.googleapis.com">',
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
  ...fonts.map((href) => `<link rel="stylesheet" href="${href}">`),
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

console.log('inlined ->', 'index.html', `${Math.round((head.length + body.length) / 1024)} KB`);
