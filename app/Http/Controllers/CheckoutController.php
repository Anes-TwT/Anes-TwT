<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\Cart;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function __construct(private readonly Cart $cart) {}

    public function show(): Response|RedirectResponse
    {
        if ($this->cart->lines() === []) {
            return redirect('/cart');
        }

        return Inertia::render('Checkout');
    }

    /**
     * Records the order and decrements stock. Payment is deliberately not
     * wired up: no card details are collected anywhere in this flow. Add a
     * provider here before taking real money.
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'first' => ['required', 'string', 'max:80'],
            'last' => ['required', 'string', 'max:80'],
            'address' => ['required', 'string', 'max:200'],
            'city' => ['required', 'string', 'max:80'],
            'post' => ['required', 'string', 'max:20'],
            'country' => ['required', 'string', 'max:80'],
        ]);

        $lines = $this->cart->lines();
        if ($lines === []) {
            return redirect('/cart')->with('message', 'Your bag is empty.');
        }

        $totals = $this->cart->totals();

        $order = DB::transaction(function () use ($data, $lines, $totals) {
            $order = Order::create($data + [
                'reference' => Order::newReference(),
                'subtotal' => $totals['subtotal'],
                'shipping' => $totals['shipping'],
                'total' => $totals['total'],
            ]);

            foreach ($lines as $line) {
                $product = Product::where('slug', $line['slug'])->firstOrFail();

                $order->items()->create([
                    'product_id' => $product->id,
                    'colour' => $line['colour'],
                    'size' => $line['size'],
                    'qty' => $line['qty'],
                    'unit_price' => $line['price'],
                ]);

                ProductVariant::where('product_id', $product->id)
                    ->where('colour', $line['colour'])
                    ->where('size', $line['size'])
                    ->decrement('stock', $line['qty']);
            }

            return $order;
        });

        $this->cart->clear();

        return redirect("/order/{$order->reference}");
    }

    public function confirmation(Order $order): Response
    {
        return Inertia::render('Confirmation', ['reference' => $order->reference]);
    }
}
