# TOO COLD — Since 2026

Storefront for a streetwear label. Two tees in Drop 01, black and white, each with
a quote printed in red high on the back:

```
MORE RISK              DON'T TOUCH
MORE RIZQ              MY SOUL
                       WITH
                       YOUR DIRTY HANDS
```

Laravel 12 + Inertia + React 18, built with Vite.

## Running it

```bash
composer install
npm install
cp .env.example .env && php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
npm run dev          # in one terminal
php artisan serve    # in another
```

## The single-file preview

The same React front end also builds as one self-contained HTML file with no
Laravel behind it — the router and the bag run in the browser. Useful for
review, screenshots, and sending the design to someone without a PHP process.

```bash
npm run build:preview
node scripts/inline-preview.mjs
open public/preview/index.html
```

`resources/js/preview.jsx` is the standalone entry; `resources/js/app.jsx` is the
Inertia one. Every page and component below them is shared, so the preview is
the real front end rather than a mock-up of it. Pages read their data from
Inertia props when the server supplies them and fall back to
`resources/js/lib/catalog.js` when it does not.

## Layout

```
app/
  Http/Controllers/   CatalogController, CartController, CheckoutController
  Http/Middleware/    HandleInertiaRequests — shares the bag with every page
  Models/             Product, ProductVariant, Order, OrderItem
  Services/Cart.php   session bag, keyed "slug:colour:size"
database/
  migrations/         products, product_variants, orders, order_items
  seeders/            CatalogSeeder — mirrors resources/js/lib/catalog.js
resources/
  css/app.css         the whole design system, one committed visual world
  js/components/      Tee (the SVG garment), Shell (nav, bag drawer, footer)
  js/lib/motion.jsx   reveal, split text, magnetic, cursor, marquee, curtain
  js/Pages/           Home, Product, Cart, Checkout, Confirmation
scripts/
  inline-preview.mjs  folds the built bundle into one HTML file
```

## The garment

`resources/js/components/Tee.jsx` draws the tee as SVG rather than loading a
photograph, so the print can be placed exactly: red, centred on x=200, sitting
high on the back panel. The widest line of a quote decides the type size, so a
four-line stack never runs off the body.

Front and back are two faces on one `preserve-3d` stage. The back face is
pre-rotated 180°, both faces hide their backface, and the flip is a single
uninterrupted `rotateY` on the parent — no cross-fade and no repaint mid-turn.
Pointer tilt lives on a separate parent stage so it composes with the flip
instead of fighting it for the same transform property.

## Payment

Deliberately not wired up. `CheckoutController::store` records the order and
decrements stock; no card details are collected anywhere in the flow. Add a
provider there before taking real money.

## Motion

Every animation is off when the visitor asks for that — `prefers-reduced-motion`
kills the intro, the reveals, the marquee, the custom cursor and the scroll
skew. Reveal classes are only armed once React mounts, so a failed bundle shows
a fully painted page rather than a blank one.
