<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->json('quote');            // the back print, one array entry per line
            $table->unsignedInteger('price'); // cents
            $table->text('blurb');
            $table->json('spec');
            $table->timestamps();
        });

        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('colour');            // black | white
            $table->string('size');              // S | M | L | XL | XXL
            $table->unsignedInteger('stock')->default(0);
            $table->timestamps();
            $table->unique(['product_id', 'colour', 'size']);
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->string('email');
            $table->string('first');
            $table->string('last');
            $table->string('address');
            $table->string('city');
            $table->string('post');
            $table->string('country');
            $table->unsignedInteger('subtotal');
            $table->unsignedInteger('shipping');
            $table->unsignedInteger('total');
            $table->string('status')->default('placed');
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained();
            $table->string('colour');
            $table->string('size');
            $table->unsignedInteger('qty');
            $table->unsignedInteger('unit_price');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('products');
    }
};
