<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Order extends Model
{
    protected $fillable = [
        'reference', 'email', 'first', 'last', 'address', 'city', 'post',
        'country', 'subtotal', 'shipping', 'total', 'status',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public static function newReference(): string
    {
        return 'TC-'.Str::upper(Str::random(6));
    }

    public function getRouteKeyName(): string
    {
        return 'reference';
    }
}
