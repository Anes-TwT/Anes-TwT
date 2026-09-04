<?php

use App\Http\Controllers\CartController;
use App\Http\Controllers\CatalogController;
use App\Http\Controllers\CheckoutController;
use Illuminate\Support\Facades\Route;

Route::get('/', [CatalogController::class, 'home'])->name('home');
Route::get('/p/{product}', [CatalogController::class, 'show'])->name('product');

Route::get('/cart', [CartController::class, 'index'])->name('cart');
Route::post('/cart', [CartController::class, 'store'])->name('cart.store');
Route::patch('/cart/{key}', [CartController::class, 'update'])->name('cart.update');
Route::delete('/cart/{key}', [CartController::class, 'destroy'])->name('cart.destroy');
Route::delete('/cart', [CartController::class, 'clear'])->name('cart.clear');

Route::get('/checkout', [CheckoutController::class, 'show'])->name('checkout');
Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');
Route::get('/order/{order}', [CheckoutController::class, 'confirmation'])->name('order');
