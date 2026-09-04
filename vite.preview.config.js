/*
 * Builds the same front end as one self-contained bundle, with no Laravel and
 * no Inertia, so it can be inlined into a single HTML file for review.
 * `npm run build:preview` then `php artisan preview:inline`.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  publicDir: false,
  build: {
    outDir: 'public/preview',
    emptyOutDir: true,
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    rollupOptions: {
      input: 'resources/js/preview.jsx',
      output: {
        entryFileNames: 'preview.js',
        assetFileNames: 'preview.[ext]',
        inlineDynamicImports: true,
      },
    },
  },
});
