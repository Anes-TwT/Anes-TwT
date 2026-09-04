<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\Session;

/**
 * Session-backed bag. Lines are keyed "slug:colour:size" so the same key
 * arithmetic works on both sides of the wire — see lineKey() in catalog.js.
 */
class Cart
{
    private const KEY = 'bag';
    private const SHIPPING = 800;
    private const FREE_OVER = 9000;
    private const MAX_PER_LINE = 10;

    public static function key(string $slug, string $colour, string $size): string
    {
        return "{$slug}:{$colour}:{$size}";
    }

    /** @return array<string, array{slug:string,colour:string,size:string,qty:int}> */
    public function raw(): array
    {
        return Session::get(self::KEY, []);
    }

    public function add(string $slug, string $colour, string $size, int $qty = 1): void
    {
        $product = Product::where('slug', $slug)->firstOrFail();

        $variant = ProductVariant::where('product_id', $product->id)
            ->where('colour', $colour)->where('size', $size)->firstOrFail();

        abort_unless($variant->inStock($qty), 422, 'That size is sold out.');

        $bag = $this->raw();
        $key = self::key($slug, $colour, $size);
        $have = $bag[$key]['qty'] ?? 0;

        $bag[$key] = [
            'slug' => $slug,
            'colour' => $colour,
            'size' => $size,
            'qty' => min(self::MAX_PER_LINE, min($variant->stock, $have + $qty)),
        ];

        Session::put(self::KEY, $bag);
    }

    public function setQty(string $key, int $qty): void
    {
        $bag = $this->raw();
        if (! isset($bag[$key])) {
            return;
        }

        if ($qty <= 0) {
            unset($bag[$key]);
        } else {
            $bag[$key]['qty'] = min(self::MAX_PER_LINE, $qty);
        }

        Session::put(self::KEY, $bag);
    }

    public function remove(string $key): void
    {
        $bag = $this->raw();
        unset($bag[$key]);
        Session::put(self::KEY, $bag);
    }

    public function clear(): void
    {
        Session::forget(self::KEY);
    }

    /** Lines shaped for the React bag, with the product embedded. */
    public function lines(): array
    {
        $bag = $this->raw();
        if ($bag === []) {
            return [];
        }

        $products = Product::with('variants')
            ->whereIn('slug', collect($bag)->pluck('slug')->unique())
            ->get()->keyBy('slug');

        $lines = [];
        foreach ($bag as $key => $row) {
            $product = $products->get($row['slug']);
            if (! $product) {
                continue;
            }

            $lines[] = [
                'key' => $key,
                'slug' => $row['slug'],
                'colour' => $row['colour'],
                'size' => $row['size'],
                'qty' => $row['qty'],
                'price' => $product->price,
                'product' => $product->toCard(),
            ];
        }

        return $lines;
    }

    public function totals(): array
    {
        $subtotal = collect($this->lines())->sum(fn ($l) => $l['price'] * $l['qty']);
        $shipping = ($subtotal === 0 || $subtotal >= self::FREE_OVER) ? 0 : self::SHIPPING;

        return ['subtotal' => $subtotal, 'shipping' => $shipping, 'total' => $subtotal + $shipping];
    }
}
