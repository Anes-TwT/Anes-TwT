<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class CatalogController extends Controller
{
    public function home(): Response
    {
        return Inertia::render('Home', [
            'products' => Product::with('variants')->orderBy('id')
                ->get()->map->toCard()->all(),
        ]);
    }

    public function show(Product $product): Response
    {
        $product->load('variants');

        return Inertia::render('Product', [
            'product' => $product->toCard(),
            'slug' => $product->slug,
            'others' => Product::with('variants')->whereKeyNot($product->id)
                ->get()->map->toCard()->all(),
        ]);
    }
}
