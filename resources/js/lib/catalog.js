/* Mirrors database/seeders/CatalogSeeder.php — keep the two in step. */

export const CURRENCY = '€';
export const SHIPPING = 800;          // cents
export const FREE_OVER = 9000;        // cents
export const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export const money = (cents) =>
  CURRENCY + (cents / 100).toFixed(2);

export const PRODUCTS = [
  {
    id: 1,
    slug: 'more-risk-more-rizq',
    name: 'More Risk More Rizq',
    quote: ['MORE RISK', 'MORE RIZQ'],
    price: 4500,
    colours: ['black', 'white'],
    soldOut: { white: ['XXL'] },
    blurb:
      'The first thing we ever printed. Rizq is what is written for you — but nobody ' +
      'ever said it walks to your door. You go and meet it. Heavy cotton, boxy cut, ' +
      'red discharge print sitting high on the back where a collar cannot hide it.',
    spec: {
      Weight: '240 gsm',
      Cotton: '100% combed ring-spun',
      Cut: 'Boxy, drop shoulder',
      Print: 'Red discharge, upper back',
      Made: 'Portugal',
    },
  },
  {
    id: 2,
    slug: 'dirty-hands',
    name: "Don't Touch My Soul",
    quote: ["DON'T TOUCH", 'MY SOUL', 'WITH', 'YOUR DIRTY HANDS'],
    price: 4500,
    colours: ['black', 'white'],
    soldOut: { black: ['S'] },
    blurb:
      'Four lines, stacked and centred, printed the size they deserve. A boundary ' +
      'you should not have to say out loud — so we put it on your back instead. ' +
      'Same 240 gsm body, same red, longer stack.',
    spec: {
      Weight: '240 gsm',
      Cotton: '100% combed ring-spun',
      Cut: 'Boxy, drop shoulder',
      Print: 'Red discharge, upper back',
      Made: 'Portugal',
    },
  },
];

export const bySlug = (slug) => PRODUCTS.find((p) => p.slug === slug);

export const isSoldOut = (product, colour, size) =>
  Boolean(product.soldOut && product.soldOut[colour] && product.soldOut[colour].includes(size));

export const lineKey = (slug, colour, size) => `${slug}:${colour}:${size}`;

export function cartTotals(items) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_OVER ? 0 : SHIPPING;
  return { subtotal, shipping, total: subtotal + shipping };
}

export const countItems = (items) => items.reduce((n, i) => n + i.qty, 0);
