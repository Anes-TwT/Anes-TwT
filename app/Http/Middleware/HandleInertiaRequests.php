<?php

namespace App\Http\Middleware;

use App\Services\Cart;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        $cart = app(Cart::class);

        return array_merge(parent::share($request), [
            'cart' => $cart->lines(),
            'cartTotals' => $cart->totals(),
            'flash' => ['message' => fn () => $request->session()->get('message')],
        ]);
    }
}
