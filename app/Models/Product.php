<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = ['slug', 'name', 'quote', 'price', 'blurb', 'spec'];

    protected $casts = [
        'quote' => 'array',
        'spec' => 'array',
        'price' => 'integer',
    ];

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /** Shape the React pages expect — matches resources/js/lib/catalog.js. */
    public function toCard(): array
    {
        $variants = $this->relationLoaded('variants') ? $this->variants : $this->variants()->get();

        $soldOut = [];
        foreach ($variants->where('stock', '<=', 0) as $variant) {
            $soldOut[$variant->colour][] = $variant->size;
        }

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'quote' => $this->quote,
            'price' => $this->price,
            'blurb' => $this->blurb,
            'spec' => $this->spec,
            'colours' => $variants->pluck('colour')->unique()->values()->all(),
            'soldOut' => $soldOut,
        ];
    }
}
