<?php

namespace App\Http\Controllers;

use App\Services\Cart;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function __construct(private readonly Cart $cart) {}

    public function index(): Response
    {
        return Inertia::render('Cart');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'slug' => ['required', 'string', 'exists:products,slug'],
            'colour' => ['required', 'string', 'in:black,white'],
            'size' => ['required', 'string', 'in:S,M,L,XL,XXL'],
            'qty' => ['required', 'integer', 'min:1', 'max:10'],
        ]);

        $this->cart->add($data['slug'], $data['colour'], $data['size'], $data['qty']);

        return back()->with('message', 'Added to your bag.');
    }

    public function update(Request $request, string $key): RedirectResponse
    {
        $data = $request->validate(['qty' => ['required', 'integer', 'min:0', 'max:10']]);
        $this->cart->setQty($key, $data['qty']);

        return back();
    }

    public function destroy(string $key): RedirectResponse
    {
        $this->cart->remove($key);

        return back();
    }

    public function clear(): RedirectResponse
    {
        $this->cart->clear();

        return back();
    }
}
