<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'category_id',
        'name',
        'description',
        'price_in_cents',
        'stock',
        'color',
        'is_component',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'category_id' => 'integer',
            'price_in_cents' => 'integer',
            'stock' => 'integer',
            'is_component' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function baseConfigurations(): HasMany
    {
        return $this->hasMany(Configuration::class, 'product_id');
    }

    public function configurations(): BelongsToMany
    {
        return $this->belongsToMany(Configuration::class, 'configuration_product')
            ->withTimestamps();
    }
}
