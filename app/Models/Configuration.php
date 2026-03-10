<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Configuration extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'product_id',
        'name',
        'description',
        'image',
        'price',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'product_id' => 'integer',
            'price' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function baseProduct(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'configuration_product')
            ->withPivot(['category_id', 'qty', 'position'])
            ->withTimestamps()
            ->orderByPivot('position');
    }
}
