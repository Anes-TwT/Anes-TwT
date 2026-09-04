<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

/** Mirrors resources/js/lib/catalog.js — keep the two in step. */
class CatalogSeeder extends Seeder
{
    private const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

    public function run(): void
    {
        $spec = [
            'Weight' => '240 gsm',
            'Cotton' => '100% combed ring-spun',
            'Cut' => 'Boxy, drop shoulder',
            'Print' => 'Red discharge, upper back',
            'Made' => 'Portugal',
        ];

        $catalog = [
            [
                'slug' => 'more-risk-more-rizq',
                'name' => 'More Risk More Rizq',
                'quote' => ['MORE RISK', 'MORE RIZQ'],
                'price' => 4500,
                'blurb' => 'The first thing we ever printed. Rizq is what is written for you — '
                    .'but nobody ever said it walks to your door. You go and meet it. Heavy '
                    .'cotton, boxy cut, red discharge print sitting high on the back where a '
                    .'collar cannot hide it.',
                'spec' => $spec,
                'out' => ['white' => ['XXL']],
            ],
            [
                'slug' => 'dirty-hands',
                'name' => "Don't Touch My Soul",
                'quote' => ["DON'T TOUCH", 'MY SOUL', 'WITH', 'YOUR DIRTY HANDS'],
                'price' => 4500,
                'blurb' => 'Four lines, stacked and centred, printed the size they deserve. A '
                    .'boundary you should not have to say out loud — so we put it on your back '
                    .'instead. Same 240 gsm body, same red, longer stack.',
                'spec' => $spec,
                'out' => ['black' => ['S']],
            ],
        ];

        foreach ($catalog as $row) {
            $out = $row['out'];
            unset($row['out']);

            $product = Product::updateOrCreate(['slug' => $row['slug']], $row);

            foreach (['black', 'white'] as $colour) {
                foreach (self::SIZES as $size) {
                    $product->variants()->updateOrCreate(
                        ['colour' => $colour, 'size' => $size],
                        ['stock' => in_array($size, $out[$colour] ?? [], true) ? 0 : 25]
                    );
                }
            }
        }
    }
}
