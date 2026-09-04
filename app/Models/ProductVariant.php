<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductVariant extends Model
{
    protected $fillable = ['product_id', 'colour', 'size', 'stock'];

    protected $casts = ['stock' => 'integer'];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function inStock(int $qty = 1): bool
    {
        return $this->stock >= $qty;
    }
}
